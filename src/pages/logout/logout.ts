import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html',
})
export class LogoutPage {

  constructor(public navCtrl: NavController, private alertCtrl: AlertController,  private storage: Storage) {
  }

  ionViewDidLoad() {

      //exibe alert
      this.alertCtrl.create({
        title: '',
        message: "Deseja sair do sistema ?",
        buttons: [
          {
            text: 'Não',
            role: 'cancel',
            handler: () => {
              this.navCtrl.push(HomePage);
            }
          },
          {
            text: 'Sim',
            handler: () => {
              this.storage.clear();              
              this.navCtrl.push(LoginPage);
            }
          }               
        ]
      }).present();   
    
  }

}
