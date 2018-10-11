import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { MsgHelper } from '../../app/MsgHelper';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { File } from '@ionic-native/file';
import { ImageHelper } from '../../app/ImageHelper';

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
    private file: File) {    
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

  drawComplete() {

    let vetDoc = [];

    this.jObj.forEach((element, index) => {

      var fullPath = this.file.externalRootDirectory + "/myapp/" + element.nm_imagem;

      vetDoc.push({
        modelo: element.tipo_doc,
        descricao: element.tipo_doc,
        path: fullPath,
        doc: element.blob,
        length: element.blob_size,
        paginas: 1,
        hash: "",
        extensao: "JPG",
        id_doc: index,
        protocolo: element.protocolo,
        fileNamePart: element.protocolo + "_1.jpg"
      });
    });

    this.signatureImage = this.signaturePad.toDataURL();

    var contentType = this.imageHelper.getContentType(this.signatureImage);
    var blob = this.imageHelper.base64toBlob(this.signatureImage, contentType);
    var fileName = vetDoc[0].protocolo + "_1.png";

    vetDoc.push({
      modelo: "Assinatura",
      descricao: "Assinatura",
      path: this.file.externalRootDirectory + "/myapp/" + fileName,
      doc: blob,
      length: blob.size,
      paginas: 1,
      hash: "",
      extensao: "PNG",
      id_doc: vetDoc.length,
      protocolo: vetDoc[0].protocolo,
      fileNamePart: fileName
    });

    var campos = this.getStringCampos();

    this.e2doc.enviarDocumentos(vetDoc, campos);

    this.msgHelper.presentToast("Enviando documentos!");
  }

  private getStringCampos(): string {

    var campos = `<campo0>Nome<campo0><valor0>{0}<valor0>
                  <campo1>RG<campo1><valor1>{1}<valor1>
                  <campo2>CPF<campo2><valor2>{2}<valor2>
                  <campo3>Data nascimento<campo3><valor3>{3}<valor3>
                  <campo4>CEP<campo4><valor4>{4}<valor4>
                  <campo5>Rua<campo5><valor4>{5}<valor4>
                  <campo6>CIDADE<campo6><valor4>{6}<valor4>
                  <campo7>VALIDAÇÃO<campo7><valor4>{7}<valor4>`;

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
