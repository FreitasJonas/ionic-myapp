import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { MsgHelper } from '../../app/MsgHelper';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { File } from '@ionic-native/file';
import { ImageHelper } from '../../app/ImageHelper';
import * as CryptoJS from 'crypto-js';
import { createText } from '@angular/core/src/view/text';

@IonicPage()
@Component({
  selector: 'page-doc-ficha',
  templateUrl: 'doc-ficha.html',
})
export class DocFichaPage {

  @ViewChild(SignaturePad) signaturePad: SignaturePad;

  public nome = "";
  public rg = "";
  public cpf = "";
  public dt_nascimento = "";
  public cep = "";
  public endereco = "";
  public cidade = "";
  public estado = "";

  public msgHelper = new MsgHelper(this.toastCtrl);

  public signatureImage: string;

  public jObj: any;

  public signatureCanvas;

  private imageHelper = new ImageHelper();

  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 2,
    'canvasWidth': 380,
    'canvasHeight': 250
  };

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public toastCtrl: ToastController,
    private e2doc: E2docProvider,
    private file: File,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController) {
  }

  ionViewDidLoad() {

    let key = this.navParams.get('key');

    this.storage.get(key).then((res) => {

      this.jObj = res;

      this.nome = res[0].imgInfo.nm_nome;
      this.rg = res[0].imgInfo.nr_rg;
      this.dt_nascimento = res[0].imgInfo.dt_nascimento;

      this.cpf = res[1].imgInfo.nr_cpf;

      this.cep = res[2].imgInfo.cep;
      this.endereco = res[2].imgInfo.endereco;
      this.cidade = res[2].imgInfo.cidade;
      this.estado = res[2].imgInfo.estado;
    });
  }

  drawClear() {
    this.signaturePad.clear();
  }

  testCrypto() {
    let base64 = "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";

    var blob = this.imageHelper.base64toBlob(base64, "");
    var strBlob = this.imageHelper._base64ToArrayBuffer(base64);

    var hash = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(blob));
    var md5 = hash.toString(CryptoJS.enc.Hex).toUpperCase();

    return { blob: strBlob, hash: md5, size: blob.size }
  }

  drawComplete() {

    let vetDoc = [];

    const objHash = this.testCrypto();

    this.jObj.forEach((element, index) => {

      var path = "/myapp/" + element.nm_imagem;

      vetDoc.push({
        modelo: element.tipo_doc,
        descricao: element.tipo_doc,
        path: path,
        doc: objHash.blob, //element.blob,
        length: objHash.size, // / 1024, //element.blob_size,
        paginas: 1,
        hash: objHash.hash,
        extensao: "JPG",
        id_doc: index,
        protocolo: element.protocolo,
        fileNamePart: element.protocolo + "_1.jpg"
      });
    });

    this.signatureImage = this.signaturePad.toDataURL();

    var fileName = vetDoc[0].protocolo + "_1.png";

    vetDoc.push({
      modelo: "ASSINATURA",
      descricao: "ASSINATURA",
      path: "/myapp/" + fileName,
      doc: objHash.blob,
      length: objHash.size,
      paginas: 1,
      hash: objHash.hash,
      extensao: "PNG",
      id_doc: vetDoc.length,
      protocolo: vetDoc[0].protocolo,
      fileNamePart: fileName
    });

    var campos = this.getStringCampos();
        
    //this.e2doc.enviarDocumentos(vetDoc, campos);    

    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Aguarde, processando imagem'
    });

    loading.present();

    let ctx = this;
    
    this.e2doc.teste(vetDoc, campos).then(res => {
      loading.dismiss();
      ctx.msgHelper.presentToast2(res);
      console.log(res);
    }, (err) => {
      console.log(err);
    });
  }

  private getStringCampos(): string {

    var campos = `<![CDATA[<indice0>NOME</indice0><valor0>{0}</valor0>
      <indice1>RG</indice1><valor1>{1}</valor1>
      <indice2>CPF</indice2><valor2>{2}</valor2>
      <indice3>DATA NASCIMENTO</indice3><valor3>{3}</valor3>
      <indice4>CEP</indice4><valor4>{4}</valor4>
      <indice5>RUA</indice5><valor5>{5}</valor5>
      <indice6>CIDADE</indice6><valor6>{6}</valor6>
      <indice7>VALIDACAO</indice7><valor7>{7}</valor7>]]>`;

    campos = campos.replace("{0}", this.nome);
    campos = campos.replace("{1}", this.rg);
    campos = campos.replace("{2}", this.cpf);
    campos = campos.replace("{3}", this.dt_nascimento);
    campos = campos.replace("{4}", this.cep);
    campos = campos.replace("{5}", this.cidade);
    campos = campos.replace("{6}", this.cidade);
    campos = campos.replace("{7}", this.jObj[0].location);

    return campos;
  }

  getDocInfo(path: string, name: string, callback) {

    this.file.readAsDataURL(path, name).then((res) => {

      if (typeof callback === 'function') {
        callback(res);
      }
    }).
      catch((res) => {

        if (typeof callback === 'function') {
          let err = {
            status: "erro",
            msg: res
          };
          callback(err);
        }
      });
  }
}
