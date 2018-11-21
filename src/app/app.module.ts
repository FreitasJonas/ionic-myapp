import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IntroPageModule } from '../pages/intro/intro.module';
import { E2docProvider } from '../providers/e2doc/e2doc';
import { HttpClientModule } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicStorageModule } from '@ionic/storage';
import { PhotoLibrary } from '@ionic-native/photo-library';

import { File } from '@ionic-native/file';
import { DocFichaPageModule } from '../pages/doc-ficha/doc-ficha.module';
import { SignaturePadModule } from 'angular2-signaturepad';
import { XmlTextProvider } from '../providers/xml-text/xml-text';
import { MenuPageModule } from '../pages/menu/menu.module';
import { TarefasPageModule } from '../pages/tarefas/tarefas.module';
import { TarefaPageModule } from '../pages/tarefa/tarefa.module';


@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    DocFichaPageModule,
    IntroPageModule,
    MenuPageModule,
    TarefasPageModule,
    TarefaPageModule,
    HttpClientModule,    
    SignaturePadModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    E2docProvider,
    XmlTextProvider,
    Geolocation,
    PhotoLibrary,
    File,
    XmlTextProvider
  ]
})
export class AppModule {}
