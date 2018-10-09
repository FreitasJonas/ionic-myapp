import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';

@IonicPage()
@Component({
  selector: 'page-signature',
  templateUrl: 'signature.html',
})
export class SignaturePage {

  @ViewChild(SignaturePad) signaturePad: SignaturePad;

  public signatureImage: string;
  
  constructor(public navParams: NavParams) {
  }

  public signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 5,
    'canvasWidth': 340,
    'canvasHeight': 200
  };

  drawComplete(){
    this.signatureImage = this.signaturePad.toDataURL();
    console.log(this.signatureImage);
  }

  drawClear(){
    this.signaturePad.clear();
  }
}
