import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { MsgHelper } from '../../app/MsgHelper';
import { ToastController } from 'ionic-angular';

@Injectable()
export class E2docProvider {

  public user = "administrador";
  public pas = "E35tec.0102%";
  public key = "XXMP";

  public url = "https://www.e2doc.com.br/e2doc_webservice/sincronismo.asmx?wsdl";
  public headers: any;

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

  autenticarUsuario() {

    let input = "<?xml version=\"1.0\" encoding=\"utf-8\"?> \
<soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\"> \
  <soap12:Body> \
    <AutenticarUsuario xmlns=\"http://www.e2doc.com.br/\"> \
      <usuario>" + this.user + "</usuario> \
      <senha>" + this.pas + "</senha> \
      <key>" + this.key + "</key> \
    </AutenticarUsuario> \
  </soap12:Body> \
</soap12:Envelope>";

    let parser = new DOMParser();
    let doc = parser.parseFromString(input, "application/xml");

    let headers = new HttpHeaders()
      .set('Access-Control-Allow-Origin', '*')
      .set('Content-Type', 'application/xml');
    debugger;

    this.http.post(this.url, doc, { headers: headers })
      .subscribe((response) => {
        let result = new DOMParser().parseFromString(response.toString(), "text/xml").getElementsByTagName("AutenticarUsuarioResult")[0].innerHTML;
        debugger;

      }, (error) => {
        debugger;
        return "Erro";
      });
  }

  soapCall() {
    // const xmlhttp = new XMLHttpRequest();

    // // The following variable contains the xml SOAP request.
    // const sr =
    //   `<?xml version="1.0" encoding="utf-8"?>
    //     <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
    //       <soap12:Body>
    //         <AutenticarUsuario xmlns="http://www.e2doc.com.br/">
    //           <usuario>administrador</usuario>
    //           <senha>E35tec.0102%</senha>
    //           <key>XXMP</key>
    //         </AutenticarUsuario>
    //       </soap12:Body>
    //     </soap12:Envelope>`;

    // xmlhttp.onreadystatechange = () => {
    //   if (xmlhttp.readyState == 4) {
    //     if (xmlhttp.status == 200) {

    //       debugger;

    //       const xml = xmlhttp.responseXML;
    //       // Here I'm getting the value contained by the <return> node.
    //       const response_number = parseInt(xml.getElementsByTagName('return')[0].childNodes[0].nodeValue);
    //       // Print result square number.
    //       console.log(response_number);

    //       debugger;
    //     }
    //   }
    // }

    // // Send the POST request.
    // xmlhttp.open('POST', this.url, true);

    // // xmlhttp.setRequestHeader('Access-Control-Allow-Origin', '*');    
    // // xmlhttp.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    // // xmlhttp.setRequestHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
    // xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    // // xmlhttp.setRequestHeader('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
    // // xmlhttp.setRequestHeader('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

    // debugger;

    // xmlhttp.send(sr);

    var data = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\r\n        <soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\">\r\n          <soap12:Body>\r\n            <AutenticarUsuario xmlns=\"http://www.e2doc.com.br/\">\r\n              <usuario>administrador</usuario>\r\n              <senha>E35tec.0102!</senha>\r\n              <key>XXMP</key>\r\n            </AutenticarUsuario>\r\n          </soap12:Body>\r\n        </soap12:Envelope>";

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    let ctx = this;
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        ctx.msgHelper.presentToast(this.responseText);        
      }
    });

    xhr.open("POST", "https://www.e2doc.com.br/e2doc_webservice/sincronismo.asmx?wsdl=");
    xhr.setRequestHeader("Content-Type", "text/xml");
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.setRequestHeader("Postman-Token", "7ec23245-c579-4d41-8109-592dd2d802f9");

    xhr.send(data);
  }
}
