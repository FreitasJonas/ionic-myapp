import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HttpClientModule } from '@angular/common/http';
import { Geolocation } from '@ionic-native/geolocation';
import { IonicStorageModule } from '@ionic/storage';
import { PhotoLibrary } from '@ionic-native/photo-library';

import { File } from '@ionic-native/file';
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
import { AppVersion } from '@ionic-native/app-version';
import { ContratacaoPageModule } from '../pages/contratacao/contratacao.module';
import { ContratacaoFichaPageModule } from '../pages/contratacao-ficha/contratacao-ficha.module';
import { ClassificacaoPageModule } from '../pages/classificacao/classificacao.module';
import { PhotoViewer } from '@ionic-native/photo-viewer'
import { ImagePicker } from '@ionic-native/image-picker'
import { CapturaPageModule } from '../pages/captura/captura.module';

import { Camera } from '@ionic-native/camera';
import { AngularCropperjsModule } from 'angular-cropperjs';
import { PhotoEditorPageModule } from '../pages/photo-editor/photo-editor.module';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp,  {
      scrollAssist: false, 
      autoFocusAssist: false
  }),
    IonicStorageModule.forRoot(),
    LoginPageModule,
    ContratacaoPageModule,
    ContratacaoFichaPageModule,
    HomePageModule,
    LogoutPageModule,
    TarefasPageModule,
    TarefaPageModule,
    ClassificacaoPageModule,
    CapturaPageModule,
    HttpClientModule,    
    SignaturePadModule,
    AngularCropperjsModule,
    PhotoEditorPageModule
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
    Camera,
    E2docSincronismoProvider,
    E2docPesquisaProvider,
    Geolocation,
    PhotoLibrary,
    File,
    PesquisaXmlProvider,
    SincronismoXmlProvider,
    E2docSincronismoProvider,
    E2docPesquisaProvider,    
    HttpProvider,
    PhotoViewer,
    ImagePicker,
    AppVersion
  ]
})
export class AppModule {}
