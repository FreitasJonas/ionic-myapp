import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, Slides } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { Geolocation } from "@ionic-native/geolocation";
import { Storage } from '@ionic/storage';
import { DocFichaPage } from '../doc-ficha/doc-ficha';
import { MsgHelper } from '../../app/MsgHelper';
import { Hasher } from '../../app/Hasher';

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

  //classe do checkbox para checado e não checado
  public checked = "md-checkbox-outline";
  public unChecked = "md-close";

  //inicia checkbox não checado
  public checkRG = this.unChecked;
  public checkCpf = this.unChecked;
  public checkCompR = this.unChecked;
  public checkFotoComRg = this.unChecked;

  //esconde mensagem
  public showMsgRg = false;
  public showMsgCpf = false;
  public showMsgComp = false;
  public showMsgFoto = false;

  //modelos de documento
  public RG = "RG";
  public CPF = "CPF";
  public COMP_RES = "COMP RESIDENCIA";
  public FOTO_DOC = "FOTO E DOC";

  //chava do storage
  public storageKey = "e2docKeyStorage";

  //obj onde será guardo as informações das imagens que retornarem do ws
  public info = [];

  public vetTemp = [];

  //testar no sispositivo, se false não chama a camera
  public testInDevice = false;

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);

  //utilizado para gerar hash com base em base64
  private hasher = new Hasher();

  //habilita botão assinar
  public validade = false;

  public showBtnPossuoRG = true;
  public showbtnPossuoCpf = true;
  public showbtnPossuoComp = true;
  
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private e2doc: E2docProvider,
    private geolocation: Geolocation,
    private storage: Storage,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController
  ) {
  }

  //quando a tela é carregada
  ionViewDidLoad() {

    this.storage.clear();
    this.reset();

    //define protocolo
    let dt = new Date();
    this.protocolo =
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
  }

  reset() {

    this.showMsgRg = false;
    this.showMsgCpf = false;
    this.showMsgFoto = false;
    this.showMsgComp = false;

    this.checkRG = this.unChecked;
    this.checkCpf = this.unChecked;
    this.checkCompR = this.unChecked;
    this.checkFotoComRg = this.unChecked;
  }

  goToDocFichaPage() {

    //verifica se todos os documentos foram enviados
    if (this.checkRG == this.checked &&
      this.checkCpf == this.checked &&
      this.checkCompR == this.checked &&
      this.checkFotoComRg == this.checked) {

      var info = {
        protocolo: this.protocolo,
        indices: {
          nome: "Jonas",
          rg: "000000009",
          cpf: "00000000088",
          dt_nascimento: "10/12/1996",
          cep: "06226120",
          rua: "Rua Goiania",
          cidade: "Osasco - SP",
          validacao: this.geoPosition.latitude + "_" + this.geoPosition.longitude
        },
        imgs: this.vetTemp
      }

      //guardo o retorno no storage  
      //this.storage.set(this.storageKey, this.vetTemp);

      //chama DocFichaPage passando a chave do storage
      this.navCtrl.push(DocFichaPage, {
        info: info
      });
    }
    else {
      this.msgHelper.presentToast("Por favor envie todos os documentos!");
    }
  }

  getPictureRG() {
    this.getPicture(this.RG);
  }

  getPictureCpf() {
    this.getPicture(this.CPF);
  }

  getPictureCompR() {
    this.getPicture(this.COMP_RES);
  }

  getPictureFotoComRg() {
    this.getPicture(this.FOTO_DOC);
  }

  slideNext(tipoDoc){
    this.setValuesFromDoc(tipoDoc);
    this.slides.slideNext();
  }

  getPicture(tipoDoc: string): any {

    let ctx = this;

    //Se estiver testando no dispositivo, isto por que ao testar no PC ao chamar a camera da erro       
    if (!this.testInDevice) {

      let loading = this.loadingCtrl.create({
        spinner: 'dots',
        content: 'Aguarde, enviando imagem!'
      });

      //apresenta o loading
      loading.present();

      let b64string = this.hasher.getBase64Example();

      ctx.hasher.getHash(b64string, function (hasher) {

        //enviar imagem               
        ctx.e2doc.sendImageFromOCR(ctx.protocolo, tipoDoc, ".JPG", hasher.hash, b64string).
          then((res) => {

            //guardo retorno
            ctx.vetTemp.push({
              tipo_doc: tipoDoc,
              b64string: b64string,
              size: hasher.size,
              hash: hasher.hash,
              extensao: ".JPG"
            });

            //fechar loading
            loading.dismiss();
            ctx.slideNext(tipoDoc);

            ctx.getInfo(tipoDoc, ctx.protocolo);

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
        saveToPhotoAlbum: true
      }

      //chama a camera e aguada o retorno
      ctx.camera.getPicture(options).then((b64string) => {

        let loading = this.loadingCtrl.create({
          spinner: 'dots',
          content: 'Aguarde, processando imagem!'
        });

        //apresenta o loading
        loading.present();

        ctx.hasher.getHash(b64string, function (hasher) {

          //enviar imagem               
          ctx.e2doc.sendImageFromOCR(ctx.protocolo, tipoDoc, ".JPG", hasher.hash, b64string).
            then((res) => {

              ctx.vetTemp.push({
                tipo_doc: tipoDoc,
                b64string: b64string,
                size: hasher.size,
                hash: hasher.hash,
                extensao: ".JPG"
              });

              //fechar loading
              loading.dismiss();

              ctx.slideNext(tipoDoc);

              ctx.getInfo(tipoDoc, ctx.protocolo);

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

  getInfo(tipoDoc: string, protocolo: string) {
    let ctx = this;

    ctx.e2doc.getResponse(protocolo).then((res) => {

      this.setValuesFromDoc(tipoDoc);

      ctx.validade = ctx.validate();

    }, (err) => {
      ctx.msgHelper.presentToast2(err);
    });    
  }

  validate(): boolean {

    if (this.checkRG == this.checked &&
      this.checkCpf == this.checked &&
      this.checkCompR == this.checked &&
      this.checkFotoComRg == this.checked) {
      return true;
    }
    else {
      return false;
    }
  }

  setValuesFromDoc(tipoDoc: string) {

    let ctx = this;

    //mostra mensagem de envio com sucesso e marca o checkbox
    switch (tipoDoc) {
      case ctx.RG:
        ctx.checkRG = ctx.checked;
        ctx.showMsgRg = true;
        ctx.showBtnPossuoRG = false;
        break;
      case ctx.CPF:
        ctx.checkCpf = ctx.checked;
        ctx.showMsgCpf = true;
        ctx.showbtnPossuoCpf = false;
        break;
      case ctx.COMP_RES:
        ctx.checkCompR = ctx.checked;
        ctx.showMsgComp = true;
        ctx.showbtnPossuoComp = false;
        break;
      case ctx.FOTO_DOC:
        ctx.checkFotoComRg = ctx.checked;
        ctx.showMsgFoto = true;          
        break;
    }
  }
}
