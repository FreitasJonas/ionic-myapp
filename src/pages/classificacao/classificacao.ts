import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, MenuController, AlertController, LoadingController, ViewController, Loading } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { MsgHelper } from '../../helpers/MsgHelper';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { ModeloPasta } from '../../helpers/e2docS/modeloPasta';
import { ModeloIndice } from '../../helpers/e2docS/ModeloIndice';
import { Dicionario } from '../../helpers/e2docS/Dicionario';
import { HomePage } from '../home/home';
import { IndiceValidator } from '../../helpers/e2docS/IndiceValidator';
import { SyncHelper } from '../../helpers/e2docS/SyncHelper';
import { AutenticationHelper } from '../../helpers/e2doc/AutenticationHelper';
import { HttpProvider } from '../../providers/http/http';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../login/login';
import { ModeloPastaPage } from '../modelo-pasta/modelo-pasta';
import { timer } from 'rxjs/observable/timer';

@IonicPage()
@Component({
  selector: 'page-classificacao',
  templateUrl: 'classificacao.html',
})
export class ClassificacaoPage {

  public indicesReady: boolean;

  public imgDocs = new Array<{ b64: any, modelo: any }>();

  public pasta: ModeloPasta;

  public indices = new Array<ModeloIndice>();

  //helper para exebir toast
  public msgHelper = new MsgHelper(this.toastCtrl);

  public verifyOnLeave;

  public loading: Loading;

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

    this.imgDocs = navParams.get("imgDocs");

    this.pasta = navParams.get("_pasta");

    console.log(this.imgDocs);

    this.carregaIndices();

    this.verifyOnLeave = true;

  }

  ionViewDidLoad() {

    this.viewCtrl.setBackButtonText('');

    AutenticationHelper.isAutenticated(this.http, this.storage).then(isAutenticate => {

      if (!isAutenticate) { this.storage.clear(); this.navCtrl.push(LoginPage); }

    });
  }

  ionViewCanLeave(): Promise<void> {

    return new Promise((resolve, reject) => {

      if (this.verifyOnLeave) {

        MsgHelper.presentAlert(this.alertCtrl, "Deseja cancelar esta opeação?",
          function () { resolve() },
          function () { reject() });

      }
      else {
        resolve();
      }

    });
  }

  //para limpar os campos do tipo data
  clearDateTime(id) {
    this.indices.find(i => i.id == id).valor = null;
  }

  showImage() {

    //this.photoViewer.show("data:image/jpeg;base64," + this.imgDocs);
  }

  carregaIndices() {

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

    if (this.imgDocs.length > 0) {

      this.indices.forEach((indice) => {

        IndiceValidator.validade(indice);

      });

      let notValid = this.indices.some((i => i.validate == false));

      if (!notValid) {

        this.teste();

      }
    }
    else {

      this.msgHelper.presentToast2("Não há imagens para serem indexadas!");
    }
  }

  teste() {

    let self = this;

    //cria loading
    self.loading = self.loadingCtrl.create({
      spinner: 'dots',
      content: 'Aguarde, sincronizando com o e2docCloud',
      dismissOnPageChange: true
    });

    //mostra loading
    self.loading.present();

    let promisse;

    let campos = SyncHelper.getStringIndices(self.indices);

    this.imgDocs.forEach((doc, index) => {
        promisse = self.sync(campos, doc, index).then(self.envioSucesso, self.envioFalha);
      
    });

    promisse.then(res => {
      console.log("Final");
      self.loading.dismiss();
    })
  }

  envioSucesso(ordem) {

    console.log("OK Ordem: " + ordem);

  }

  envioFalha(erro) {

    console.log("FALHA Ordem: " + erro);

  }

  send(index): Promise<any> {

    let self = this;

    return new Promise((resolve, reject) => {

      let campos = SyncHelper.getStringIndices(self.indices);

      console.log(index);

      if (index < 0) { //se for o ultimo elemento
        resolve();
      }

      self.sync(campos, self.imgDocs[index], index).then(res => {

        self.send(index -= 1);

      }, erro => {

        reject();

      })
    });
    // self.imgDocs.forEach((element, index) => { 

    //   SyncHelper.getVetDoc(self.pasta, element.modelo, element.b64.split(",")[1], index).then(vetDoc => {

    //     self.e2doc.enviarDocumento(vetDoc[0], campos).then(res => {

    //       if (index == self.imgDocs.length - 1) {

    //         loading.dismiss();

    //         self.msgEnvioFinalizado("Envio finalizado, deseja incluir novos documentos?");
    //       }

    //     }, erro => {

    //       loading.dismiss();

    //       self.msgErroEnvio(erro);

    //     });
    //   });     

    // });
  }

  sync(campos, doc, ordem): Promise<any> {

    return new Promise((resolve, reject) => {

        let self = this;

        SyncHelper.getVetDoc(self.pasta, doc.modelo, doc.b64.split(",")[1], ordem).then(vetDoc => {

          console.log(vetDoc);

          self.e2doc.enviarDocumento(vetDoc[0], campos).then(res => {

            resolve(ordem);

          }, erro => {

            reject(ordem);

          });
        });
    })
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
                  reject(err);
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
            this.verifyOnLeave = false;
            console.log("Sim: ModeloPastaPage");
            this.navCtrl.push(ModeloPastaPage);
          }
        },
        {
          text: 'Não',
          role: 'cancel',
          handler: () => {
            this.verifyOnLeave = false;
            console.log("Não: HomePage");
            this.navCtrl.push(HomePage);
          }
        }
      ]
    }).present();
  }

}
