import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { MsgHelper } from '../../app/MsgHelper';
import { ToastController } from 'ionic-angular';

@Injectable()
export class E2docProvider {

  public url = "https://www.e2doc.com.br/e2doc_webservice/sincronismo.asmx?wsdl";

  public user = "administrador";
  public pas = "E35tec.0102!";
  public key = "XXMP";

  public token = "";
  
  public msgHelper = new MsgHelper(this.toastCtrl);

  constructor(public http: HttpClient,
    public toastCtrl: ToastController) {    
  }

  sendImageFromOCR(protocolo: string, tipo_doc: string, geoLocation: Coordinates, img: any) {
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
  
  autenticar() {
    
    const xmlhttp = new XMLHttpRequest();

    // The following variable contains the xml SOAP request.
    const sr =
      `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <AutenticarUsuario xmlns="http://www.e2doc.com.br/">
              <usuario>` + this.user + `</usuario>
              <senha>` + this.pas + `</senha>
              <key>` + this.key + `</key>
            </AutenticarUsuario>
          </soap12:Body>
        </soap12:Envelope>`;

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          this.key = xml.getElementsByTagName('AutenticarUsuarioResult')[0].childNodes[0].nodeValue;          
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);
  }

  sincronismoIniciar(info: any, campos: string){

    console.log("Protocolo" + info.protocolo);
    console.log("Tipo" + info.tipo_doc);
    console.log("Imagem" + info.nm_imagem);

    const xmlhttp = new XMLHttpRequest();

    // The following variable contains the xml SOAP request.
    let sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoIniciar xmlns="http://www.e2doc.com.br/">
          <id>` + this.key + `</id>
          <modelo>` + info.tipo_doc + `</modelo>
          <campos>` + campos + `</campos>
          <usuario>` + this.user + `</usuario>
          <protocolo>` + info.protocolo + `</protocolo>
        </SincronismoIniciar>
      </soap:Body>
    </soap:Envelope>`;

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          let res = xml.getElementsByTagName('SincronismoIniciarResult')[0].childNodes[0].nodeValue;          
          debugger;
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);
  }
}
