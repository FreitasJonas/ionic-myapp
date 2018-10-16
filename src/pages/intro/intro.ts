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
  
  public imgRg = "assets/imgs/cam.png";
  public imgCpf = "assets/imgs/cam.png";
  public imgCompR = "assets/imgs/cam.png";
  public imgFotoComRg = "assets/imgs/cam.png";

  public protocolo = "";
  public geoPosition: any = {
    latitude: "00000",
    longitude: "00000"
  }

  public checked = "md-checkbox-outline";
  public unChecked = "md-close";

  public checkRG = "md-close"; //"md-checkbox-outline";
  public checkCpf = "md-close";
  public checkCompR = "md-close";
  public checkFotoComRg = "md-close";

  public RG = "RG";
  public CPF = "CPF";
  public COMP_RES = "COMP_RES";
  public FOTO_DOC = "FOTO_DOC";

  public storageKey = "e2docKeyStorage";

  public info = [];

  public testInDevice = true;

  private imageHelper = new ImageHelper();
  
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
      dt.getFullYear().toString() + 
      (dt.getMonth() + 1).toString() +
      dt.getDate().toString() + 
      dt.getHours().toString() +
      dt.getMinutes().toString() +
      dt.getSeconds().toString() +
      dt.getMilliseconds().toString();

      console.log(this.protocolo);

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

    if (this.checkRG == this.checked &&
      this.checkCpf == this.checked &&
      this.checkCompR == this.checked &&
      this.checkFotoComRg == this.checked) {

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
    this.getPicture(this.CPF);
  }

  getPictureCompR() {
    this.getPicture(this.COMP_RES);
  }

  getPictureFotoComRg() {
    this.getPicture(this.FOTO_DOC);
  }

  private getJsonTest(tipo_doc: string) {

    switch (tipo_doc) {
      case this.RG:
        return {
          protocolo: this.protocolo,     
          location: this.geoPosition.latitude + "_" + this.geoPosition.longitude,        
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
          location: this.geoPosition.latitude + "_" + this.geoPosition.longitude,        
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
          location: this.geoPosition.latitude + "_" + this.geoPosition.longitude,        
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
          location: this.geoPosition.latitude + "_" + this.geoPosition.longitude,         
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

      switch (tipoDoc) {
        case this.RG:
          this.checkRG = this.checked;
          document.getElementById("msgEnvioRg").hidden = false;
          break;
        case this.CPF:
          this.checkCpf = this.checked;
          document.getElementById("msgEnvioCpf").hidden = false;
          break;
        case this.COMP_RES:
          this.checkCompR = this.checked;
          document.getElementById("msgEnvioCompR").hidden = false;
          break;
        case this.FOTO_DOC:
          this.checkFotoComRg = this.checked;
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
        allowEdit: true,
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
                
        //var path = this.file.externalRootDirectory + "myapp";
        
        //file.writeFile(path, result.nm_imagem, blob);

        switch (result.tipo_doc) {
          case this.RG:
            this.checkRG = this.checked;
            document.getElementById("msgEnvioRg").hidden = false;
            break;
          case this.CPF:
            this.checkCpf = this.checked;
            document.getElementById("msgEnvioCpf").hidden = false;
            break;
          case this.COMP_RES:
            this.checkCompR = this.checked;
            document.getElementById("msgEnvioCompR").hidden = false;
            break;
          case this.FOTO_DOC:
            this.checkFotoComRg = this.checked;
            document.getElementById("msgEnvioFotoComRg").hidden = false;
            break;
        }
        
        this.msgHelper.presentToast("Imagem salva com sucesso!");

        return result;

      }, (err) => {

        this.msgHelper.presentToast("erro");
        return "erro";
      });
    }
  }
}
