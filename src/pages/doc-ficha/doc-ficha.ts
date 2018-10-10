import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';
import { MsgHelper } from '../../app/MsgHelper';
import { E2docProvider } from '../../providers/e2doc/e2doc';

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

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public toastCtrl: ToastController,
    private e2doc: E2docProvider) {
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

  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 5,
    'canvasWidth': 340,
    'canvasHeight': 200
  };

  drawClear(){
    this.signaturePad.clear();
  }

  drawComplete(){

    var campos = this.getStringCampos();

    this.signatureImage = this.signaturePad.toDataURL();
    this.e2doc.autenticar();
    this.e2doc.sincronismoIniciar(this.jObj, campos);

    this.msgHelper.presentToast("Enviando documentos");
  }

  private getStringCampos(): string {

    var campos = `<campo0>NOME<campo0><valor0>{0}<valor0>
                  <campo1>RG<campo1><valor1>{1}<valor1>
                  <campo2>CPF<campo2><valor2>{2}<valor2>
                  <campo3>Data de nascimento<campo3><valor3>{3}<valor3>
                  <campo4>CEP<campo4><valor4>{4}<valor4>`;
    campos = campos.replace("{0}", this.rg);



    debugger;

    return "";
  }
}
