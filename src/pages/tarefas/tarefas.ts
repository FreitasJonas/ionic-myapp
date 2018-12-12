import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, ViewController } from 'ionic-angular';
import { TarefaPage } from '../tarefa/tarefa';
import { Pasta } from '../../helpers/e2doc/Pasta';
import { e2docHelper } from '../../helpers/e2doc/e2docHelper';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { LoginPage } from '../login/login';
import { Storage } from '@ionic/storage';
import { HttpProvider } from '../../providers/http/http';

@IonicPage()
@Component({
  selector: 'page-tarefas',
  templateUrl: 'tarefas.html',
})
export class TarefasPage {

  public pasta: Pasta;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public http: HttpProvider,
    public menuCtrl: MenuController,
    public viewCtrl: ViewController ) {

      this.menuCtrl.enable(true, 'app_menu');

    //obtem configuração da pasta, modelos e indices
    //refatorar depois da criação do login
    this.pasta = e2docHelper.getConfigPastaMAGNA("MAGNA - CONTRATACAO");    
  }

    //quando a tela é carregada
    ionViewDidLoad() {

      this.viewCtrl.setBackButtonText('');

      AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {
  
        if (!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }
  
      });
  
    }

  goToTarefaPage() {
    this.navCtrl.push(TarefaPage, {
      pasta: this.pasta
    });
  }
}
