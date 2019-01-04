import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Platform, MenuController, ToastController, ViewController, AlertController, LoadingController } from 'ionic-angular';
import { Camera } from '@ionic-native/camera';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { MsgHelper } from '../../helpers/MsgHelper';
import { Storage } from '@ionic/storage';
import { HttpProvider } from '../../providers/http/http';
import { ImagePicker } from '@ionic-native/image-picker';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { LoginPage } from '../login/login';
import { Hasher } from '../../helpers/Hasher';
import { ClassificacaoPage } from '../classificacao/classificacao';
import { GeneralUtilities } from '../../helpers/GeneralUtilities';
import { File } from '@ionic-native/file';

@IonicPage()
@Component({
  selector: 'page-captura',
  templateUrl: 'captura.html',
  providers: [
    E2docSincronismoProvider
  ]
})
export class CapturaPage {

  @ViewChild(Slides) slides: Slides;

  private strB64 = "data:image/jpeg;base64,";

  public imgDocs = new Array<{ path: any, fileName: any, b64: any, modelo: any } >();

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
    private imagePicker: ImagePicker,
    public file: File) {

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

    let cameraOptions = GeneralUtilities.getCameraOptions(this.camera);

    let self = this;

    if (this.cordova) {

      let loading = MsgHelper.presentLoading(self.loadCtrl, "Carregando imagem!");

      loading.present();

      self.camera.getPicture(cameraOptions).then((path) => {

       let filePathName = GeneralUtilities.separatePathFromFileName(path);

        self.imgDocs.push( { path: filePathName.path, fileName: filePathName.fileName, b64: "", modelo: "" } );

        loading.dismiss();

        self.canGoAhead(self.inputTypes.camera);

        // path = self.strB64 + path;

        // self.imgDocs.push( { b64: path, modelo: "" } );

        // loading.dismiss();

        // self.canGoAhead(self.inputTypes.camera);
      },
        err => {
          loading.dismiss();

          if(self.imgDocs.length == 0) {
            MsgHelper.presentToast(self.toastCtrl, "Imagem não capturada!");
          }
          else{
            self.canGoAhead(self.inputTypes.camera);
          }
        });
    }
    else {

      let img_b64 = self.strB64 + Hasher.getBase64Example();
      self.imgDocs.push({ path: "", fileName: "", b64: img_b64, modelo: "" });

      self.canGoAhead(self.inputTypes.camera);
    }
  }

  goToGaleria() {

    let self = this;

    if (self.cordova) {

      let loading = MsgHelper.presentLoading(self.loadCtrl, "Carregando imagem!");

      //verifica se há permissão para acessar arquivos
      self.imagePicker.hasReadPermission().then(res => {

        //se houver
        if (res) {

          let options = GeneralUtilities.getImagePickerOptions();

          //abre imagens para selecionar
          self.imagePicker.getPictures(options).then((results) => {

            //se alguma imagens for selecionada
            if(results.length > 0) {

              for (var i = 0; i < results.length; i++) {

                let filePathName = GeneralUtilities.separatePathFromFileName(results[i]);

                self.imgDocs.push({ path: filePathName.path, fileName: filePathName.fileName, b64: "", modelo: "" });
              }
  
              loading.dismiss();
  
              self.canGoAhead(self.inputTypes.galeria);
            }            
            else {
              loading.dismiss();
              self.cancel();
            }

          }, (err) => {
            loading.dismiss();
            this.cancel();
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

  cancel() {

    let self = this;

    if(self.imgDocs.length == 0) {
      MsgHelper.presentToast(self.toastCtrl, "Arquivo não selecionado!");
    }
    else {
      self.canGoAhead(self.inputTypes.galeria);
    }
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
    // function () { self.navCtrl.push( ClassificacaoPage, { imgDocs: self.imgDocs } ) }, "Atenção!" );
    function () { 

      self.storage.set(GeneralUtilities.getKeyDocsStorage(), self.imgDocs).then(res => {
        self.navCtrl.push( ClassificacaoPage );
      }, err => {
        MsgHelper.presentToast(self.toastCtrl, "Erro ao salvar imagem!");
      });

    }, "Atenção!" );

  }
}
