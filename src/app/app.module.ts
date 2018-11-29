import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { IntroPageModule } from '../pages/intro/intro.module';

import { HttpClientModule } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicStorageModule } from '@ionic/storage';
import { PhotoLibrary } from '@ionic-native/photo-library';

import { File } from '@ionic-native/file';
import { DocFichaPageModule } from '../pages/doc-ficha/doc-ficha.module';
import { SignaturePadModule } from 'angular2-signaturepad';

import { TarefasPageModule } from '../pages/tarefas/tarefas.module';
import { TarefaPageModule } from '../pages/tarefa/tarefa.module';
import { E2docSincronismoProvider } from '../providers/e2doc-sincronismo/e2doc-sincronismo';
import { E2docPesquisaProvider } from '../providers/e2doc-pesquisa/e2doc-pesquisa';
import { PesquisaXmlProvider } from '../providers/e2doc-pesquisa/pesquisa-xml';
import { SincronismoXmlProvider } from '../providers/e2doc-sincronismo/sincronismo-xml';
import { LoginPageModule } from '../pages/login/login.module';
import { HttpProvider } from '../providers/http/http';
import { HomePageModule } from '../pages/home/home.module';
import { HomePage } from '../pages/home/home';
import { LogoutPageModule } from '../pages/logout/logout.module';
import { AdicionaDocumentoPageModule } from '../pages/adiciona-documento/adiciona-documento.module';


@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    LoginPageModule,
    DocFichaPageModule,
    IntroPageModule,
    HomePageModule,
    LogoutPageModule,
    TarefasPageModule,
    TarefaPageModule,
    AdicionaDocumentoPageModule,
    HttpClientModule,    
    SignaturePadModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage    
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    E2docSincronismoProvider,
    E2docPesquisaProvider,
    Geolocation,
    PhotoLibrary,
    File,
    PesquisaXmlProvider,
    SincronismoXmlProvider,
    E2docSincronismoProvider,
    E2docPesquisaProvider,    
    HttpProvider
  ]
})
export class AppModule {}
