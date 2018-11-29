import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { IntroPage } from '../intro/intro';
import { TarefasPage } from '../tarefas/tarefas';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { Storage } from '@ionic/storage';
import { AdicionaDocumentoPage } from '../adiciona-documento/adiciona-documento';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private storage: Storage) {

    platform.registerBackButtonAction(() => {
      this.platform.exitApp();
      return;
    });
  }

  goToRHPage() {

    this.navCtrl.push(IntroPage);

  }

  goToTarefaPage() {

    this.navCtrl.push(TarefasPage);
  }

  goToPesquisa() {

    let url = "";

    this.storage.get(AutenticationHelper.getKeyStorage()).then(dados => {

      url = AutenticationHelper.urlBrowser + dados;

      console.log(url);

      this.platform.ready().then(() => {
        const browser = new InAppBrowser().create(url, '_system');
      });
      
    });
  }

  goToAddDoc() {

    this.navCtrl.push(AdicionaDocumentoPage);
  }
}
