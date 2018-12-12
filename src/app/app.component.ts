import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, ToastController, App, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { LogoutPage } from '../pages/logout/logout';
import { AdicionaDocumentoPage } from '../pages/adiciona-documento/adiciona-documento';
import { Storage } from '@ionic/storage';
import { AutenticationHelper } from '../helpers/e2doc/AutenticationHelper';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { HomePage } from '../pages/home/home';
import { AppVersion } from '@ionic-native/app-version';
import { HttpProvider } from '../providers/http/http';
import { MsgHelper } from '../helpers/MsgHelper';
import { RhPage } from '../pages/rh/rh';
import { TarefasPage } from '../pages/tarefas/tarefas';

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
    public http: HttpProvider,
    public toastCtrl: ToastController,
    public app: App) {

    this.initializeApp();

    this.pages =
      [
        { title: 'Home', component: HomePage, icon: "md-home" },
        { title: 'Pesquisa', component: "", icon: "md-search" },
        { title: 'Adicionar Documento', component: AdicionaDocumentoPage, icon: "md-document" },
        { title: 'Tarefas', component: TarefasPage, icon: "md-build" },
        { title: 'RH', component: RhPage, icon: "md-apps" },
        { title: 'Logout', component: LogoutPage, icon: "md-exit" }
      ];

    AutenticationHelper.isAutenticated(http, storage).then(isAutenticated => {

      if (isAutenticated) {
        
          AutenticationHelper.getDadosLogin(storage).then(account => { 
          this.base = account.empresa;
          this.usuario = account.usuario;
        });
      }
    });

    this.platform.registerBackButtonAction(() => {

      let nav = this.app.getActiveNavs()[0];
      let activeView = nav.getActive();

      if (activeView.name == "HomePage" || activeView.name == "LoginPage") {
        console.log(activeView.name);
        this.platform.exitApp();
        return;
      }
      else {
        nav.push(HomePage);
      }      
    });
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
