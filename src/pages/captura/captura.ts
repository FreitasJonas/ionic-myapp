import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Platform, MenuController, ToastController, ViewController, AlertController, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { MsgHelper } from '../../helpers/MsgHelper';
import { Storage } from '@ionic/storage';
import { HttpProvider } from '../../providers/http/http';
import { ImagePicker } from '@ionic-native/image-picker';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { LoginPage } from '../login/login';
import { Hasher } from '../../helpers/Hasher';
import { ClassificacaoPage } from '../classificacao/classificacao';

@IonicPage()
@Component({
  selector: 'page-captura',
  templateUrl: 'captura.html',
  providers: [
    Camera,
    E2docSincronismoProvider
  ]
})
export class CapturaPage {

  @ViewChild(Slides) slides: Slides;

  private strB64 = "data:image/jpeg;base64,";

  public imgDocs = new Array<{ b64: any, modelo: any } >();

  private cordova: boolean;

  public inputTypes = { camera: "CAMERA", galeria: "GALERIA" }

  constructor(public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,   
    public loadCtrl: LoadingController, 
    private alertCtrl: AlertController,
    private camera: Camera,
    public http: HttpProvider,
    public menuCtrl: MenuController,
    private storage: Storage,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    private imagePicker: ImagePicker) {

    this.cordova = this.platform.is('cordova');

    if (this.cordova) {
      //pede por permissão - ANDROID
      this.imagePicker.requestReadPermission().then(inutil => { });
    }
  }

  ionViewDidLoad() {

    this.viewCtrl.setBackButtonText('');

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {

      if (!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  goToCamera() {

    let cameraOptions : CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.CAMERA,
      mediaType: this.camera.MediaType.PICTURE,
      targetHeight: 800,
      targetWidth: 800,
      allowEdit: false,
      saveToPhotoAlbum: true
    }

    let self = this;

    if (this.cordova) {

      let loading = MsgHelper.presentLoading(self.loadCtrl, "Carregando imagem!");

      loading.present();

      self.camera.getPicture(cameraOptions).then((img_b64) => {

        img_b64 = self.strB64 + img_b64;

        self.imgDocs.push( { b64: img_b64, modelo: "" } );

        loading.dismiss();

        self.canGoAhead(self.inputTypes.camera);
      },
        err => {
          loading.dismiss();

          if(self.imgDocs.length == 0) {
            MsgHelper.presentToast(self.toastCtrl, "Arquivo não capturada!");
          }
          else{
            self.canGoAhead(self.inputTypes.camera);
          }
        });
    }
    else {

      let img_b64 = self.strB64 + Hasher.getBase64Example();
      self.imgDocs.push({ b64: img_b64, modelo: "" });

      self.canGoAhead(self.inputTypes.camera);
    }
  }

  goToGaleria() {

    let self = this;

    if (self.cordova) {

      let loading = MsgHelper.presentLoading(self.loadCtrl, "Carregando imagem!");

      self.imagePicker.hasReadPermission().then(res => {

        if (res) {

          let options = {
            quality: 50,
            maximumImagesCount: 20,
            width: 800,
            height: 800,
            outputType: 1
          }

          self.imagePicker.getPictures(options).then((results) => {
            for (var i = 0; i < results.length; i++) {

              self.imgDocs.push({ b64: self.strB64 + results[i], modelo: "" });
            }

            loading.dismiss();

            self.canGoAhead(self.inputTypes.galeria);

          }, (err) => {
            loading.dismiss();
            
            if(self.imgDocs.length == 0) {
              MsgHelper.presentToast(self.toastCtrl, "Arquivo não selecionado!");
            }
            else{
              self.canGoAhead(self.inputTypes.galeria);
            }
          });

        }
        else {
          MsgHelper.presentToast(self.toastCtrl, "É necessário permissão para acessar arquivos do dispositivo!");
        }
      })
    }
  }

  removeImg(index) {

    this.imgDocs.splice(index, 1);
    this.slides.slideTo(0);

  }

  canGoAhead(inputType) {

    let self = this;

    MsgHelper.presentAlert(self.alertCtrl, "Deseja capturar mais documentos?", 
    function () { 

      if(inputType == self.inputTypes.galeria) { 
        MsgHelper.presentAlert(self.alertCtrl, "Câmera ou Galeria?", 
        function () { self.goToCamera(); },
         function ( ) { self.goToGaleria() },
          "Atenção!", "Câmera", "Galeria");        
    }
    else {
      self.goToCamera();
    }
   },
    function () { self.navCtrl.push( ClassificacaoPage, { imgDocs: self.imgDocs } ) }, "Atenção!" );

  }

}
