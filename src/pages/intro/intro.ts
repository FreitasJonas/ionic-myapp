import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, DateTime } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { Geolocation } from "@ionic-native/geolocation";
import { Storage } from '@ionic/storage';

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
    private storage: Storage) {
  }

  ionViewDidLoad() {
    let dt = new Date();
    this.protocolo = 
     dt.getFullYear().toString() + "|" +
     dt.getMonth().toString() + "|" +
     dt.getDay().toString() + "|" +
     dt.getHours().toString() + "|" +
     dt.getMinutes().toString() + "|" +
     dt.getSeconds().toString() + "|" +
     dt.getMilliseconds().toString();
    
    console.log("Protoclo: " + this.protocolo);   
    
    this.geolocation.getCurrentPosition().then((res) => {
      
      this.geoPosition = res.coords;
      console.log(this.geoPosition);
      
    }).catch((error) => {

      console.log(error);

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

  getPicture(tipoDoc: string) : any {

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {

      //enviar imagem
      //guardar retorno no storage
      //salvar imagem na galeria
      //mostrar resultado

      //envia imagem e pega o retorno
      let result = this.e2doc.sendImage(this.protocolo, tipoDoc, this.geoPosition, imageData);
      
      //grava resultado no localStorage
      this.storage.set(result.protocolo, result);


      //Salva imagem na galeria, cria album MyApp

      debugger;
      
      return result;
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):

      // return 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      return "erro";
    });
  }
}
