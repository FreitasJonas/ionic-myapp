import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Platform, MenuController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { CryptoAES } from '../../helpers/CryptoAES';
import { HttpProvider } from '../../providers/http/http';
import { Storage } from '@ionic/storage';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { HomePage } from '../home/home';
import { MyApp } from '../../app/app.component';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
 
  public loginForm: any;
  messageBase = "";
  messageUser = "";
  messagePassword = "";
  errorBase = false;
  errorUser = false;
  errorPassword = false;

  constructor(public navCtrl: NavController,
    private platform: Platform,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public http: HttpProvider,
    private storage: Storage,
    private alertCtrl: AlertController,
    public menuCtrl: MenuController) {

      this.menuCtrl.enable(false, 'app_menu');

    this.loginForm = this.formBuilder.group({
      base: ['', Validators.required],
      user: ['', Validators.required],
      password: ['', Validators.compose([Validators.minLength(6), Validators.maxLength(24),
      Validators.required])],
    });
  }

  ionViewDidLoad() {

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {
      
      if(isAutenticate) { this.navCtrl.push(HomePage); } else { this.storage.clear(); }

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

      let so = this.platform.is('android') == true ? 'android' : 'ios';
      let dados = AutenticationHelper.makeStrValidate(user.value, password.value, base.value, so);
      let dadosEncod = CryptoAES.crypt(dados, AutenticationHelper.keyBytes, AutenticationHelper.ivBytes);
      var e2docResponse = AutenticationHelper.isValidUser(this.http, dadosEncod);

      if (e2docResponse == "1") {
        AutenticationHelper.saveToStorage(this.storage, dadosEncod);
        MyApp.setDadosUser(user.value, base.value);
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
}
