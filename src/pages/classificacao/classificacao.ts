import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, MenuController, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { MsgHelper } from '../../helpers/MsgHelper';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { ModeloPasta } from '../../helpers/e2docS/modeloPasta';
import { ModeloDoc } from '../../helpers/e2docS/ModeloDoc';
import { ModeloIndice } from '../../helpers/e2docS/ModeloIndice';
import { Dicionario } from '../../helpers/e2docS/Dicionario';
import { HomePage } from '../home/home';
import { IndiceValidator } from '../../helpers/e2docS/IndiceValidator';
import { SyncHelper } from '../../helpers/e2docS/SyncHelper';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { HttpProvider } from '../../providers/http/http';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { AdicionaDocumentoPage } from '../adiciona-documento/adiciona-documento';

@IonicPage()
@Component({
  selector: 'page-classificacao',
  templateUrl: 'classificacao.html',
})
export class ClassificacaoPage {

  imageSrc: any = "";
  public vetImg: Array<any>;
  public indicesReady: boolean;

  public pasta: ModeloPasta;
  public documento: ModeloDoc;
  public indices = new Array<ModeloIndice>();

  public pastas = new Array<ModeloPasta>();
  public documentos = new Array<ModeloDoc>();

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public photoViewer: PhotoViewer,
    public toastCtrl: ToastController,
    public menuCtrl: MenuController,
    private e2doc: E2docSincronismoProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private storage: Storage,
    public http: HttpProvider,
    public viewCtrl: ViewController) {

    this.menuCtrl.enable(true, 'app_menu');

    this.vetImg = navParams.get("vetImg");

    console.log(this.vetImg);

    this.getConfigPasta().then(pst => {
      this.pastas = pst;

    }, err => {

      this.alertError(err);
    });

  }

  ionViewDidLoad() {

    this.viewCtrl.setBackButtonText('');

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {

      if (!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  ionViewCanLeave(): Promise<void> {

    return new Promise((resolve, reject) => {

      let vImg = this.imageSrc == "" ? false : true;

      if (vImg) {

        MsgHelper.presentAlert(this.alertCtrl, "Deseja cancelar esta opeação?",
          function () { resolve() },
          function () { reject() });
      }
      else {
        resolve();
      }
    });
  }

  clearDateTime(id) {
    this.indices.find(i => i.id == id).valor = null;
  }
  
  showImage() {

    

    this.photoViewer.show("data:image/jpeg;base64," + this.vetImg);
  }

  onPastaSelect() {

    let loadind = this.loadingCtrl.create({
      spinner: 'circles',
      content: "Carregando informações da pasta!"
    });

    loadind.present();

    this.getIndices(this.pasta).then(indices => {

      this.indices = indices;
      this.indicesReady = true;

      this.getConfigDocumento(this.pasta).then(docs => {

        this.documentos = docs;

      }, err => {
        loadind.dismiss();
        this.alertError(err);
      });

      loadind.dismiss();

    }, err => {
      loadind.dismiss();
      this.alertError(err);
    });
  }

  onDocSelect() {

    let loadind = this.loadingCtrl.create({
      spinner: 'circles',
      content: "Carregando índices!"
    });

    loadind.present();

    this.getIndices(this.pasta).then(indices => {

      this.indices = indices;
      this.indicesReady = true;

      loadind.dismiss();

    }, err => {
      loadind.dismiss();
      this.alertError(err);
    });
  }

  sincronizar() {

    if (typeof (this.documento) !== 'undefined') {

      if (this.vetImg.length > 0) {

        this.indices.forEach((indice) => {

          IndiceValidator.validade(indice);

        });

        let notValid = this.indices.some((i => i.validate == false));

        if (!notValid) {

          this.enviaDoc();

        }
      }
      else {

        this.msgHelper.presentToast2("Não há imagens para serem indexadas!");
      }

    }
    else {
      //exibe alert
      this.alertCtrl.create({
        title: 'ERRO',
        message: "Documento não selecionado!",
        buttons: [
          {
            text: 'OK',
          }
        ]
      }).present();
    }
  }

  enviaDoc() {

    //cria loading
    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Aguarde, sincronizando com o e2docCloud',
      dismissOnPageChange: true
    });

    //mostra loading
    loading.present();

    let campos = SyncHelper.getStringIndices(this.indices);

    SyncHelper.getVetDoc(this.pasta, this.documento, this.imageSrc).then(vetDoc => {

      this.e2doc.enviarDocumento(vetDoc[0], campos).then(res => {

        //limpa base64 da imagem
        this.imageSrc = "";

        loading.dismiss();

        this.msgEnvioFinalizado("Envio finalizado com sucesso, deseja incluir mais documentos ?");

      }, erro => {

        loading.dismiss();

        this.msgErroEnvio(erro);

      });
    });
  }

  getConfigPasta(): Promise<any> {

    let _pastas = new Array<ModeloPasta>();

    return new Promise((resolve, reject) => {

      this.e2doc.getConfiguracao(100, "", "", "", "").then((pastas) => {

        let erro = pastas.getElementsByTagName("erro")[0];

        if (typeof erro === 'undefined') {

          let nodes = pastas.getElementsByTagName("modelos")[0].childNodes;

          for (var i = 0; i < nodes.length; i++) {

            let id = nodes[i].childNodes[0].firstChild.nodeValue;
            let nome = nodes[i].childNodes[1].firstChild.nodeValue;
            let cod = nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue;

            let pasta = new ModeloPasta();
            pasta.id = id;
            pasta.nome = nome;
            pasta.cod = cod;

            _pastas.push(pasta);
          }

          resolve(_pastas);
        }
        else {
          reject("[ERRO] Falha lendo Xml");
        }
      }, err => {

        reject(err);

      });

    });
  }

  getConfigDocumento(pasta): Promise<any> {

    return new Promise((resolve, reject) => {

      let lstDocs = new Array<ModeloDoc>();

      this.e2doc.getConfiguracao(200, pasta.id, pasta.nome, "", "").then(docs => {

        let erro = docs.getElementsByTagName("erro")[0];

        if (typeof erro === 'undefined') { //Se não encontrar erro

          let nodes = docs.getElementsByTagName("docs")[0].childNodes;

          for (var i = 0; i < nodes.length; i++) {

            let id = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
            let nome = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;
            let cod = nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue;
            let obr = nodes[i].childNodes[3].firstChild === null ? "" : nodes[i].childNodes[3].firstChild.nodeValue;

            lstDocs.push(new ModeloDoc(pasta.id, id, nome, cod, obr));
          }

          resolve(lstDocs);
        }
      }, erro => {
        reject("[ERRO] " + erro);
      });

    });
  }

  getIndices(pasta): Promise<any> {

    let self = this;

    return new Promise((resolve, reject) => {

      let _indices = new Array<ModeloIndice>();

      this.e2doc.getConfiguracao(300, pasta.id, pasta.nome, "", "").then(indices => {

        let erro = indices.getElementsByTagName("erro")[0];

        if (typeof erro === 'undefined') { //Se não encontrar erro

          let nodes = indices.getElementsByTagName("indices")[0].childNodes;

          for (var i = 0; i < nodes.length; i++) {

            let options = {

              id_pasta: pasta.id,

              id: nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue,
              nome: nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue,

              pos: nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue,
              def: nodes[i].childNodes[3].firstChild === null ? "" : nodes[i].childNodes[3].firstChild.nodeValue,
              tam: nodes[i].childNodes[4].firstChild === null ? "" : nodes[i].childNodes[4].firstChild.nodeValue,
              fixo: nodes[i].childNodes[5].firstChild === null ? "" : nodes[i].childNodes[5].firstChild.nodeValue,
              obr: nodes[i].childNodes[6].firstChild === null ? "" : nodes[i].childNodes[6].firstChild.nodeValue,
              unico: nodes[i].childNodes[7].firstChild === null ? "" : nodes[i].childNodes[7].firstChild.nodeValue,
              calta: nodes[i].childNodes[8].firstChild === null ? "" : nodes[i].childNodes[8].firstChild.nodeValue,
              cbaixa: nodes[i].childNodes[9].firstChild === null ? "" : nodes[i].childNodes[9].firstChild.nodeValue,
              dupla: nodes[i].childNodes[10].firstChild === null ? "" : nodes[i].childNodes[10].firstChild.nodeValue,
              tipo: nodes[i].childNodes[11].firstChild === null ? "" : nodes[i].childNodes[11].firstChild.nodeValue,

              rgi: nodes[i].childNodes[12].firstChild === null ? "" : nodes[i].childNodes[12].firstChild.nodeValue,
              rgf: nodes[i].childNodes[13].firstChild === null ? "" : nodes[i].childNodes[13].firstChild.nodeValue,
              exp: nodes[i].childNodes[14].firstChild === null ? "" : nodes[i].childNodes[14].firstChild.nodeValue,

              dicId: nodes[i].childNodes[15].firstChild === null ? "" : nodes[i].childNodes[15].firstChild.nodeValue,

              ordem: nodes[i].childNodes[16].firstChild === null ? "" : nodes[i].childNodes[16].firstChild.nodeValue
            }

            let indice = new ModeloIndice(options);

            //se houver dicionário
            if (options.dicId !== "0") {

              self.getIndiceDicionarios(pasta).then(dic => {

                let _dic = dic.find(d => d.id == options.dicId);

                indice.hasDic = true;
                indice.dic = _dic;

                this.getDicionarioItem(_dic).then(itens => {

                  indice.dic.itens = itens;

                }, err => {
                  this.alertError(err);
                });
              });
            }

            _indices.push(indice);
          }

          resolve(_indices);
        }
        else {

          reject("[ERRO] Falha lendo Xml");

        }
      }, err => {

        reject(err);

      });

    });
  }

  getIndiceDicionarios(pasta): Promise<any> {

    return new Promise((resolve, reject) => {

      let dicS = new Array<Dicionario>();

      this.e2doc.getConfiguracao(400, pasta.id, pasta.nome, "", "").then(dicionarios => {

        let erro = dicionarios.getElementsByTagName("erro")[0];

        if (typeof erro === 'undefined') { //Se não encontrar erro

          let nodes = dicionarios.getElementsByTagName("dics")[0].childNodes;

          for (var i = 0; i < nodes.length; i++) {

            let idDic = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
            let nomeDic = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;

            dicS.push(new Dicionario(idDic, nomeDic));
          }
          resolve(dicS);
        }
        else {
          reject("[ERRO] (getIndiceDicionarios) Falha lendo Xml");
        }
      }, err => {

        reject(err);

      });
    });
  }

  getDicionarioItem(dic: Dicionario): Promise<any> {

    let _itens = new Array<{ chave: any, valor: any }>();

    return new Promise((resolve, reject) => {

      this.e2doc.getConfiguracao(500, dic.id, dic.nome, "", "").then(itens => {

        let erro = itens.getElementsByTagName("erro")[0];

        if (typeof erro === 'undefined') {

          let nodes = itens.getElementsByTagName("itens")[0].childNodes;

          for (var i = 0; i < nodes.length; i++) {

            let chave = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
            let valor = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;

            _itens.push({ chave, valor });
          }

          resolve(_itens);

        } else {
          reject("[ERRO] (getDicionarioItem) Falha lendo Xml");
        }
      }, err => {

        reject(err);

      });
    });
  }

  alertError(msg) {

    //exibe alert
    this.alertCtrl.create({
      title: 'ERRO',
      message: msg,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.navCtrl.push(HomePage);
          }
        }
      ]
    }).present();
  }

  msgErroEnvio(mensagem: string) {

    //exibe alert
    this.alertCtrl.create({
      title: '',
      message: mensagem,
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    }).present();

  }

  msgEnvioFinalizado(mensagem: string) {

    //exibe alert
    this.alertCtrl.create({
      title: '',
      message: mensagem,
      buttons: [
        {
          text: 'Sim',
          role: 'cancel',
          handler: () => {
            this.navCtrl.push(AdicionaDocumentoPage);
          }
        },
        {
          text: 'Não',
          role: 'cancel',
          handler: () => {
            //retorna para a home page
            this.navCtrl.push(HomePage);
          }
        }
      ]
    }).present();

  }

}
