import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
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

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = LoginPage;
  @ViewChild(Nav) nav: Nav;

  pages: Array<{ title: string, component: any }>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen, private storage: Storage) {

    this.initializeApp();

    this.pages =
      [
        { title: 'Home', component: HomePage },
        { title: 'Pesquisa', component: "" },
        { title: 'Adicionar Documento', component: AdicionaDocumentoPage },
        { title: 'Tarefas', component: TarefaPage },
        { title: 'RH', component: IntroPage },
        { title: 'Logout', component: LogoutPage }
      ];
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
