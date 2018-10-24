import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { MsgHelper } from '../../app/MsgHelper';
import { E2docProvider } from '../../providers/e2doc/e2doc';
import { File } from '@ionic-native/file';
import { ImageHelper } from '../../app/ImageHelper';
import * as CryptoJS from 'crypto-js';
import * as utf8 from 'utf8';



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

  getHash(path: string, fileName: string, callback: any) {

    let ctx = this;

    let base64 = ctx.getBase64Example();
    var objBlob =  this.imageHelper.base64toBlob(base64, "");
    
    var reader = new FileReader();

    reader.onloadend = function () {
      var hash = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(this.result));
      var md5 = hash.toString(CryptoJS.enc.Hex).toUpperCase();

      let strEncoded = utf8.encode(base64);      

      let res = { blob: strEncoded, hash: md5, size: objBlob.blob.size }   
      callback(res);
    }

    reader.readAsBinaryString(objBlob.blob);        
  }

  drawComplete() {

    let loading = this.loadingCtrl.create({
      spinner: 'dots',
      content: 'Aguarde, sincronizando com o e2docCloud'
    });

    loading.present();

    let ctx = this;

    this.getVetDoc().then((res) => {
      
      var campos = this.getStringCampos();
      
      this.e2doc.enviarDocumentos(res, campos).then(res => {
        loading.dismiss();
        ctx.msgHelper.presentToast2(res);        
      }, (err) => {
        console.log(err);
      });
    });
  }

  getVetDoc(): Promise<any> {

    return new Promise((resolve) => {
      let vetDoc = [];
      
      this.jObj.forEach((element, index) => {

        this.getHash(element.path, element.nm_imagem, function (res) {

          vetDoc.push({
            modelo: element.tipo_doc,
            descricao: element.tipo_doc,
            path: element.path,
            doc: res.blob, //element.blob,
            length: res.size, // / 1024, //element.blob_size,
            paginas: 1,
            hash: res.hash,
            extensao: ".jpg",
            id_doc: index,
            protocolo: element.protocolo,
            fileNamePart: element.protocolo + "_1.jpg"
          });
        });
      });

      this.signatureImage = this.signaturePad.toDataURL();

      this.getHash("", "", function (res) {

        var fileName = vetDoc[0].protocolo + "_1.png";

        vetDoc.push({
          modelo: "ASSINATURA",
          descricao: "ASSINATURA",
          path: "/myapp/" + fileName,
          doc: res.blob,
          length: res.size,
          paginas: 1,
          hash: res.hash,
          extensao: ".png",
          id_doc: vetDoc.length,
          protocolo: vetDoc[0].protocolo,
          fileNamePart: fileName
        });
      });

      resolve(vetDoc);
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

  getBase64Example() {
    return "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAMzBIADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKz/FnizS/AXhXUtd13UtP0XRNFtJb/UNQv7hLa1sLeJC8s0srkJHGiKzMzEBQCSQBQBoUV4f+zNc+PvjJ8QtY+J3jGz1Dwf4durR9F8GeEXvLnzBYLezyHW7+B4oDDeX8C2BWyuIpJdPS2ZfMjlu7yBfcKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKz/ABZc6rZ+FdSl0Kz0/UdbitJX0+0v7x7K1urgITFHLOkUzxRs+0NIsUhUEkI5G06FFAHn/wCyr8dP+Gl/2cfBfjqTS/8AhH9Q8SaVDc6pojXP2ibw7qIXZe6ZO2xD9otLpZraVWRHSWCRWRGUqPQK+f8A/gmn/wAm6+I/+yq/Ef8A9TfXa+gKACiiigAorn/ix8UtC+B3ws8S+NfFN9/ZfhnwfpV1rer3nkyT/ZLO2heaeXy41aR9saM21FZjjABOBXxh4s/a9sPin4q1KS8/aW8YeBfFdjdy2U/wr+DukaL4/wBf8KwwuUY6zbQaVrF2t4smUuZIhHZW8kkFqrTOou7wA+76K+AP7L/aR8d/uPBHiX9r/wD0795pWt+Nj8MvDWhXEH31muFj0a71i08yIfJFJpXnrI8cc8Vv+8aLoP8Ah1v8Xf2gvhZ/ZHxz/az+L+sefqv9p/2J4VsPDem6VHamHZ/ZN+39jj+2rceZOkv2iGG1vEKeZYR420Ae3+LP+CgXgGLxVqXhfwI+ofGfx3o93LYah4Z8Am21S60e4icrLDqNy80VhpUg2TlV1G5tjMbaaOESyp5dHhP9l/Vfir4q03xd8cz4P8Y63oV3FqPhjw7Yac76B4JuEcTJcxfaWZ73VInxGuqPHblY4h9ntbEz3YuOf8J/sFeMPAXhXTdC0L9p7436Lomi2kVhp+n2Hh/wLbWthbxIEihiiTw6EjjRFVVVQAoAAAArQ/4Y2+Iv/R2Px/8A/BR4I/8AmeoA+gKK+f8A/hjb4i/9HY/H/wD8FHgj/wCZ6j/hRH7QXgj/AEXwt+0D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KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/2Q==";
  }
}
