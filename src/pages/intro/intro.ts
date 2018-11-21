import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Slides } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Geolocation } from "@ionic-native/geolocation";
import { DocFichaPage } from '../doc-ficha/doc-ficha';
import { MsgHelper } from '../../helpers/MsgHelper';
import { Hasher } from '../../helpers/Hasher';
import { Pasta } from '../../helpers/e2doc/Pasta';
import { SlideModelConverter } from '../../helpers/SlideModelConverter';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { e2docHelper } from '../../helpers/e2doc/e2docHelper';
import { SlideModel, Status } from '../../helpers/SlideModel';

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
  providers: [
    Camera,
    E2docSincronismoProvider
  ]
})
export class IntroPage {

  @ViewChild(Slides) slides: Slides;

  //icone da camera
  public imgIcoPhoto = "assets/imgs/cam.png";

  public protocolo = "";

  public extensao = ".JPG";

  //localização
  public geoPosition: any = {
    latitude: "00000",
    longitude: "00000"
  }

  //testar no sispositivo, se false não chama a camera
  public testInDevice = false;

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);

  //habilita botão assinar
  public docsIsValid = false;

  public pasta: Pasta;

  public slideModels: Array<SlideModel>;

  //intervalo da função que verifica o OCR
  public interval: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private e2doc: E2docSincronismoProvider,
    private geolocation: Geolocation,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ) {

    //obtem configuração da pasta, modelos e indices
    //refatorar depois da criação do login
    this.pasta = e2docHelper.getConfigPastaRH();

    this.slideModels = SlideModelConverter.converter(this.pasta);    
  }

  //quando a tela é carregada
  ionViewDidLoad() {

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
      this.msgHelper.presentToast(error);
    });

    //inicia fila
    this.getResponse();
  }

  goToDocFichaPage() {
    this.pasta.getIndice("VALIDACAO").setValue(this.geoPosition.latitude + "_" + this.geoPosition.longitude);

    clearInterval(this.interval);

    //chama DocFichaPage passando as informações das imagens
    this.navCtrl.push(DocFichaPage, {
      pasta: this.pasta
    });
  }

  slideNext() {
    this.slides.slideNext();
  }

  getPicture(strModeloDocumento: string): any {

    let ctx = this;

    //Se estiver testando no dispositivo, isto por que testando no PC ao chamar a camera da erro       
    if (!this.testInDevice) {

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

            //fechar loading
            loading.dismiss();

            //adiciona na fila para aguardar retorno do OCR     
            ctx.setStatus(strModeloDocumento);
            
            //passa para o proximo slide
            ctx.slideNext();

          }, (err) => {

            ctx.msgHelper.presentToast2(err);
            loading.dismiss();
          });
      });
    }
    else {

      //configura opções da camera
      const options: CameraOptions = {
        quality: 80,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        sourceType: this.camera.PictureSourceType.CAMERA,
        mediaType: this.camera.MediaType.PICTURE,
        allowEdit: true,
        saveToPhotoAlbum: false
      }

      //chama a camera e aguada o retorno
      ctx.camera.getPicture(options).then((b64string) => {

        let loading = this.loadingCtrl.create({
          spinner: 'dots',
          content: 'Aguarde, processando imagem!'
        });

        //apresenta o loading
        loading.present();

        Hasher.getHash(b64string, function (hasher) {

          //enviar imagem               
          ctx.e2doc.sendImageFromOCR(ctx.pasta.protocolo, strModeloDocumento, ctx.extensao, hasher.hash, b64string).
            then((res) => {

              //guardo retorno
              let documento = ctx.pasta.pastaDocumentos.find((doc => doc.docNome == documento));

              documento.docFileBase64 = b64string;
              documento.docFileTam = hasher.size;
              documento.docFileHash = hasher.hash;
              documento.docFileExtensao = ctx.extensao;
              documento.status = Status.Aguandando;

              let index = ctx.pasta.pastaDocumentos.findIndex((doc => doc.docNome == documento));

              //substitui no vetor
              ctx.pasta.pastaDocumentos.splice(index, 1, documento);

              //mostra o resultado
              ctx.setResult(documento);

              //fechar loading
              loading.dismiss();

              //adiciona na fila para aguardar retorno do OCR     
              ctx.setStatus(documento);

              //passa para o proximo slide
              ctx.slideNext();

            }, (err) => {
              ctx.msgHelper.presentToast("Erro ao processar imagem: " + err);
              loading.dismiss();
            });
        });
      }, (err) => {
        ctx.msgHelper.presentToast("Imagem não capturada!");
      });
    }
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
