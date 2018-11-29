import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdicionaDocumentoPage } from './adiciona-documento';

@NgModule({
  declarations: [
    AdicionaDocumentoPage,
  ],
  imports: [
    IonicPageModule.forChild(AdicionaDocumentoPage),
  ],
})
export class AdicionaDocumentoPageModule {}
