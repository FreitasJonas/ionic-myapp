import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, MenuController, AlertController, LoadingController, ViewController, Loading, Slides, Content } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { MsgHelper } from '../../helpers/MsgHelper';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { ModeloPasta } from '../../helpers/e2docS/modeloPasta';
import { ModeloIndice } from '../../helpers/e2docS/ModeloIndice';
import { HomePage } from '../home/home';
import { IndiceValidator } from '../../helpers/e2docS/IndiceValidator';
import { SyncHelper } from '../../helpers/e2docS/SyncHelper';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { HttpProvider } from '../../providers/http/http';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { SincronismoUtil } from '../../providers/e2doc-sincronismo/e2doc-sincronismo-util';
import { ModeloDoc } from '../../helpers/e2docS/ModeloDoc';
import { CapturaPage } from '../captura/captura';
import { PhotoEditorPage } from '../photo-editor/photo-editor';
import { GeneralUtilities } from '../../helpers/GeneralUtilities';
import { File } from '@ionic-native/file';
import { Crop } from '@ionic-native/crop';

@IonicPage()
@Component({
  selector: 'page-classificacao',
  templateUrl: 'classificacao.html',
})
export class ClassificacaoPage {

  @ViewChild(Slides) slides: Slides;
  @ViewChild(Content) content: Content;

  public indicesReady: boolean;

  public imgDocs = new Array<{ path: any, fileName: any, b64: any, modelo: any }>();
  public imgDocsTemp = new Array<{ path: any, fileName: any, b64: any, modelo: any }>();

  public pasta: ModeloPasta;

  public pastas = new Array<ModeloPasta>();
  public documentos = new Array<ModeloDoc>();
  public indices = new Array<ModeloIndice>();

  public verifyOnLeave;

  public loading: Loading;

