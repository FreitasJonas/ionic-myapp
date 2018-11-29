import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { CryptoAES } from '../../helpers/CryptoAES';
import { HttpProvider } from '../../providers/http/http';
import { Storage } from '@ionic/storage';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public ivBytes = [97, 15, 21, 52, 12, 14, 47, 62, 25, 24, 13, 20, 63, 16, 13, 24];
  public keyBytes = [54, 51, 49, 49, 54, 55, 53, 54, 49, 54, 55, 57, 102, 99, 98, 54, 102, 99, 57, 49, 54, 57, 49, 97, 97, 55, 97, 55, 99, 55, 101, 53];

  public keyStorage = AutenticationHelper.getKeyStorage();

  public loginForm: any;
  messageBase = "";
  messageUser = "";
  messagePassword = "";
  errorBase = false;
  errorUser = false;
  errorPassword = false;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public http: HttpProvider, private storage: Storage, private alertCtrl: AlertController) {

    this.loginForm = this.formBuilder.group({
      base: ['', Validators.required],
      user: ['', Validators.required],
      password: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(24),
      Validators.required])],
    });
  }

  ionViewWillEnter() {

    this.storage.get(this.keyStorage).then(storageContent => {

      if (AutenticationHelper.isAutenticated(storageContent)) {

        this.navCtrl.push(HomePage);
      }
      else {

        this.storage.clear();
      }
    });
  }

  login() {
    let { base, user, password } = this.loginForm.controls;

    if (!this.loginForm.valid) {
      if (!base.valid) {
        this.errorBase = true;
        this.messageBase = "Ops! Empresa não existente";
      } else {
        this.messageBase = "";
      }

      if (!user.valid) {
        this.errorUser = true;
        this.messageUser = "Usuário inválido"
      } else {
        this.messageUser = "";
      }

      if (!password.valid) {
        this.errorPassword = true;
        this.messagePassword = "A senha precisa ter de 12 a 24 caracteres"
      } else {
        this.messagePassword = "";
      }

    }
    else {

      let dt = new Date();

      let data = dt.getDate().toString() + "/" + (dt.getMonth() + 1).toString() + "/" + dt.getFullYear();
      let hora = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

      let dados = user.value + "||" + password.value + "||" + base.value + "||" + data + "||" + hora + "||android||1.0.0.0||" + "";

      let dadosEncod = CryptoAES.crypt(dados, this.keyBytes, this.ivBytes);

      var e2docResponse = this.http.getValidationTokenApp(AutenticationHelper.urlValidateUser + dadosEncod);

      if (e2docResponse == "1") {
        this.saveToStorage(dadosEncod);
        return this.navCtrl.push(HomePage);
      }
      else {

        let erro = AutenticationHelper.getMessageError(e2docResponse);

        //exibe alert
        this.alertCtrl.create({
          title: '',
          message: erro,
          buttons: [
            {
              text: 'OK'
            }
          ]
        }).present();

      }
    }
  }
  saveToStorage(dadosEncod: string): any {

    this.storage.set(this.keyStorage, dadosEncod);

  }
}
