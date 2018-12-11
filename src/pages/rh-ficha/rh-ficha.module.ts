import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RhFichaPage } from './rh-ficha';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    RhFichaPage,
  ],
  imports: [
    IonicPageModule.forChild(RhFichaPage),
    SignaturePadModule
  ],
})
export class RhFichaPageModule {}
