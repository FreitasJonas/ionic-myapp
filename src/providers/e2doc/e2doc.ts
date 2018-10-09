import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class E2docProvider {

  constructor(public http: HttpClient) {
    console.log('Hello E2docProvider Provider');
  }

  sendImage(protocolo: string, tipo_doc: string, geoLocation: Coordinates, img: any) {
    //protocolo
    //tipo documento
    //imagem
    //dados celular (geo location)

    this.http.get("");

    switch (tipo_doc) {
      case "RG":
        return {
          protocolo: protocolo,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: protocolo + "_" + tipo_doc + ".jpg",
          imgInfo: {
            nr_rg: "0000000-9",
            nm_nome: "Jonas Freitas",
            dt_nascimento: "10/12/1996"
          }
        };
      case "CPF":
        return {
          protocolo: protocolo,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: protocolo + "_" + tipo_doc + ".jpg",
          imgInfo: {
            nr_cpf: "55555555866"
          }
        };
      case "COMP_RES":
        return {
          protocolo: protocolo,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: protocolo + "_" + tipo_doc + ".jpg",
          imgInfo: {
            cep: "06226-120",
            endereco: "Rua Goiania",
            cidade: "Osasco",
            estado: "SP"
          }
        };
      case "FOTO_DOC":
        return {
          protocolo: protocolo,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: protocolo + "_" + tipo_doc + ".jpg",
          imgInfo: {
            foto_status: "OK"
          }
        };
    }
  }
}
