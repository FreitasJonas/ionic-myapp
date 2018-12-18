import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, MenuController, ToastController, ViewController, Slides } from 'ionic-angular';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { ModeloPasta } from '../../helpers/e2docS/modeloPasta';
import { SincronismoUtil } from '../../providers/e2doc-sincronismo/e2doc-sincronismo-util';
import { ModeloDoc } from '../../helpers/e2docS/ModeloDoc';
import { Storage } from '@ionic/storage';
import { Camera } from '@ionic-native/camera';
import { HttpProvider } from '../../providers/http/http';
import { ImagePicker } from '@ionic-native/image-picker';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { LoginPage } from '../login/login';
import { MsgHelper } from '../../helpers/MsgHelper';
import { Hasher } from '../../helpers/Hasher';
import { ClassificacaoPage } from '../classificacao/classificacao';

@IonicPage()
@Component({
  selector: 'page-modelo-classificacao',
  templateUrl: 'modelo-classificacao.html',
  providers: [
    Camera,
    E2docSincronismoProvider
  ]
})
export class ModeloClassificacaoPage {

  @ViewChild(Slides) slides: Slides;

  public syncUtil: SincronismoUtil;

  public pasta: ModeloPasta;

  public documentos = new Array<ModeloDoc>();

  public vetImg = new Array<any>();

  private cordova: boolean;

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);

  constructor(public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
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

    this.getImage(cameraOptions);
  }

  goToGaleria() {

    if (this.cordova) {

      this.imagePicker.hasReadPermission().then(res => {

        if (res) {

          let options = {
            quality: 70,
            maximumImagesCount: 10,
            width: 800,
            height: 800,
            outputType: 1
          }

          this.imagePicker.getPictures(options).then((results) => {
            for (var i = 0; i < results.length; i++) {

              this.vetImg.push("data:image/jpeg;base64," + results[i]);
            }

          }, (err) => {
            this.msgHelper.presentToast2("Nenhuma imagem selecionada!");
          });

        }
        else {
          this.msgHelper.presentToast2("É necessário permissão para acessar arquivos do dispositivo!");
        }
      })
    }
  }

  getImage(cameraOptions) {

    let self = this;
    // let cordova = this.platform.is('cordova');

    if (this.cordova) {

      self.camera.getPicture(cameraOptions).then((img_b64) => {

        img_b64 = "data:image/jpeg;base64," + img_b64;

        self.vetImg.push(img_b64);
      },
        err => {
          self.msgHelper.presentToast2("Arquivo não selecionado!");
        });
    }
    else {

      let img_b64 = "data:image/jpeg;base64," + Hasher.getBase64Example();
      self.vetImg.push(img_b64);
    }
  }

  goToIndex() {

    if (this.vetImg.length <= 0) {

      this.msgHelper.presentToast2("Nenhuma imagem selecionada!");

    }
    else {

      this.navCtrl.push(ClassificacaoPage, { vetImg: this.vetImg });

    }
  }

  removeImg(index) {

    this.vetImg.splice(index, 1);
    this.slides.slideTo(0);

  }
}
