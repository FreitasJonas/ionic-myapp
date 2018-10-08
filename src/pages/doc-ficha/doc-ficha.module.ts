import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DocFichaPage } from './doc-ficha';

@NgModule({
  declarations: [
    DocFichaPage,
  ],
  imports: [
    IonicPageModule.forChild(DocFichaPage),
  ],
})
export class DocFichaPageModule {}
