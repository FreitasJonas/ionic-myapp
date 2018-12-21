import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Slides, MenuController, Navbar, AlertController, ViewController, Platform  } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from "@ionic-native/geolocation";
import { MsgHelper } from '../../helpers/MsgHelper';
import { Hasher } from '../../helpers/Hasher';
import { Pasta } from '../../helpers/e2doc/Pasta';
import { SlideModelConverter } from '../../helpers/SlideModelConverter';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { e2docHelper } from '../../helpers/e2doc/e2docHelper';
import { SlideModel, Status } from '../../helpers/SlideModel';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { HttpProvider } from '../../providers/http/http';
import { ContratacaoFichaPage } from '../contratacao-ficha/contratacao-ficha';

@IonicPage()
@Component({
  selector: 'page-contratacao',
  templateUrl: 'contratacao.html',
  providers: [
    Camera,
    E2docSincronismoProvider
  ]
})
export class ContratacaoPage {

  @ViewChild(Slides) slides: Slides;
  @ViewChild('navbar') navBar: Navbar;

  //icone da camera
  public imgIcoPhoto = "assets/imgs/cam.png";

  public protocolo = "";

  public extensao = ".JPG";

  //localização
  public geoPosition: any = {
    latitude: "00000",
    longitude: "00000"
  }

  //habilita botão assinar
  public docsIsValid = false;

  public pasta: Pasta;

  public slideModels: Array<SlideModel>;

  verifyCanLeave = false;

  //intervalo da função que verifica o OCR
  public interval: any;

  constructor(public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
    private camera: Camera,
    private e2doc: E2docSincronismoProvider,
    private geolocation: Geolocation,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public http: HttpProvider,
    public menuCtrl: MenuController,
    private alertCtrl: AlertController,
    public viewCtrl: ViewController
  ) {

    this.menuCtrl.enable(true, 'app_menu');

    //obtem configuração da pasta, modelos e indices
    //refatorar depois da criação do login
    this.pasta = e2docHelper.getConfigPastaRH();

    this.slideModels = SlideModelConverter.converter(this.pasta);    
  }

  //quando a tela é carregada
  ionViewDidLoad() {

    this.viewCtrl.setBackButtonText('');

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {
      
      if(!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });

    //define protocolo
    let dt = new Date();
    this.pasta.protocolo =
      dt.getFullYear().toString() +
      (dt.getMonth() + 1).toString() +
      dt.getDate().toString() +
      dt.getHours().toString() +
      dt.getMinutes().toString() +
      dt.getSeconds().toString() +
      dt.getMilliseconds().toString();

    //obtem protocolo  
    this.geolocation.getCurrentPosition().then((res) => {
      this.geoPosition = res.coords;
    }).catch((error) => {
      MsgHelper.presentToast(this.toastCtrl, error);
    });

    //inicia fila
    this.getResponse();
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

  goToDocFichaPage() {
    this.pasta.getIndice("VALIDACAO").setValue(this.geoPosition.latitude + "_" + this.geoPosition.longitude);

    clearInterval(this.interval);

    this.verifyCanLeave = false;

    //chama DocFichaPage passando as informações das imagens
    this.navCtrl.push(ContratacaoFichaPage, {
      pasta: this.pasta
    });
  }

  slideNext() {
    this.slides.slideNext();
  }

  goToCamera(strModeloDocumento) {

    let cameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.CAMERA,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      saveToPhotoAlbum: false
    }

    this.getImage(cameraOptions, strModeloDocumento);
  }

  goToGaleria(strModeloDocumento) {

    let cameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true
    }

