import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Platform, MenuController, ToastController, ViewController, AlertController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { SincronismoUtil } from '../../providers/e2doc-sincronismo/e2doc-sincronismo-util';
import { ModeloPasta } from '../../helpers/e2docS/modeloPasta';
import { ModeloDoc } from '../../helpers/e2docS/ModeloDoc';
import { MsgHelper } from '../../helpers/MsgHelper';
import { Storage } from '@ionic/storage';
import { HttpProvider } from '../../providers/http/http';
import { ImagePicker } from '@ionic-native/image-picker';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { LoginPage } from '../login/login';
import { Hasher } from '../../helpers/Hasher';
import { ModeloClassificacaoPage } from '../modelo-classificacao/modelo-classificacao';

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

  public syncUtil: SincronismoUtil;

  public pasta: ModeloPasta;

  public documentos = new Array<ModeloDoc>();

  public imgDocs = new Array<{ b64: any, modelo: any } >();

  private cordova: boolean;

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);

  constructor(public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,    
    private alertCtrl: AlertController,
    private e2doc: E2docSincronismoProvider,
    private camera: Camera,
    public http: HttpProvider,
    public menuCtrl: MenuController,
    private storage: Storage,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    private imagePicker: ImagePicker) {

    this.syncUtil = new SincronismoUtil(this.e2doc);

    this.pasta = navParams.get("_pasta");

    this.cordova = this.platform.is('cordova');

    this.syncUtil.getConfigDocumento(this.pasta).then(docs => {

      this.documentos = docs;

    }, err => {
      alert(err);
    });
  }

  ionViewDidLoad() {

    this.viewCtrl.setBackButtonText('');

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {

      if (!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  goToCamera() {

    let cameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      sourceType: this.camera.PictureSourceType.CAMERA,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      saveToPhotoAlbum: true
    }

    let self = this;

    if (this.cordova) {

      self.camera.getPicture(cameraOptions).then((img_b64) => {

        img_b64 = "data:image/jpeg;base64," + img_b64;

        self.imgDocs.push( { b64: img_b64, modelo: "" } );

        self.canGoAhead();
      },
        err => {
          self.msgHelper.presentToast2("Arquivo não selecionado!");
        });
    }
    else {

      let img_b64 = "data:image/jpeg;base64," + Hasher.getBase64Example();
      self.imgDocs.push({ b64: img_b64, modelo: "" });

      self.canGoAhead();
    }
  }

  goToGaleria() {

    let self = this;

    if (self.cordova) {

      self.imagePicker.hasReadPermission().then(res => {

        if (res) {

          let options = {
            quality: 70,
            maximumImagesCount: 10,
            width: 800,
            height: 800,
            outputType: 1
          }

          self.imagePicker.getPictures(options).then((results) => {
            for (var i = 0; i < results.length; i++) {

              self.imgDocs.push({ b64: "data:image/jpeg;base64," + results[i], modelo: "" });
            }

            self.canGoAhead();

          }, (err) => {
            self.msgHelper.presentToast2("Nenhuma imagem selecionada!");
          });

        }
        else {
          self.msgHelper.presentToast2("É necessário permissão para acessar arquivos do dispositivo!");
        }
      })
    }
  }

  removeImg(index) {

    this.imgDocs.splice(index, 1);
    this.slides.slideTo(0);

  }

  canGoAhead() {

    let self = this;

    MsgHelper.presentAlert(this.alertCtrl, "Deseja capturar mais documentos ?", 
    function () {  },
    function () { self.navCtrl.push( ModeloClassificacaoPage, { _pasta: self.pasta, imgDocs: self.imgDocs } ) }, "Atenção!" );

  }

}
