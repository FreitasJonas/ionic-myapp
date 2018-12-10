import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { IntroPage } from '../pages/intro/intro';
import { LogoutPage } from '../pages/logout/logout';
import { AdicionaDocumentoPage } from '../pages/adiciona-documento/adiciona-documento';
import { TarefaPage } from '../pages/tarefa/tarefa';
import { Storage } from '@ionic/storage';
import { AutenticationHelper } from '../helpers/e2doc/AutenticationHelper';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { HomePage } from '../pages/home/home';
import { AppVersion } from '@ionic-native/app-version';
import { HttpProvider } from '../providers/http/http';
import { MsgHelper } from '../helpers/MsgHelper';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = LoginPage;
  @ViewChild(Nav) nav: Nav;

  usuario: any;
  base: any;
  versao: any = "1.0";

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);
  
  pages: Array<{ title: string, component: any, icon: string }>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private storage: Storage,
    private appVersion: AppVersion,
    public http: HttpProvider,
    public toastCtrl: ToastController) {

    this.initializeApp();

    this.pages =
      [
        { title: 'Home', component: HomePage, icon: "md-home" },
        { title: 'Pesquisa', component: "", icon: "md-search" },
        { title: 'Adicionar Documento', component: AdicionaDocumentoPage, icon: "md-document" },
        { title: 'Tarefas', component: TarefaPage, icon: "md-build" },
        { title: 'RH', component: IntroPage, icon: "md-apps" },
        { title: 'Logout', component: LogoutPage, icon: "md-exit" }
      ];

    // let cordova = this.platform.is('cordova');
    // this.msgHelper.presentToast2("Cordova: " + cordova);

    // if (cordova) {

    //   this.appVersion.getVersionNumber().then(versao => {
    //     this.versao = "Teste " + versao;
    //     this.msgHelper.presentToast2("Versão: " + versao);

    //   });
    // }
    // else {
    //   this.versao = "1.0";
    // }

    AutenticationHelper.isAutenticated(http, storage).then(isAutenticated => {

      if (isAutenticated) {

        this.storage.get(AutenticationHelper.getKeyStorage()).then(storageContent => {

          let dados = AutenticationHelper.getDadosLogin(storageContent);
          this.base = dados.base;
          this.usuario = dados.usuario;
        });  
      }
    })
  }

  initializeApp(): any {

    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {

    if (page.title === "Pesquisa") {
      this.goToPesquisa();
    }
    else {
      this.nav.setRoot(page.component);
    }
  }

  goToPesquisa() {

    let url = "";

    this.storage.get(AutenticationHelper.getKeyStorage()).then(dados => {

      url = AutenticationHelper.urlBrowser + dados;

      this.platform.ready().then(() => {
        const browser = new InAppBrowser().create(url, '_system');
      });
    });
  }
}
