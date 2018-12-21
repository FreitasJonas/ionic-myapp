import { Component, ViewChild } from '@angular/core';
import {
  IonicPage, NavController, NavParams,
  AlertController, LoadingController, Platform,
  MenuController, ToastController, ViewController, Slides
} from 'ionic-angular';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { HomePage } from '../home/home';
import { Camera } from '@ionic-native/camera';
import { Hasher } from '../../helpers/Hasher';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { HttpProvider } from '../../providers/http/http';
import { MsgHelper } from '../../helpers/MsgHelper';
import { ClassificacaoPage } from '../classificacao/classificacao';
import { ImagePicker } from '@ionic-native/image-picker';
import { ModeloDoc } from '../../helpers/e2docS/ModeloDoc';
import { ModeloPasta } from '../../helpers/e2docS/modeloPasta';


@IonicPage()
@Component({
  selector: 'page-adiciona-documento',
  templateUrl: 'adiciona-documento.html',
  providers: [
    Camera,
    E2docSincronismoProvider
  ]
})

export class AdicionaDocumentoPage {

  @ViewChild(Slides) slides: Slides;

  public vetImg = new Array<any>();

  private cordova: boolean;

  public pastas = new Array<ModeloPasta>();
  public documentos = new Array<ModeloDoc>();

  constructor(public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private e2doc: E2docSincronismoProvider,
    private camera: Camera,
    private storage: Storage,
    public http: HttpProvider,
    public menuCtrl: MenuController,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    private imagePicker: ImagePicker) {

    this.menuCtrl.enable(true, 'app_menu');

    this.cordova = this.platform.is('cordova');

    if (this.cordova) {
      //pede por permissão - ANDROID
      this.imagePicker.requestReadPermission().then(inutil => { });
    }

    this.getConfigPasta().then(pst => {
      this.pastas = pst;

    }, err => {

      this.alertError(err);
    });
  }

  ionViewDidLoad() {

    this.viewCtrl.setBackButtonText('');

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {

      if (!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  alertError(msg) {

    //exibe alert
    this.alertCtrl.create({
      title: 'ERRO',
      message: msg,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.navCtrl.push(HomePage);
          }
        }
      ]
    }).present();
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
            MsgHelper.presentToast(this.toastCtrl, "Nenhuma imagem selecionada!");
          });

        }
        else {
          MsgHelper.presentToast(this.toastCtrl, "É necessário permissão para acessar arquivos do dispositivo!");
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
          MsgHelper.presentToast(this.toastCtrl, "Arquivo não selecionado!");
        });
    }
    else {

      let img_b64 = "data:image/jpeg;base64," + Hasher.getBase64Example();
      self.vetImg.push(img_b64);
    }
  }

  goToIndex() {

    if (this.vetImg.length <= 0) {

      MsgHelper.presentToast(this.toastCtrl, "Nenhuma imagem selecionada!");

    }
    else {

      this.navCtrl.push(ClassificacaoPage, { vetImg: this.vetImg });

    }
  }

  removeImg(index) {

    this.vetImg.splice(index, 1);
    this.slides.slideTo(0);

  }

  getConfigPasta(): Promise<any> {

    let _pastas = new Array<ModeloPasta>();

    return new Promise((resolve, reject) => {

      this.e2doc.getConfiguracao(100, "", "", "", "").then((pastas) => {

        let erro = pastas.getElementsByTagName("erro")[0];

        if (typeof erro === 'undefined') {

          let nodes = pastas.getElementsByTagName("modelos")[0].childNodes;

          for (var i = 0; i < nodes.length; i++) {

            let id = nodes[i].childNodes[0].firstChild.nodeValue;
            let nome = nodes[i].childNodes[1].firstChild.nodeValue;
            let cod = nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue;

            let pasta = new ModeloPasta();
            pasta.id = id;
            pasta.nome = nome;
            pasta.cod = cod;

            _pastas.push(pasta);
          }

          resolve(_pastas);
        }
        else {
          reject("[ERRO] Falha lendo Xml");
        }
      }, err => {

        reject(err);

      });

    });
  }
}