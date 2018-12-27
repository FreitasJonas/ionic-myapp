import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, AlertController, MenuController, Navbar, ViewController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { MsgHelper } from '../../helpers/MsgHelper';
import { Hasher } from '../../helpers/Hasher';
import { Pasta } from '../../helpers/e2doc/Pasta';
import { IndiceModel } from '../../helpers/IndiceModel';
import { IndiceModelConverter } from '../../helpers/IndiceModelConverter';
import { Status } from '../../helpers/SlideModel';
import { e2docHelper } from '../../helpers/e2doc/e2docHelper';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { HomePage } from '../home/home';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { LoginPage } from '../login/login';
import { HttpProvider } from '../../providers/http/http';
import { ContratacaoPage } from '../contratacao/contratacao';

@IonicPage()
@Component({
  selector: 'page-contratacao-ficha',
  templateUrl: 'contratacao-ficha.html',
})
export class ContratacaoFichaPage {
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild('navbar') navBar: Navbar;
  
  //protocolo
  public protocolo: string;

  //base64 da assinatura
  public signatureImage: string;

  //objeto onse é guardado as informações
  public info: any;

  //canvas da assinatura
  public signatureCanvas;

  //pasta
  public pasta: Pasta; 

  //Indice Model
  public indices: Array<IndiceModel>;

  //verifica se exibe ou não mensagem ao sair desta pagina
  verifyCanLeave = true;
  
