import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Slides } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { Geolocation } from "@ionic-native/geolocation";
import { DocFichaPage } from '../doc-ficha/doc-ficha';
import { MsgHelper } from '../../helpers/classes/MsgHelper';
import { Hasher } from '../../helpers/classes/Hasher';
import { Pasta } from '../../helpers/classes/e2doc/Pasta';
import { SlideModel, Status } from '../../helpers/interfaces/slideModel';
import { SlideModelConverter } from '../../helpers/interfaces/SlideModelConverter';

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
  providers: [
    Camera,
    E2docProvider
  ]
})
export class IntroPage {

  @ViewChild(Slides) slides: Slides;

  //icone da camera
  public imgIcoPhoto = "assets/imgs/cam.png";

  public protocolo = "";

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
  public validade = false;

  public pasta: Pasta;

  public docs: Array<SlideModel>;

  public interval: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private e2doc: E2docProvider,
    private geolocation: Geolocation,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ) {

    //obtem configuração da pasta, modelos e indices
    //refatorar depois da criação do login
    this.pasta = e2doc.getConfigPasta();

    this.docs = SlideModelConverter.converter(this.pasta);
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
    this.pasta.setValueIndice("VALIDACAO", this.geoPosition.latitude + "_" + this.geoPosition.longitude);

    clearInterval(this.interval);

    //chama DocFichaPage passando as informações das imagens
    this.navCtrl.push(DocFichaPage, {
      pasta: this.pasta
    });
  }

  slideNext() {
    this.slides.slideNext();
  }

  setStatus(modelo: string) {    
    let index = this.docs.findIndex((d => d.modelo == modelo));

    this.docs[index].status = Status.Aguandando;
    this.docs[index].obrigatorio = true;   
    
    this.validade = false;
  }

  getPicture(modelo: string): any {

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
        ctx.e2doc.sendImageFromOCR(ctx.pasta.protocolo, modelo, ".JPG", hasher.hash, b64string).
          then((res) => {

            //guardo retorno
            let documento = ctx.pasta.pastaDocumentos.find((doc => doc.docNome == modelo));

            documento.docFileBase64 = b64string;
            documento.docFileTam = hasher.size;
            documento.docFileHash = hasher.hash;
            documento.docFileExtensao = ".JPG";
            
            let index = ctx.pasta.pastaDocumentos.findIndex((doc => doc.docNome == modelo));
            ctx.pasta.pastaDocumentos.splice(index, 1, documento);

            //mostra o resultado
            ctx.setResult(modelo);

            //fechar loading
            loading.dismiss();

            //adiciona na fila para aguardar retorno do OCR     
            ctx.setStatus(modelo);
            
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
          ctx.e2doc.sendImageFromOCR(ctx.pasta.protocolo, modelo, ".JPG", hasher.hash, b64string).
            then((res) => {

              //guardo retorno
              let documento = ctx.pasta.pastaDocumentos.find((doc => doc.docNome == modelo));

              documento.docFileBase64 = b64string;
              documento.docFileTam = hasher.size;
              documento.docFileHash = hasher.hash;
              documento.docFileExtensao = ".JPG";

              let index = ctx.pasta.pastaDocumentos.findIndex((doc => doc.docNome == modelo));
              ctx.pasta.pastaDocumentos.splice(index, 1, documento);

              //mostra o resultado
              ctx.setResult(modelo);

              //fechar loading
              loading.dismiss();

              //adiciona na fila para aguardar retorno do OCR     
              ctx.setStatus(modelo);

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

  getResponse() {

    let ctx = this;

    //executa 6 vezes por minuto    
    ctx.interval = setInterval(() => {

      console.log("Verificando!");

      let docs = ctx.docs.filter((d => d.status == Status.Aguandando));

      docs.forEach((element) => {

        //seta os valores no indice
        ctx.setValueIndice(element.modelo);

        //valida os dados
        ctx.validade = ctx.validate();           
      });

      // //verifica se há itens na fila
      // if (ctx.fila.length > 0) {

      //   //retira um da fila
      //   let element = ctx.fila.pop();

      //   //seta os valores no indice
      //   this.setValueIndice(element.model.modelo);

      //   //valida os dados
      //   ctx.validade = ctx.validate();        
      // }

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

  validate(): boolean {

    //obtem vetor de documentos obrigatórios que não foram enviados
    let faltante = this.docs.filter((doc => doc.obrigatorio == true && doc.enviado != true));

    if (faltante.length == 0) {
      return true;
    }
    else {
      return false;
    }
  }

  setResult(modelo: string) {
    this.docs.find((doc => doc.modelo == modelo)).enviado = true;
  }

  setValueIndice(modelo: string) {

    if (modelo == "RG") {

      this.pasta.setValueIndice("RG", "000000009");

      this.pasta.setValueIndice("NOME", "Jonas Freitas");

      this.pasta.setValueIndice("DATA NASCIMENTO", "10/12/1996");
    }
    else if (modelo == "CPF") {

      this.pasta.setValueIndice("CPF", "00000000099");
    }
    else if (modelo == "COMP RESIDENCIA") {

      this.pasta.setValueIndice("CEP", "06226120");
      this.pasta.setValueIndice("RUA", "Rua Goiania");
      this.pasta.setValueIndice("CIDADE", "Osasco");
    }
  }
}
