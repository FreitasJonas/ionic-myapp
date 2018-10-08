import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, DateTime } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { Geolocation } from "@ionic-native/geolocation";
import { Storage } from '@ionic/storage';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { File } from '@ionic-native/file';
import { ToastController } from 'ionic-angular';
import { disableDebugTools } from '@angular/platform-browser';

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

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private e2doc: E2docProvider,
    private geolocation: Geolocation,
    private storage: Storage,
    private galery: PhotoLibrary,
    private file: File,
    public toastCtrl: ToastController) {
  }

  ionViewDidLoad() {
    let dt = new Date();
    this.protocolo =
      dt.getFullYear().toString() + "_" +
      dt.getMonth().toString() + "_" +
      dt.getDay().toString() + "_" +
      dt.getHours().toString() + "_" +
      dt.getMinutes().toString() + "_" +
      dt.getSeconds().toString() + "_" +
      dt.getMilliseconds().toString();
  
      this.presentToast("inicio");

    this.geolocation.getCurrentPosition().then((res) => {
      this.geoPosition = res.coords;    
    }).catch((error) => {
      this.presentToast(error);
    });
  }

  goToTabsPage() {
    this.navCtrl.push(TabsPage);
  }

  getPictureRG() {
    let res = this.getPicture("rg") as string;
    console.log(res);
  }

  getPictureCpf() {
    let res = this.getPicture("cpf") as string;
    console.log(res);
  }

  getPictureCompR() {
    let res = this.getPicture("CompR") as string;
    console.log(res);
  }

  getPictureFotoComRg() {
    let res = this.getPicture("FotoComRg") as string;
    console.log(res);
  }

  getPicture(tipoDoc: string): any {

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
      let result = this.e2doc.sendImage(this.protocolo, tipoDoc, this.geoPosition, imageData);
      this.storage.set(result.protocolo, result);
      
      var path = this.file.externalRootDirectory + "\myapp";
      var contentType = this.getContentType(imageData);
      var blob = this.base64toBlob(imageData, contentType);

      this.file.writeExistingFile(path, result.nm_imagem, blob);

      this.presentToast("Salvo em " + path);

      return result;

    }, (err) => {

      this.presentToast("erro");
      return "erro";
    });
  }

  public writeFile(base64Data: any, folderName: string, fileName: any) {

    let contentType = this.getContentType(base64Data);
    let DataBlob = this.base64toBlob(base64Data, contentType);

    // here iam mentioned this line this.file.externalRootDirectory is a native pre-defined file path storage. You can change a file path whatever pre-defined method.  
    let filePath = this.file.externalRootDirectory + folderName;
    this.file.writeFile(filePath, fileName, DataBlob, contentType).then((success) => {
      this.presentToast("File Writed Successfully " + success);
    }).catch((err) => {
      this.presentToast("Error Occured While Writing File" + err);
    })
  }
  
  //here is the method is used to get content type of an bas64 data  
  public getContentType(base64Data: any) {
    let block = base64Data.split(";");
    let contentType = block[0].split(":")[1];
    return contentType;
  }

  //here is the method is used to convert base64 data to blob data  
  public base64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    let sliceSize = 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    let blob = new Blob(byteArrays, {
      type: contentType
    });
    return blob;
  }

  presentToast(msg: string) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 3000
    });
    toast.present();
  }
}
