import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TarefaPage } from '../tarefa/tarefa';
import { Pasta } from '../../helpers/e2doc/Pasta';
import { e2docHelper } from '../../helpers/e2doc/e2docHelper';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
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
    private e2doc: E2docSincronismoProvider,
    private storage: Storage,
    public http: HttpProvider ) {

    //obtem configuração da pasta, modelos e indices
    //refatorar depois da criação do login
    this.pasta = e2docHelper.getConfigPastaMAGNA("MAGNA - CONTRATACAO");    
  }

    //quando a tela é carregada
    ionViewDidLoad() {

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
