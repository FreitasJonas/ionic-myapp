import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
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
  public testInDevice = true;

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);

  //utilizado para gerar hash com base em base64
  private hasher = new Hasher();

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
      
      console.log(this.vetTemp);

      //guardo o retorno no storage  
      this.storage.set(this.storageKey, this.vetTemp);

      //chama DocFichaPage passando a chave do storage
      this.navCtrl.push(DocFichaPage, {
        key: this.storageKey
      });
    }
    else {
      this.msgHelper.presentToast("Por favor envie todos os documentos!");
    }
  }

  async getPictureRG() {
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

  //JSON de teste, retirar quando o webservice estiver pronto
  public getJsonTest(tipo_doc: string, b64string: string) {

    switch (tipo_doc) {
      case this.RG:
        return {
          protocolo: this.protocolo,
          location: this.geoPosition.latitude + "_" + this.geoPosition.longitude,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: this.protocolo + "_" + tipo_doc + ".jpg",
          base64: b64string,
          imgInfo: {
            nr_rg: "0000000-9",
            nm_nome: "Jonas Freitas",
            dt_nascimento: "10/12/1996"
          }
        };
      case this.CPF:
        return {
          protocolo: this.protocolo,
          location: this.geoPosition.latitude + "_" + this.geoPosition.longitude,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: this.protocolo + "_" + tipo_doc + ".jpg",
          base64: b64string,
          imgInfo: {
            nr_cpf: "55555555866"
          }
        };
      case this.COMP_RES:
        return {
          protocolo: this.protocolo,
          location: this.geoPosition.latitude + "_" + this.geoPosition.longitude,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: this.protocolo + "_" + tipo_doc + ".jpg",
          base64: b64string,
          imgInfo: {
            cep: "06226-120",
            endereco: "Rua Goiania",
            cidade: "Osasco",
            estado: "SP"
          }
        };
      case this.FOTO_DOC:
        return {
          protocolo: this.protocolo,
          location: this.geoPosition.latitude + "_" + this.geoPosition.longitude,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: this.protocolo + "_" + tipo_doc + ".jpg",
          base64: b64string,
          imgInfo: {
            foto_status: "OK"
          }
        };
    }
  }

  getPicture(tipoDoc: string): any {

    let ctx = this;

    //Se estiver testando no dispositivo, isto por que ao testar no PC ao chamar a camera da erro       
    if (!this.testInDevice) {

      let loading = this.loadingCtrl.create({
        spinner: 'dots',
        content: 'Aguarde, processando imagem!'
      });

      //apresenta o loading
      loading.present();

      let b64string = this.hasher.getBase64Example();

      ctx.hasher.getHash(b64string, function (res) {

        //enviar imagem               
        ctx.e2doc.sendImageFromOCR(ctx.protocolo, tipoDoc, ".JPG", res.hash, b64string).
          then((res) => {

            //guardo retorno
            ctx.info.push({ modelo: tipoDoc, status: res });

            //fechar loading
            loading.dismiss();

            //mostra mensagem de envio com sucesso e marca o checkbox
            switch (tipoDoc) {
              case ctx.RG:
                ctx.checkRG = ctx.checked;
                ctx.showMsgRg = true;
                break;
              case ctx.CPF:
                ctx.checkCpf = ctx.checked;
                ctx.showMsgCpf = true;
                break;
              case ctx.COMP_RES:
                ctx.checkCompR = ctx.checked;
                ctx.showMsgComp = true;
                break;
              case ctx.FOTO_DOC:
                ctx.checkFotoComRg = ctx.checked;
                ctx.showMsgFoto = true;
                break;
            }
          }, (err) => {

            ctx.msgHelper.presentToast2(err);
            loading.dismiss();
          });
      });
    }
    else {

      //configura opções da camera
      const options: CameraOptions = {
        quality: 100,
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

        ctx.hasher.getHash(b64string, function (hash) {

          //enviar imagem               
          ctx.e2doc.sendImageFromOCR(ctx.protocolo, tipoDoc, ".JPG", hash.hash, b64string).
            then((res) => {

              ctx.vetTemp.push(ctx.getJsonTest(tipoDoc, b64string));

              //guardo retorno
              ctx.info.push({ modelo: tipoDoc, status: res });

              //fechar loading
              loading.dismiss();

              //mostra mensagem de envio com sucesso e marca o checkbox
              switch (tipoDoc) {
                case ctx.RG:
                ctx.checkRG = ctx.checked;
                ctx.showMsgRg = true;
                  break;
                case ctx.CPF:
                ctx.checkCpf = ctx.checked;
                ctx.showMsgCpf = true;
                  break;
                case ctx.COMP_RES:
                ctx.checkCompR = ctx.checked;
                ctx.showMsgComp = true;
                  break;
                case ctx.FOTO_DOC:
                ctx.checkFotoComRg = ctx.checked;
                ctx.showMsgFoto = true;
                  break;
              }
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
}
