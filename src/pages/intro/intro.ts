import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera';

/**
 * Generated class for the IntroPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-intro',
  templateUrl: 'intro.html',
  providers: [
    Camera
  ]
})
export class IntroPage {

  public imgRg = "assets/imgs/slide1.png";
  public imgCpf = "assets/imgs/slide2.png";
  public imgCompR = "assets/imgs/slide3.png";
  public imgFotoComRg = "assets/imgs/slide4.png";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera) {
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad IntroPage');
  }

  goToTabsPage() {
    this.navCtrl.push(TabsPage);
  }

  getPictureRG() {
    this.imgRg = this.getPicture() as string;    
  }

  getPictureCpf() {
    this.imgCpf = this.getPicture() as string;
  }

  getPictureCompR() {
    this.imgCompR = this.getPicture() as string;
  }

  getPictureFotoComRg() {
    this.imgFotoComRg = this.getPicture() as string;
  }


  getPicture() : any {

    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):

      return 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      return "erro";
    });
  }
}
