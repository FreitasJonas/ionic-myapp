import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { IntroPage } from '../intro/intro';
import { TarefasPage } from '../tarefas/tarefas';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { Storage } from '@ionic/storage';
import { AdicionaDocumentoPage } from '../adiciona-documento/adiciona-documento';
import { LoginPage } from '../login/login';
import { HttpProvider } from "../../providers/http/http";

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  public userName = "";

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private storage: Storage, 
    public http: HttpProvider ) {

    platform.registerBackButtonAction(() => {
      this.platform.exitApp();
      return;
    });
  }

  ionViewDidLoad() {

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {
      
      if(!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  ionViewDidEnter() {

    let key = AutenticationHelper.getKeyStorage();

    this.storage.get(key).then((storageContent) => {
      this.userName = AutenticationHelper.getUserName(storageContent);
    });
  }

  goToRHPage() {
    this.navCtrl.push(IntroPage);
  }

  goToTarefaPage() {
    this.navCtrl.push(TarefasPage);
  }

  goToPesquisa() {

    AutenticationHelper.getDadosFromStorage(this.storage).then(dados => {

      console.log(dados);

    });

    let url = "";

    this.storage.get(AutenticationHelper.getKeyStorage()).then(dados => {

      console.log(AutenticationHelper.urlValidateUser + dados);      

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
