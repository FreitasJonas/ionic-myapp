import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class E2docProvider {

  constructor(public http: HttpClient) {
    console.log('Hello E2docProvider Provider');
  }

  sendImage(protocolo: string, tipoDoc: string, geoLocation: Coordinates, img: any) {
    //protocolo
    //tipo documento
    //imagem
    //dados celular (geo location)

    this.http.get("");

    return {
      protocolo: protocolo,
      status: "OK",
      tipo_doc: tipoDoc,
      numero_rg: "123456",
      nm_imagem: protocolo + "_" + tipoDoc + ".jpg"
    };
  }
}
