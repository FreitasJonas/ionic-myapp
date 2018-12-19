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
import { ClassificacaoPage } from '../classificacao/classificacao';
import { ThrowStmt } from '@angular/compiler';

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

  public imgDocs = new Array<{ b64: any, modelo: any } >();

  private cordova: boolean;

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);

  constructor(public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
    private e2doc: E2docSincronismoProvider,
    public http: HttpProvider,
    public menuCtrl: MenuController,
    private storage: Storage,
    public toastCtrl: ToastController,
    public viewCtrl: ViewController,
    private imagePicker: ImagePicker) {

    this.syncUtil = new SincronismoUtil(this.e2doc);

    this.pasta = navParams.get("_pasta");

    this.imgDocs = navParams.get("imgDocs");

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

  goToIndex() {

    console.log(this.imgDocs.some(i => i.modelo == ""));

    if( this.imgDocs.some(i => i.modelo == "") == true ) { //se houver alguma imagem sem modelo

      this.slides.slideTo(this.imgDocs.findIndex(i => i.modelo == ""));
      this.msgHelper.presentToast2("Modelo de documento não selecionado!");
            
    }
    else {

      this.navCtrl.push(ClassificacaoPage, { imgDocs: this.imgDocs, _pasta: this.pasta });

    }
  }

  removeImg(index) {

    this.imgDocs.splice(index, 1);
    this.slides.slideTo(0);

  }
}
