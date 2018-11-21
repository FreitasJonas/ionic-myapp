import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TarefaPage } from './tarefa';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    TarefaPage,
  ],
  imports: [
    IonicPageModule.forChild(TarefaPage),
    SignaturePadModule
  ],
})
export class TarefaPageModule {}
