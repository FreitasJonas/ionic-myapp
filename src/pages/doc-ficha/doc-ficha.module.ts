import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DocFichaPage } from './doc-ficha';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    DocFichaPage,
  ],
  imports: [
    IonicPageModule.forChild(DocFichaPage),
    SignaturePadModule
  ],
})
export class DocFichaPageModule {}
