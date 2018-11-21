import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IntroPage } from '../intro/intro';
import { TarefasPage } from '../tarefas/tarefas';

@IonicPage()
@Component({
  selector: 'page-menu',
  templateUrl: 'menu.html',
})
export class MenuPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    
  }

  goToRHPage() {

    this.navCtrl.push(IntroPage);
    
  }

  goToTarefaPage() {

    this.navCtrl.push(TarefasPage);
  }
}
