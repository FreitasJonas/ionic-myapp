import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, MenuController, ToastController, App, AlertController } from 'ionic-angular';
import { TarefasPage } from '../tarefas/tarefas';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { HttpProvider } from "../../providers/http/http";
import { MsgHelper } from '../../helpers/MsgHelper';
import { ContratacaoPage } from '../contratacao/contratacao';
import { CapturaPage } from '../captura/captura';

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  public ano: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform, private storage: Storage,
    public http: HttpProvider,
    public menuCtrl: MenuController,
    public toastCtrl: ToastController,
    private alertCtrl: AlertController,
    public app: App) {

    this.menuCtrl.enable(true, 'app_menu');
  }

  ionViewDidLoad() {

    this.ano = new Date().getFullYear();
    
    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {

      if (!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  goToRHPage() {
    this.navCtrl.push(ContratacaoPage);
  }

  goToTarefaPage() {
    this.navCtrl.push(TarefasPage);
  }

  goToPesquisa() {

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {

      if (isAutenticate) {

        let url = "";

        this.storage.get(AutenticationHelper.getKeyStorage()).then(dados => {

          url = AutenticationHelper.urlBrowser + dados;

          this.platform.ready().then(() => {
            const browser = new InAppBrowser().create(url, '_system');
          });

        });
      }
      else {
        MsgHelper.presentToast(this.toastCtrl, "Login inválido, registre-se novamente!");

        this.storage.clear();
        this.navCtrl.push(LoginPage);
      }
    });
  }

  goToAddDoc() {

    this.navCtrl.push(CapturaPage);
  }
}
