import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { MsgHelper } from '../../helpers/classes/MsgHelper';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { File } from '@ionic-native/file';
import { IntroPage } from '../intro/intro';
import { Hasher } from '../../helpers/classes/Hasher';

@IonicPage()
@Component({
  selector: 'page-doc-ficha',
  templateUrl: 'doc-ficha.html',
})
export class DocFichaPage {

  @ViewChild(SignaturePad) signaturePad: SignaturePad;

  //campos do form
  public nome = "";
  public rg = "";
  public cpf = "";
  public dt_nascimento = "";
  public cep = "";
  public rua = "";
  public cidade = "";
  
  //protocolo
  public protocolo: string;

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);
  
  //base64 da assinatura
  public signatureImage: string;

  //objeto onse é guardado as informações
  public info: any;

  //canvas da assinatura
  public signatureCanvas;
  
  //Opções do canvas da assinatura
  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 2,
    'canvasWidth': 380,
    'canvasHeight': 250
  };

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public toastCtrl: ToastController,
    private e2doc: E2docProvider,
    private file: File,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {

    //obtem a chave do storage recebido por parametro
    this.info = this.navParams.get('info');

    //seta os valores dos campos via binding (valores são atualizados automaticamente)
    this.protocolo = this.info.protocolo;
    this.nome = this.info.indices.nome;
    this.rg = this.info.indices.rg;
    this.dt_nascimento = this.info.indices.dt_nascimento;

    this.cpf = this.info.indices.cpf;

    this.cep = this.info.indices.cep;
    this.rua = this.info.indices.rua;
    this.cidade = this.info.indices.cidade;

    console.log(this.info.imgs[0]);
  }

  goToIntoPage(mensagem: string) {

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
            this.navCtrl.push(IntroPage);
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
            this.navCtrl.push(IntroPage);
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
      var campos = this.getStringCampos();

      //feito desta forma por que de forma assincrona as multiplas requisições
      //davam erro no servidor, desta forma é necessário encadear as funções 
      //para que uma requisição não atropele a outra
      //BUSCAR MANEIRA MAIS EFICIENTE UTILIZANDO LOOPING

      var i = 0;

      //passa o vetor e o indice do objeto a ser enviado, quando o envio é 
      //finalizado o indice é incrementado e a função chamada novamente
      this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
        i++;
        ctx.msgHelper.presentToast2(res);

        this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
          i++;
          ctx.msgHelper.presentToast2(res);

          this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
            i++;
            ctx.msgHelper.presentToast2(res);

            this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {
              i++;
              ctx.msgHelper.presentToast2(res);

              this.e2doc.enviarDocumentos(vetDoc, i, campos).then(res => {      
                
                //ao final o loading é finalizado                
                loading.dismiss();

                //exibe toast com mensagem
                ctx.msgHelper.presentToast2(res);

                ctx.goToIntoPage("Envio finalizado com sucesso!");

              }, (err) => {       
                loading.dismiss();         
                ctx.goToIntoPage(err);
              });
            }, (err) => {         
              loading.dismiss();     
              ctx.goToIntoPage(err);
            });
          }, (err) => {
            loading.dismiss();
            ctx.goToIntoPage(err);
          });
        }, (err) => {
          loading.dismiss();
          ctx.goToIntoPage(err);
        });
      }, (err) => {
        loading.dismiss();
        ctx.goToIntoPage(err);
      });      
    });
  }

  getVetDoc(): Promise<any> {

    let ctx = this;

    //obtem base64 de exemplo
    //let base64 = Hasher.getBase64Example();

    return new Promise((resolve) => {

      //cria vetor onde será armazenado os dados do arquivo
      let vetDoc = [];

      //itera sobre os dados passados da intro
      ctx.info.imgs.forEach((element, index) => {

        //substituir por
        // this.hasher.getHash(element.b64string, function (res) {

        // this.hasher.getHash(base64, function (res) {
          
          var fileName = ctx.info.protocolo + "_" + index + ".JPG";

          vetDoc.push({                                 
            modelo: element.tipo_doc,                       //modelo de documento
            descricao: element.tipo_doc,                    //modelo de documento
            path: "/myapp/" + fileName,                     //caminho do arquivo, não possui por que não é salvo no disposiivo
            fileString: element.b64string,                  //string binaria do arquivo         
            length: element.size,                           //tamanho em bytes do arquivo
            paginas: 1,                                     //arquivo sempre será de 1 pagina
            hash: element.hash,                             //hash gerado a partir da string binaria
            extensao: element.extensao,                     //sempre .jpg
            id_doc: index,                                  //ordem do documento, indice do loop
            protocolo: ctx.info.protocolo + "_" + index,     //protocolo + ordem do documento
            fileNamePart: ctx.info.protocolo + "_" + index + ".JPG" //nome da parte, será sempre apenas uma parte
          // });
        });
      });

      //base64 da imagem do canvas(assinatura)
      ctx.signatureImage = ctx.signaturePad.toDataURL().split(",")[1];

      Hasher.getHash(ctx.signatureImage, function (res) {

        var fileName = ctx.info.protocolo + "_" + vetDoc.length + ".PNG";

        vetDoc.push({
          modelo: "ASSINATURA",                     //modelo de documento
          descricao: "ASSINATURA",                  //modelo de documento
          path: "/myapp/" + fileName,               //caminho do arquivo, não possui por que não é salvo no disposiivo
          fileString: res.base64,                   //string binaria do arquivo         
          length: res.size,                         //tamanho em bytes do arquivo
          paginas: 1,                               //arquivo sempre será de 1 pagina
          hash: res.hash,                           //hash gerado a partir da string binaria
          extensao: ".PNG",                         //sempre .jpg
          id_doc: vetDoc.length,                    //ordem do documento, indice do loop
          protocolo: ctx.protocolo + "_" + vetDoc.length,         //protocolo + ordem do documento
          fileNamePart: fileName    //nome da parte, será sempre apenas uma parte
        });
      });

      resolve(vetDoc);
    });
  }

  private getStringCampos(): string {

    var campos = `<![CDATA[<indice0>NOME</indice0><valor0>{0}</valor0>
      <indice1>RG</indice1><valor1>{1}</valor1>
      <indice2>CPF</indice2><valor2>{2}</valor2>
      <indice3>DATA NASCIMENTO</indice3><valor3>{3}</valor3>
      <indice4>CEP</indice4><valor4>{4}</valor4>
      <indice5>RUA</indice5><valor5>{5}</valor5>
      <indice6>CIDADE</indice6><valor6>{6}</valor6>
      <indice7>VALIDACAO</indice7><valor7>{7}</valor7>]]>`;

    campos = campos.replace("{0}", this.nome);
    campos = campos.replace("{1}", this.rg);
    campos = campos.replace("{2}", this.cpf);
    campos = campos.replace("{3}", this.dt_nascimento);
    campos = campos.replace("{4}", this.cep);
    campos = campos.replace("{5}", this.rua);
    campos = campos.replace("{6}", this.cidade);
    campos = campos.replace("{7}", this.info.indices.validacao);

    return campos;
  }
}
