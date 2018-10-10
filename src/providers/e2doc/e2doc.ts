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
  public retorno = "";
  
  public msgHelper = new MsgHelper(this.toastCtrl);

  constructor(public http: HttpClient,
    public toastCtrl: ToastController) {    
  }

  sendImageFromOCR(protocolo: string, tipo_doc: string, geoLocation: Coordinates, img: any) {
    //protocolo
    //tipo documento
    //imagem
    //dados celular (geo location)

    //this.http.get("");

    switch (tipo_doc) {
      case "RG":
        return {
          protocolo: protocolo,   
          location: geoLocation.latitude + "_" + geoLocation.longitude,               
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
          location: geoLocation.latitude + "_" + geoLocation.longitude,       
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
          location: geoLocation.latitude + "_" + geoLocation.longitude,          
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
          location: geoLocation.latitude + "_" + geoLocation.longitude,         
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
          this.retorno = xml.getElementsByTagName('SincronismoIniciarResult')[0].childNodes[0].nodeValue;                    
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);
  }

  sincronismoEnviaParte(info: any, campos: string){

    const xmlhttp = new XMLHttpRequest();

    // The following variable contains the xml SOAP request.
    let sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoEnviarParte xmlns="http://www.e2doc.com.br/">
          <id>` + this.key + `</id>
          <fileNamePart>` + info.fileNamePart + `</fileNamePart>
          <buffer>` + info.blob + `</buffer>
        </SincronismoEnviarParte>
      </soap:Body>
    </soap:Envelope>`;

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          this.retorno = xml.getElementsByTagName('SincronismoEnviarParteResult')[0].childNodes[0].nodeValue;                    
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);
  }

  sincronismoEnviarArquivo(info: any){

    const xmlhttp = new XMLHttpRequest();

    //vDocumento.Add(p["descricao"].ToString());                                              // Documento
    //vDocumento.Add(p["descricao"].ToString());                                              // Descrição
    //vDocumento.Add(arquivo);                                                                // path do arquivo
    //vDocumento.Add(file.Length.ToString());                                                 // tamanho
    //vDocumento.Add(p["paginas"].ToString());                                                // paginas
    //vDocumento.Add(new Geral().CriaID(12));                                                 // protocolo
    //vDocumento.Add(p["hash"].ToString().ToUpper());                                         // hash
    //vDocumento.Add(extensao);                                                               // extensao
    //vDocumento.Add(id_doc);                                                                 // sequencia do documento

    // The following variable contains the xml SOAP request.
    let sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SincronismoEnviarArquivo xmlns="http://www.e2doc.com.br/">
          <id>` + this.key + `</id>
          <partes>            
            <string>`+ info.fileNamePart + `</string>
          </partes>
          <vDadosDocumento>
            <string>`+ info.modelo + `</string>
            <string>`+ info.descricao + `</string>
            <string>`+ info.fullPath + `</string>
            <string>`+ info.length + `</string>
            <string>`+ info.paginas + `</string>
            <string>`+ info.protocolo + `</string>
            <string>`+ info.hash + `</string>
            <string>`+ info.extensao + `</string>
            <string>`+ info.id_doc + `</string>            
          </vDadosDocumento>
          <modelo>`+ info.modelo + `</modelo>
          <protocolo>`+ info.protocolo + `</protocolo>
        </SincronismoEnviarArquivo>
      </soap12:Body>
    </soap12:Envelope>`;

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          this.retorno = xml.getElementsByTagName('SincronismoEnviarArquivoResult')[0].childNodes[0].nodeValue;                    
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);  
  }

  sincronismoFinalizar(protocolo: string) {

    const xmlhttp = new XMLHttpRequest();

    // The following variable contains the xml SOAP request.
    let sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SincronismoFinalizar xmlns="http://www.e2doc.com.br/">
        <id>` + this.key + `</id>
          <protocolo>` + protocolo + `</protocolo>
        </SincronismoFinalizar>
      </soap12:Body>
    </soap12:Envelope>`;

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          this.retorno = xml.getElementsByTagName('SincronismoFinalizarResult')[0].childNodes[0].nodeValue;                    
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);

  }
}
