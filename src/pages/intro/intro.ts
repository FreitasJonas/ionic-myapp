import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, DateTime, ToastController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { Geolocation } from "@ionic-native/geolocation";
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { DocFichaPage } from '../doc-ficha/doc-ficha';
import { ImageHelper } from '../../app/ImageHelper';
import { MsgHelper } from '../../app/MsgHelper';

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

  public imgRg = "assets/imgs/slide1.png";
  public imgCpf = "assets/imgs/slide2.png";
  public imgCompR = "assets/imgs/slide3.png";
  public imgFotoComRg = "assets/imgs/slide4.png";

  public protocolo = "";
  public geoPosition: Coordinates;

  public checkRG = false;
  public checkCpf = false;
  public checkCompR = false;
  public checkFotoComRg = false;

  public RG = "RG";
  public CPF = "CPF";
  public COMP_RES = "COMP_RES";
  public FOTO_DOC = "FOTO_DOC";

  public storageKey = "e2docKeyStorage";

  public info = [];

  public testInDevice = false;

  private imageHelper: ImageHelper;
  
  public msgHelper = new MsgHelper(this.toastCtrl);

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private e2doc: E2docProvider,
    private geolocation: Geolocation,
    private storage: Storage,
    public toastCtrl: ToastController,
    private file: File) {
  }

  ionViewDidLoad() {

    this.storage.clear();

    let dt = new Date();
    this.protocolo =
      dt.getFullYear().toString() + "_" +
      dt.getMonth().toString() + "_" +
      dt.getDay().toString() + "_" +
      dt.getHours().toString() + "_" +
      dt.getMinutes().toString() + "_" +
      dt.getSeconds().toString() + "_" +
      dt.getMilliseconds().toString();

    this.geolocation.getCurrentPosition().then((res) => {
      this.geoPosition = res.coords;
    }).catch((error) => {
      this.msgHelper.presentToast(error);
    });

    document.getElementById("msgEnvioRg").hidden = true;
    document.getElementById("msgEnvioCpf").hidden = true;
    document.getElementById("msgEnvioCompR").hidden = true;
    document.getElementById("msgEnvioFotoComRg").hidden = true;
  }

  goToDocFichaPage() {

    if (this.checkRG &&
      this.checkCpf &&
      this.checkCompR &&
      this.checkFotoComRg) {

      this.storage.set(this.storageKey, this.info);

      this.navCtrl.push(DocFichaPage, {
        key: this.storageKey
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
    this.getPicture(this.CPF) as string;
  }

  getPictureCompR() {
    this.getPicture(this.COMP_RES) as string;
  }

  getPictureFotoComRg() {
    this.getPicture(this.FOTO_DOC) as string;
  }

  private getJsonTest(tipo_doc: string) {

    switch (tipo_doc) {
      case this.RG:
        return {
          protocolo: this.protocolo,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: this.protocolo + "_" + tipo_doc + ".jpg",
          imgInfo: {
            nr_rg: "0000000-9",
            nm_nome: "Jonas Freitas",
            dt_nascimento: "10/12/1996"
          }
        };
      case this.CPF:
        return {
          protocolo: this.protocolo,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: this.protocolo + "_" + tipo_doc + ".jpg",
          imgInfo: {
            nr_cpf: "55555555866"
          }
        };
      case this.COMP_RES:
        return {
          protocolo: this.protocolo,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: this.protocolo + "_" + tipo_doc + ".jpg",
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
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: this.protocolo + "_" + tipo_doc + ".jpg",
          imgInfo: {
            foto_status: "OK"
          }
        };
    }
  }

  getPicture(tipoDoc: string): any {

    if (!this.testInDevice) {
      let result = this.getJsonTest(tipoDoc);

      this.info.push(result);

      switch (result.tipo_doc) {
        case this.RG:
          this.checkRG = true;
          document.getElementById("msgEnvioRg").hidden = false;
          break;
        case this.CPF:
          this.checkCpf = true;
          document.getElementById("msgEnvioCpf").hidden = false;
          break;
        case this.COMP_RES:
          this.checkCompR = true;
          document.getElementById("msgEnvioCompR").hidden = false;
          break;
        case this.FOTO_DOC:
          this.checkFotoComRg = true;
          document.getElementById("msgEnvioFotoComRg").hidden = false;
          break;
      }

    }
    else {
      
      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        sourceType: this.camera.PictureSourceType.CAMERA,
        mediaType: this.camera.MediaType.PICTURE,
        saveToPhotoAlbum: true
      }

      this.camera.getPicture(options).then((imageData) => {

        //enviar imagem
        //guardar retorno no storage
        //salvar imagem na galeria
        //mostrar resultado

        //envia imagem e pega o retorno
        let result = this.e2doc.sendImageFromOCR(this.protocolo, tipoDoc, this.geoPosition, imageData);
        this.info.push(result);

        var path = this.file.externalRootDirectory + "\myapp";
        var contentType = this.imageHelper.getContentType(imageData);
        var blob = this.imageHelper.base64toBlob(imageData, contentType);

        this.file.writeExistingFile(path, result.nm_imagem, blob);

        this.msgHelper.presentToast("Imagem salva com sucesso");

        switch (result.tipo_doc) {
          case this.RG:
            this.checkRG = true;
            document.getElementById("msgEnvioRg").hidden = false;
            break;
          case this.CPF:
            this.checkCpf = true;
            document.getElementById("msgEnvioCpf").hidden = false;
            break;
          case this.COMP_RES:
            this.checkCompR = true;
            document.getElementById("msgEnvioCompR").hidden = false;
            break;
          case this.FOTO_DOC:
            this.checkFotoComRg = true;
            document.getElementById("msgEnvioFotoComRg").hidden = false;
            break;
        }

        return result;

      }, (err) => {

        this.msgHelper.presentToast("erro");
        return "erro";
      });
    }
  }
}