  public syncUtil: SincronismoUtil;
  docs: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public photoViewer: PhotoViewer,
    public toastCtrl: ToastController,
    public menuCtrl: MenuController,
    private e2doc: E2docSincronismoProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private storage: Storage,
    public http: HttpProvider,
    public viewCtrl: ViewController,
    public file: File,
    private crop: Crop) {

    this.syncUtil = new SincronismoUtil(e2doc);

    this.menuCtrl.enable(true, 'app_menu');

    this.loading = MsgHelper.presentLoading(this.loadingCtrl, "Preparando tudo...");
    this.loading.present();

    //obtem dados do storage
    storage.get(GeneralUtilities.getKeyDocsStorage()).then(docs => {

      //carrega base 64
      this.imgDocsTemp = docs;
      this.readFiles();
      
      //let loading = MsgHelper.presentLoading(this.loadingCtrl, "Carregando pastas...");
      //loading.present();  

      //obtem configuração das pastas
      this.syncUtil.getConfigPasta().then(pastas => {
        
        this.pastas = pastas;
        //loading.dismiss();

      }, err => {
        this.loading.dismiss();
        MsgHelper.presentToast(this.toastCtrl, "Não foi possíver carregar as pastas!", 5000);
        this.verifyOnLeave = false;
        this.navCtrl.push(HomePage);
      });

      this.verifyOnLeave = true;
      
    }, err => {

      MsgHelper.presentToast(this.toastCtrl, "Não foi possíver carregar as imagens!", 5000);
      this.verifyOnLeave = false;
      this.navCtrl.push(HomePage);

    });    
  }

  readFiles() {

    if (this.imgDocsTemp.length > 0) {

      //tira do vetor temporário
      let doc = this.imgDocsTemp.pop();

      this.readFile(doc).then(doc => {
        
        //e coloca no vetor titular
        
        this.imgDocs.push(doc);
        this.readFiles();

      }, err => {

        MsgHelper.presentToast(this.toastCtrl, "Não foi possíver carregar as imagens!", 5000);
        this.verifyOnLeave = false;
        this.navCtrl.push(HomePage);

      });
    }
    else {
      //quando acabar de carregar as imagens
      this.loading.dismiss();
    }
  }

  readFile(doc): Promise<any> {

    return new Promise((resolve, reject) => {

      this.file.readAsDataURL(doc.path, doc.fileName).then(b64 => {

        doc.b64 = b64;
        resolve(doc);

      }, err => {
        reject("ERRO");
      })
    });
  }

  ionViewDidLoad() {

    this.viewCtrl.setBackButtonText('');

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {

      if (!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  ionViewCanLeave(): Promise<void> {

    return new Promise((resolve, reject) => {

      if (this.verifyOnLeave) {

        MsgHelper.presentAlert(this.alertCtrl, "Deseja cancelar esta opeação?",
          function () { resolve() },
          function () { reject() });

      }
      else {
        resolve();
      }

    });
  }

  onPastaSelect() {
    this.carregaIndices();
    this.carregaDocumentos();
  }

  selectedDoc() {

    this.slides.slideNext();

  }

  removeImg(index) {

    let self = this;

    if (self.imgDocs.length == 1) { // caso seja a última imagem

      MsgHelper.presentAlert(self.alertCtrl, "Não haverá mais imagens para indexar, deseja continuar?",
        function () {
          MsgHelper.presentToast(self.toastCtrl, "Não há documentos para enviar!");
          self.verifyOnLeave = false;
          self.navCtrl.push(CapturaPage);
        },
        function () { }, "Atenção!");
    }
    else {
      self.imgDocs.splice(index, 1);
      self.slides.slideTo(0);
    }
  }

  //para limpar os campos do tipo data
  clearDateTime(id) {
    this.indices.find(i => i.id == id).valor = null;
  }

  showImage(index) {

    let pathName = this.imgDocs[index].path + "/" + this.imgDocs[index].fileName;

    this.crop.crop(pathName, {quality: 75}).then(path => {
      // path looks like 'file:///storage/emulated/0/Android/data/com.foo.bar/cache/1477008080626-cropped.jpg?1477008106566'

      let objPath = GeneralUtilities.separatePathFromFileName(path);
      this.imgDocs[index].path = objPath.path;
      this.imgDocs[index].fileName = objPath.fileName.substring(0, path.lastIndexOf("?"));

      MsgHelper.presentToast(this.toastCtrl, "PATH: " + this.imgDocs[index].path + " NAME: " + this.imgDocs[index].fileName, 9000);

      this.readFile(this.imgDocs[index]).then(doc => {

        this.imgDocs = doc;

      // }, error => { MsgHelper.presentToast(this.toastCtrl, "Falha ao salvar imagem!") })
    }, error => { })

    },
    // error => { MsgHelper.presentToast(this.toastCtrl, "Falha ao salvar imagem!"); }
    error => { }
  );



    // this.verifyOnLeave = false;
    // this.navCtrl.push(PhotoEditorPage, { imageB64: this.imgDocs[index].b64 });

    // this.photoViewer.show(this.imgDocs[index].b64);

  }

  carregaIndices() {

    let loadind = MsgHelper.presentLoading(this.loadingCtrl, "Carregando índices!");

    loadind.present();

    this.syncUtil.getIndices(this.pasta).then(indices => {

      this.indices = indices;
      this.indicesReady = true;

      loadind.dismiss();

    }, err => {
      loadind.dismiss();
      this.alertError(err);
    });
  }

  carregaDocumentos() {
    let loadind = MsgHelper.presentLoading(this.loadingCtrl, "Carregando Documentos!");

    loadind.present();

    this.syncUtil.getConfigDocumento(this.pasta).then(documentos => {

      this.documentos = documentos;

      if (documentos.length == 1) {
        this.imgDocs.forEach((element, index) => {

          element.modelo = documentos[0];

        });
      }

      loadind.dismiss();

    }, err => {
      loadind.dismiss();
      this.alertError(err);
    });
  }

  sincronizar() {

    let self = this;

    if (self.imgDocs.some(i => i.modelo == "") == true) { //se houver alguma imagem sem modelo

      self.content.scrollToTop();
      self.slides.slideTo(this.imgDocs.findIndex(i => i.modelo == ""));
      MsgHelper.presentToast(this.toastCtrl, "Modelo de documento não selecionado!");

    }
    else {

      if (this.imgDocs.length > 0) {

        this.indices.forEach((indice) => {

          IndiceValidator.validade(indice); //verifica se todos os índices obrigatórios foram preenchidos

        });

        let notValid = this.indices.some((i => i.validate == false));

        if (!notValid) {

          //cria loading
          self.loading = MsgHelper.presentLoading(this.loadingCtrl, "Aguarde, sincronizando com o e2docCloud");

          //mostra loading
          self.loading.present();

          this.send();

        }
      }
      else {

        MsgHelper.presentToast(self.toastCtrl, "Não há imagens para serem indexadas!");
      }
    }
  }

  send() {

    let self = this;

    if (this.imgDocs.length == 0) {
      self.loading.dismiss();
      self.msgEnvioFinalizado();
      return;
    }

    let doc = this.imgDocs.pop();

    let campos = SyncHelper.getStringIndices(self.indices);

    this.sync(campos, doc, this.imgDocs.length).then((res => {

      this.send();

    }));
  }

  sync(campos, doc, ordem): Promise<any> {

    return new Promise((resolve, reject) => {

      let self = this;

      SyncHelper.getVetDoc(self.pasta, doc.modelo, doc.b64.split(",")[1], ordem).then(vetDoc => {

        self.e2doc.enviarDocumento(vetDoc[0], campos).then(res => {

          resolve(ordem);

        }, erro => {

          reject(ordem);

        });
      });
    })
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

  msgErroEnvio(mensagem: string) {

    //exibe alert
    this.alertCtrl.create({
      title: '',
      message: mensagem,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    }).present();

  }

  msgEnvioFinalizado() {

    //exibe alert
    this.alertCtrl.create({
      title: '',
      message: "Envio Finalizado, deseja incluir mais documentos?",
      buttons: [
        {
          text: 'Não',
          role: 'cancel',
          handler: () => {
            this.verifyOnLeave = false;
            this.navCtrl.push(HomePage);
          }
        },
        {
          text: 'Sim',
          role: 'cancel',
          handler: () => {
            this.verifyOnLeave = false;
            this.navCtrl.push(CapturaPage);
          }
        }
      ]
    }).present();
  }
}
