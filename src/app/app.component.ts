import { Component, ViewChild } from '@angular/core';
import { Platform, Nav, ToastController, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { LogoutPage } from '../pages/logout/logout';
import { Storage } from '@ionic/storage';
import { AutenticationHelper } from '../helpers/e2doc/AutenticationHelper';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { HomePage } from '../pages/home/home';
import { HttpProvider } from '../providers/http/http';
import { TarefasPage } from '../pages/tarefas/tarefas';
import { timer } from 'rxjs/observable/timer';
import { ContratacaoPage } from '../pages/contratacao/contratacao';
import { CapturaPage } from '../pages/captura/captura';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = LoginPage;
  @ViewChild(Nav) nav: Nav;

  static usuario: any;
  static base: any;
  versao: any = "1.0";

  showSplash = true;
  
  pages: Array<{ title: string, component: any, icon: string }>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private storage: Storage,
    public http: HttpProvider,
    public toastCtrl: ToastController,
    public app: App) {

      AutenticationHelper.isAutenticated(http, storage).then(isAutenticated => {

        if (isAutenticated) {
          
            AutenticationHelper.getDadosLogin(storage).then(account => { 
            MyApp.base = account.empresa;
            MyApp.usuario = account.usuario;
          });
        }
      });

    this.initializeApp();

    this.pages =
      [
        { title: 'Home', component: HomePage, icon: "md-home" },
        { title: 'Pesquisa', component: "", icon: "md-search" },
        { title: 'Adicionar Documento', component: CapturaPage, icon: "md-document" },
        { title: 'Tarefas', component: TarefasPage, icon: "md-construct" },
        { title: 'Contratação', component: ContratacaoPage, icon: "md-folder" },
        { title: 'Logout', component: LogoutPage, icon: "md-exit" }
      ];

    this.platform.registerBackButtonAction(() => {

      let nav = this.app.getActiveNavs()[0];
      let activeView = nav.getActive();

      if (activeView.name == "HomePage" || activeView.name == "LoginPage") {
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

      timer(3000).subscribe(() => {

        this.showSplash = false;

      }) 
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

  getstaticUser() {

    return MyApp.usuario;
  }

  getStaticEmpresa() {

    return MyApp.base;
  }

  static setDadosUser( usuario, base ) {

    MyApp.usuario = usuario;
    MyApp.base = base;

  }
}