    this.getImage(cameraOptions, strModeloDocumento);
  }

  getImage(cameraOptions, strModeloDocumento) {

    let cordova = this.platform.is('cordova');

    if (cordova) {

      this.getPictureCordova(cameraOptions, strModeloDocumento);
    }
    else {

      this.getPictureTest(strModeloDocumento);     

    }
  }

  getPictureTest(strModeloDocumento) {

    let ctx = this;
    
      let loading = this.loadingCtrl.create({
        spinner: 'dots',
        content: 'Aguarde, enviando imagem!'
      });

      //apresenta o loading
      loading.present();

      let b64string = Hasher.getBase64Example();

      Hasher.getHash(b64string, function (hasher) {

        //enviar imagem               
        ctx.e2doc.sendImageFromOCR(ctx.pasta.protocolo, strModeloDocumento, ctx.extensao, hasher.hash, b64string).
          then((res) => {

            //guardo retorno
            let documento = ctx.pasta.pastaDocumentos.find((doc => doc.docNome == strModeloDocumento));
                        
            documento.docFileBase64 = b64string;
            documento.docFileTam = hasher.size;
            documento.docFileHash = hasher.hash;
            documento.docFileExtensao = ctx.extensao;
            documento.status = Status.Aguandando;
            
            //pego o indice deste documento no vetor
            let index = ctx.pasta.pastaDocumentos.findIndex((doc => doc.docNome == strModeloDocumento));

            //substitui no vertor
            ctx.pasta.pastaDocumentos.splice(index, 1, documento);

            //mostra o resultado
            ctx.setResult(strModeloDocumento);

            //fecha loading
            loading.dismiss();

            //adiciona na fila para aguardar retorno do OCR     
            ctx.setStatus(strModeloDocumento);
            
            //passa para o proximo slide
            ctx.slideNext();

            ctx.verifyCanLeave = true;

          }, (err) => {

            MsgHelper.presentToast(this.toastCtrl, err);
            loading.dismiss();
          });
      });
  }

  getPictureCordova(options, strModeloDocumento)  {

    let ctx = this;

    //chama a camera e aguada o retorno
    ctx.camera.getPicture(options).then((b64string) => {

      let loading = this.loadingCtrl.create({
        spinner: 'dots',
        content: 'Aguarde, processando imagem!',
        dismissOnPageChange: true
      });

      //apresenta o loading
      loading.present();

      Hasher.getHash(b64string, function (hasher) {

        //enviar imagem               
        ctx.e2doc.sendImageFromOCR(ctx.pasta.protocolo, strModeloDocumento, ctx.extensao, hasher.hash, b64string).
          then((res) => {

            //guardo retorno
            let documento = ctx.pasta.pastaDocumentos.find((doc => doc.docNome == strModeloDocumento));

            documento.docFileBase64 = b64string;
            documento.docFileTam = hasher.size;
            documento.docFileHash = hasher.hash;
            documento.docFileExtensao = ctx.extensao;
            documento.status = Status.Aguandando;

            let index = ctx.pasta.pastaDocumentos.findIndex((doc => doc.docNome == strModeloDocumento));

            //substitui no vetor
            ctx.pasta.pastaDocumentos.splice(index, 1, documento);

            //mostra o resultado
            ctx.setResult(strModeloDocumento);

            //adiciona na fila para aguardar retorno do OCR     
            ctx.setStatus(strModeloDocumento);

            //fechar loading
            loading.dismiss();

            //passa para o proximo slide
            ctx.slideNext();

            ctx.verifyCanLeave = true;

          }, (err) => {
            MsgHelper.presentToast(this.toastCtrl, "Erro ao processar imagem: " + err);
            loading.dismiss();
          });
      });
    }, (err) => {
      MsgHelper.presentToast(this.toastCtrl, "Imagem não capturada!");
    });
  }

  setResult(modelo: string) {
    this.slideModels.find((doc => doc.modelo == modelo)).enviado = true;
  }

  setStatus(modelo: string) {
    let index = this.slideModels.findIndex((d => d.modelo == modelo));

    this.slideModels[index].status = Status.Aguandando;
    this.slideModels[index].obrigatorio = true;   
    
    // this.validade = false;
  }

  getResponse() {

    let ctx = this;

    //executa 6 vezes por minuto    
    ctx.interval = setInterval(() => {

      let docs = ctx.slideModels.filter((d => d.status == Status.Aguandando));
      
      docs.forEach((element) => {

        //seta os valores no indice
        ctx.setValueIndice(element.modelo);

        //valida os documentos que são obrigatórios
        ctx.docsIsValid = ctx.validateDocs();           

        //Atualiza elemento no vetor slideModels
        let iDocModel = ctx.slideModels.findIndex((d => d.modelo == element.modelo));
        element.status = Status.Verificado;
        
        ctx.slideModels[iDocModel] = element;

        //Atualiza elemento no vetor de documentos da pasta
        let iDocPasta = ctx.pasta.pastaDocumentos.findIndex((d => d.docNome == element.modelo));
        ctx.pasta.pastaDocumentos[iDocPasta].status = Status.Verificado;        
      });

      //Pede resposta
      // ctx.e2doc.getResponse(protocolo).then((res) => {

      //   //se vier "[OK]" a imagem ainda não foi processada
      //   if (res != "[OK]") {      

      //     //extrair informações e colocar em indices
      //     //ctx.indices.nome = res.nome;

      //     ctx.validade = ctx.validate();

      //     clearInterval(interval);
      //   }

      // }, (err) => {
      //   ctx.msgHelper.presentToast2(err);
      // });

    }, 3000);
  }

  validateDocs(): boolean {

    //obtem vetor de documentos obrigatórios que não foram enviados
    let faltante = this.slideModels.filter((doc => doc.obrigatorio == true && doc.enviado != true));

    if (faltante.length == 0) {
      return true;
    }
    else {
      return false;
    }
  }

  setValueIndice(modelo: string) {

    if (modelo == "RG") {

      this.pasta.getIndice("RG").setValue("000000009");

      this.pasta.getIndice("NOME").setValue("Jonas Freitas");

      this.pasta.getIndice("DATA NASCIMENTO").setValue("10/12/1996");
    }
    else if (modelo == "CPF") {

      this.pasta.getIndice("CPF").setValue("00000000099");
    }
    else if (modelo == "COMP RESIDENCIA") {

      this.pasta.getIndice("CEP").setValue("06226120");
      this.pasta.getIndice("RUA").setValue("Rua Goiania");
      this.pasta.getIndice("CIDADE").setValue("Osasco");
    }
  }

}
