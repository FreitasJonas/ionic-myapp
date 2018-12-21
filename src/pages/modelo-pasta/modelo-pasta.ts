import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { SincronismoUtil } from '../../providers/e2doc-sincronismo/e2doc-sincronismo-util';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { ModeloPasta } from '../../helpers/e2docS/modeloPasta';
import { ModeloClassificacaoPage } from '../modelo-classificacao/modelo-classificacao';

@IonicPage()
@Component({
  selector: 'page-modelo-pasta',
  templateUrl: 'modelo-pasta.html',
})
export class ModeloPastaPage {

  public syncUtil: SincronismoUtil;

  public pastas = new Array<ModeloPasta>();

  public imgDocs = new Array<{ b64: any, modelo: any } >();

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private e2doc: E2docSincronismoProvider, private loadingCtrl: LoadingController, ) {

      this.imgDocs = navParams.get("imgDocs");

    //cria loading
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Carregando informações!',
      dismissOnPageChange: true
    });

    //mostra loading
    loading.present();

    this.syncUtil = new SincronismoUtil(this.e2doc);

    this.syncUtil.getConfigPasta().then(pst => {
      this.pastas = pst;
      loading.dismiss();

    }, err => {

      alert(err);
    });
  }

  select(pasta) {
    this.navCtrl.push(ModeloClassificacaoPage, { _pasta: pasta, _imgDocs: this.imgDocs });
  }
}
