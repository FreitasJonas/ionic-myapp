import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TarefaPage } from '../tarefa/tarefa';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { Pasta } from '../../helpers/classes/e2doc/Pasta';
import { Helper } from '../../providers/e2doc/helpers/helper';

@IonicPage()
@Component({
  selector: 'page-tarefas',
  templateUrl: 'tarefas.html',
})
export class TarefasPage {

  public pasta: Pasta;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private e2doc: E2docProvider) {

    //obtem configuração da pasta, modelos e indices
    //refatorar depois da criação do login
    this.pasta = Helper.getConfigPasta("MAGNA - CONTRATACAO");    
  }

  goToTarefaPage() {
    this.navCtrl.push(TarefaPage, {
      pasta: this.pasta
    });
  }
}
