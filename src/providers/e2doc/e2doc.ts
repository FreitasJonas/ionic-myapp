import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { MsgHelper } from '../../app/MsgHelper';
import { ToastController } from 'ionic-angular';
import { ImageHelper } from '../../app/ImageHelper';

@Injectable()
export class E2docProvider {

  public url = "https://www.e2doc.com.br/e2doc_webservice/sincronismo.asmx?wsdl";

  public user = "administrador";
  public pas = "E35tec.0102!";
  public key = "XXMP";

  public token = "";
  public retorno = "";

  public msgHelper = new MsgHelper(this.toastCtrl);

  private imageHelper = new ImageHelper();

  constructor(public http: HttpClient,
    public toastCtrl: ToastController) {
  }

  sendImageFromOCR(protocolo: string, tipo_doc: string, geoLocation: Coordinates, img: any) {
    //protocolo
    //tipo documento
    //imagem
    //dados celular (geo location)

    //this.http.get("");
    
    var contentType = this.imageHelper.getContentType(img);
    var blob = this.imageHelper.base64toBlob(img, contentType);

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
            dt_nascimento: "10/12/1996",
            contentType: contentType,
            blob_size: blob.size,
            blob: blob
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
            nr_cpf: "55555555866",
            contentType: contentType,
            blob_size: blob.size,
            blob: blob
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
            estado: "SP",
            contentType: contentType,
            blob_size: blob.size,
            blob: blob
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
            foto_status: "OK",
            contentType: contentType,
            blob_size: blob.size,
            blob: blob
          }
        };
    }
  }

  autenticar(fn: any) {

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

    let ctx = this;
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          ctx.token = xml.getElementsByTagName('AutenticarUsuarioResult')[0].childNodes[0].nodeValue;          
          if (typeof fn === 'function') {
            fn(ctx.token);
          }
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);
  }

  sincronismoIniciar(info: any, campos: string, fn: any) {

    const xmlhttp = new XMLHttpRequest();

    // The following variable contains the xml SOAP request.
    let sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoIniciar xmlns="http://www.e2doc.com.br/">
          <id>` + this.token + `</id>
          <modelo>CONTRATACAO</modelo>
          <campos>` + campos + `</campos>
          <usuario>` + this.user + `</usuario>
          <protocolo>` + info.protocolo + `</protocolo>
        </SincronismoIniciar>
      </soap:Body>
    </soap:Envelope>`;

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    let ctx = this;
    xmlhttp.onreadystatechange = () => {      
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          ctx.retorno = xml.getElementsByTagName('SincronismoIniciarResult')[0].childNodes[0].nodeValue;          
          if (typeof fn === 'function') {
            fn(ctx.retorno);            
          }
        }
      }
      else{
        //debugger;
      }
    }
    
    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);
  }

  sincronismoEnviaParte(info: any, campos: string, fn: any) {

    const xmlhttp = new XMLHttpRequest();

    // The following variable contains the xml SOAP request.
    let sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoEnviarParte xmlns="http://www.e2doc.com.br/">
          <id>` + this.token + `</id>
          <fileNamePart>` + info.fileNamePart + `</fileNamePart>
          <buffer>` + info.doc + `</buffer>
        </SincronismoEnviarParte>
      </soap:Body>
    </soap:Envelope>`;

    debugger;

    let ctx = this;
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          ctx.retorno = xml.getElementsByTagName('SincronismoEnviarParteResult')[0].childNodes[0].nodeValue;
          debugger;
          if (typeof fn === 'function') {
            fn(ctx.retorno);
          }
        }
      }
      else{
        debugger;
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);
  }

  sincronismoEnviarArquivo(info: any, fn: any) {

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

    let ctx = this;
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          ctx.retorno = xml.getElementsByTagName('SincronismoEnviarArquivoResult')[0].childNodes[0].nodeValue;

          if (typeof fn === 'function') {
            fn(ctx.retorno);
          }
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);
  }

  sincronismoFinalizar(protocolo: string, fn: any) {

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

    let ctx = this;
    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          ctx.retorno = xml.getElementsByTagName('SincronismoFinalizarResult')[0].childNodes[0].nodeValue;

          if (typeof fn === 'function') {
            fn(ctx.retorno);
          }
        }
      }
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');

    xmlhttp.send(sr);

  }

  enviarDocumentos(vetDoc: any[], campos: string): any {

    let ctx = this;
    this.autenticar(function(res){
      if (res.indexOf("[ERRO]") <= 0) {
        ctx.msgHelper.presentToast("Autenticado!");

        vetDoc.forEach((element, index) => {

          ctx.sincronismoIniciar(element, campos, function (res) { //Sincronismo iniciar
            if (res.indexOf("[ERRO]") <= 0) {

              debugger;

              if(res == element.protocolo){
                ctx.msgHelper.presentToast("Sincronismo Iniciado"!);
              }
              else{
                ctx.msgHelper.presentToast("Erro Inicia Sync" + res);
              }

              ctx.sincronismoEnviaParte(element, campos, function (res) { //Enviar parte
                if (res.indexOf("[ERRO]") <= 0) {
                  debugger;
                  ctx.sincronismoEnviarArquivo(element, function (res) { //Enviar arquivo
                    if (res.indexOf("[ERRO]") <= 0) {
                      ctx.sincronismoFinalizar(element.protocolo, function (res) { //Finalizando
                        if (res.indexOf("[ERRO]") <= 0) {
                          ctx.msgHelper.presentToast2("Documento enviado com sucesso");
                        }
                        else {
                          ctx.msgHelper.presentToast2("Erro finalizando sincronismo " + element.tipo_doc + " \n" + res);
                        }
                      })
                    }
                    else {
                      ctx.msgHelper.presentToast2("Erro enviando arquivo " + element.tipo_doc + " \n" + res);
                    }
                  })
                }
                else {
                  ctx.msgHelper.presentToast2("Erro enviando parte " + element.tipo_doc + " \n" + res);
                }
              });
            }
            else {
              ctx.msgHelper.presentToast2("Erro iniciar sincronismo " + element.tipo_doc + " \n" + res);
            }
          })

        });
      }else{
        ctx.msgHelper.presentToast2("Erro atenticar \n" + res);
      }
    });
    
  }
}
