import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContratacaoFichaPage } from './contratacao-ficha';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    ContratacaoFichaPage,
  ],
  imports: [
    IonicPageModule.forChild(ContratacaoFichaPage),
    SignaturePadModule
  ],
})
export class ContratacaoFichaPageModule {}
