import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { IndiceModel } from '../../helpers/IndiceModel';
import { Pasta } from '../../helpers/e2doc/Pasta';
import { IndiceModelConverter } from '../../helpers/IndiceModelConverter';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { Hasher } from '../../helpers/Hasher';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { e2docHelper } from '../../helpers/e2doc/e2docHelper';
import { HomePage } from '../home/home';

@IonicPage()
@Component({
  selector: 'page-tarefa',
  templateUrl: 'tarefa.html',
})
export class TarefaPage {

  @ViewChild(SignaturePad) signaturePad: SignaturePad;

  //pasta
  public pasta: Pasta;

  //Indice Model
  public indices: Array<IndiceModel>;

  //canvas da assinatura
  public signatureCanvas;

  //base64 da assinatura
  public signatureImage: string;

  //Opções do canvas da assinatura
  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 2,
    'canvasWidth': 380,
    'canvasHeight': 250
  };

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private e2doc: E2docSincronismoProvider
  ) {

    //obtem a chave do storage recebido por parametro
    this.pasta = this.navParams.get('pasta');

    //define protocolo
    let dt = new Date();
    this.pasta.protocolo =
      dt.getFullYear().toString() +
      (dt.getMonth() + 1).toString() +
      dt.getDate().toString() +
      dt.getHours().toString() +
      dt.getMinutes().toString() +
      dt.getSeconds().toString() +
      dt.getMilliseconds().toString();


    this.indices = IndiceModelConverter.converter(this.pasta);
  }

  //limpa canvas da assinatura
  drawClear() {
    this.signaturePad.clear();
  }

  drawComplete() {

    let self = this;

    //cria loading
    let loading = self.loadingCtrl.create({
      spinner: 'dots',
      content: 'Aguarde, sincronizando com o e2docCloud'
    });

    //mostra loading
    loading.present();

    //base64 da imagem do canvas(assinatura)
    self.signatureImage = self.signaturePad.toDataURL().split(",")[1];

    Hasher.getHash(self.signatureImage, function (result) {

      let doc = self.pasta.pastaDocumentos.find((d => d.docNome == "Assinatura"));

      let vetDoc = [];

      var fileName = self.pasta.protocolo + "_1.PNG";

      vetDoc.push({
        modeloPasta: self.pasta.pastaNome,                    //modelo de pasta
        modelo: doc.docNome,                                  //modelo de documento
        descricao: doc.docNome,                               //modelo de documento
        path: "/myapp/" + fileName,                               //caminho do arquivo, não possui por que não é salvo no disposiivo
        fileString: self.signatureImage,                        //string binaria do arquivo         
        length: result.size,                               //tamanho em bytes do arquivo
        paginas: 1,                                               //arquivo sempre será de 1 pagina
        hash: result.hash,                                //hash gerado a partir da string binaria
        extensao: ".PNG",                        //sempre .jpg
        id_doc: 2,                                            //ordem do documento, indice do loop
        protocolo: self.pasta.protocolo + "_" + 1,             //protocolo + ordem do documento
        fileNamePart: self.pasta.protocolo + "_" + 1 + ".PNG"  //nome da parte, será sempre apenas uma parte
      });

      var campos = e2docHelper.getStringIndices(self.indices);
      
      self.e2doc.enviarDocumentos(vetDoc, 0, campos).then(res => {

        //ao final o loading é finalizado                
        loading.dismiss();

        //exibe alert
        self.alertCtrl.create({
          title: '',
          message: "Envio finalizado!",
          buttons: [
            {
              text: 'OK',
              role: 'cancel',
              handler: () => {
                //retorna para o menu
                self.navCtrl.push(HomePage);
              }
            }
          ]
        }).present();

      }, (err) => {
        loading.dismiss();

        //exibe alert
        self.alertCtrl.create({
          title: '',
          message: "Erro: " + err,
          buttons: [
            {
              text: 'OK',
              role: 'cancel'
            }
          ]
        }).present();
      });
    });
  }
}