  //Opções do canvas da assinatura
  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 2,
    'canvasWidth': 310,
    'canvasHeight': 200,
    'backgroundColor': '#f8f8f8',
  };

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public toastCtrl: ToastController,
    private e2doc: E2docSincronismoProvider,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public http: HttpProvider,
    public menuCtrl: MenuController,
    public viewCtrl: ViewController
    ) {

      this.menuCtrl.enable(true, 'app_menu');

      //obtem a chave do storage recebido por parametro
      this.pasta = this.navParams.get('pasta');      
            
      this.indices = IndiceModelConverter.converter(this.pasta);      
  }

  ionViewDidLoad() {

    this.viewCtrl.setBackButtonText('');

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {
      
      if(!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  ionViewCanLeave() : Promise<void> {

    return new Promise((resolve, reject) => {

      if(this.verifyCanLeave) {

        MsgHelper.presentAlert(this.alertCtrl, "Deseja cancelar esta opeação?", 
        function() { resolve() },
        function () { reject() });    
      }
      else {
        resolve();
      }      
    });   
  }

  goToHomePage(mensagem: string) {

    //exibe alert
    this.alertCtrl.create({
      title: '',
      message: mensagem,
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            //retorna para intro
            this.navCtrl.push(HomePage);
          }
        }                    
      ]
    }).present();   
    
  }

  //limpa canvas da assinatura
  drawClear() {
    this.signaturePad.clear();
  }

  cancelar() {

    //exibe alert
    this.alertCtrl.create({
      title: 'CANCELAR',
      message: 'Tem certeza de que deseja cancelar a operação?',
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            //retorna para intro
            this.navCtrl.push(ContratacaoPage);
          }
        },
        {
          text: 'Não',
          role: 'cancel'          
        }       
      ]
    }).present();      
  }  

  drawComplete() {

    //cria loading
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Aguarde, sincronizando com o e2docCloud'
    });

    //mostra loading
    loading.present();

    //salva contexto da classe
    let ctx = this;

    //obtem objeto com as informações das imagens
    this.getVetDoc().then((vetDoc) => {

      //obtem string dos campos com os valores
      var campos = e2docHelper.getStringIndices(this.indices);

      //feito desta forma por que de forma assincrona as multiplas requisições
      //davam erro no servidor, desta forma é necessário encadear as funções 
      //para que uma requisição não atropele a outra
      //BUSCAR MANEIRA MAIS EFICIENTE UTILIZANDO LOOPING

      var i = 0;

      //passa o vetor e o indice do objeto a ser enviado, quando o envio é 
      //finalizado o indice é incrementado e a função chamada novamente
      this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
        i++;
        MsgHelper.presentToast(ctx.toastCtrl, res);
        this.verifyCanLeave = false;  //quando primeiro documento é enviado, mensagem de verificação ao sair não precisa ser exibida

        this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
          i++;
          MsgHelper.presentToast(ctx.toastCtrl, res);

          this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
            i++;
            MsgHelper.presentToast(ctx.toastCtrl, res);

            this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
              i++;
              MsgHelper.presentToast(ctx.toastCtrl, res);

              this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
                
                //ao final o loading é finalizado                
                loading.dismiss();

                //exibe toast com mensagem
                MsgHelper.presentToast(ctx.toastCtrl, res);

                ctx.goToHomePage("Envio finalizado com sucesso!");

              }, (err) => {
                loading.dismiss();         
                ctx.goToHomePage(err);
              });
            }, (err) => {
              loading.dismiss();     
              ctx.goToHomePage(err);
            });
          }, (err) => {
            loading.dismiss();
            ctx.goToHomePage(err);
          });
        }, (err) => {
          loading.dismiss();
          ctx.goToHomePage(err);
        });
      }, (err) => {
        loading.dismiss();
        ctx.goToHomePage(err);
      });      
    });
  }

  getVetDoc(): Promise<any> {

    let ctx = this;

    return new Promise((resolve) => {

      //cria vetor onde será armazenado os dados do arquivo
      let vetDoc = [];

      //itera sobre os documentos que foram enviados e verificados
      ctx.pasta.pastaDocumentos.filter((d => d.status == Status.Verificado)).forEach((element, index) => {
          
          var fileName = ctx.pasta.protocolo + "_" + index + ".JPG";

          vetDoc.push({                   
            modeloPasta: ctx.pasta.pastaNome,              
            modelo: element.docNome,                                  //modelo de documento
            descricao: element.docNome,                               //modelo de documento
            path: "/myapp/" + fileName,                               //caminho do arquivo, não possui por que não é salvo no disposiivo
            fileString: element.docFileBase64,                        //string binaria do arquivo         
            length: element.docFileTam,                               //tamanho em bytes do arquivo
            paginas: 1,                                               //arquivo sempre será de 1 pagina
            hash: element.docFileHash,                                //hash gerado a partir da string binaria
            extensao: element.docFileExtensao,                        //sempre .jpg
            id_doc: index,                                            //ordem do documento, indice do loop
            protocolo: ctx.pasta.protocolo + "_" + index,             //protocolo + ordem do documento
            fileNamePart: ctx.pasta.protocolo + "_" + index + ".JPG"  //nome da parte, será sempre apenas uma parte
        });
      });

      //base64 da imagem do canvas(assinatura)
      ctx.signatureImage = ctx.signaturePad.toDataURL().split(",")[1];

      Hasher.getHash(ctx.signatureImage, function (res) {

        var fileName = ctx.pasta.protocolo + "_" + vetDoc.length + ".PNG";

        vetDoc.push({
          modeloPasta: ctx.pasta.pastaNome,              
          modelo: "ASSINATURA",                                     //modelo de documento
          descricao: "ASSINATURA",                                  //modelo de documento
          path: "/myapp/" + fileName,                               //caminho do arquivo, não possui por que não é salvo no disposiivo
          fileString: res.base64,                                   //string binaria do arquivo         
          length: res.size,                                         //tamanho em bytes do arquivo
          paginas: 1,                                               //arquivo sempre será de 1 pagina
          hash: res.hash,                                           //hash gerado a partir da string binaria
          extensao: ".PNG",                                         //sempre .jpg
          id_doc: vetDoc.length,                                    //ordem do documento, indice do loop
          protocolo: ctx.pasta.protocolo + "_" + vetDoc.length,     //protocolo + ordem do documento
          fileNamePart: fileName                                    //nome da parte, será sempre apenas uma parte
        });
      });

      resolve(vetDoc);
    });
  } 

}
