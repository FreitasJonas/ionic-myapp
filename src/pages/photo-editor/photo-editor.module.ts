import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PhotoEditorPage } from './photo-editor';
import { AngularCropperjsModule } from 'angular-cropperjs';

@NgModule({
  declarations: [
    PhotoEditorPage,
  ],
  imports: [
    IonicPageModule.forChild(PhotoEditorPage),
    AngularCropperjsModule

  ],
})
export class PhotoEditorPageModule {}
