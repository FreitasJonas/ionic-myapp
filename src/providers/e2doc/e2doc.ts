import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsgHelper } from '../../app/MsgHelper';
import { ToastController } from 'ionic-angular';
import { ImageHelper } from '../../app/ImageHelper';
import { File } from '@ionic-native/file';
import { XmlTextProvider } from '../xml-text/xml-text';

@Injectable()
export class E2docProvider {

  //public url = "http://192.168.0.126/e2doc_webservice/sincronismo.asmx?wsdl";
  public url = "https://www.e2doc.com.br/e2doc_webservice/sincronismo.asmx?wsdl";

  public user = "administrador";
  public pas = "E35tec.0102!";
  public key = "XXMP";

  public token = "";
  public retorno = "";

  public msgHelper = new MsgHelper(this.toastCtrl);

  private imageHelper = new ImageHelper();

  constructor(public http: HttpClient,
    public toastCtrl: ToastController,
    private file: File,
    private xmlProvider: XmlTextProvider) {
  }

  sendImageFromOCR(protocolo: string, tipo_doc: string, geoLocation: Coordinates, img: any) {
    //protocolo
    //tipo documento
    //imagem
    //dados celular (geo location)

    //this.http.get("");

    var contentType = this.imageHelper.getContentType(img);
    var objBlob = this.imageHelper.base64toBlob(img, contentType);
    var path = this.file.externalRootDirectory + "myapp";

    let nm_imagem = protocolo + "_" + tipo_doc + ".jpg";

    this.file.writeFile(path, nm_imagem, objBlob.blob);

    switch (tipo_doc) {
      case "RG":
        return {
          protocolo: protocolo,
          location: geoLocation.latitude + "_" + geoLocation.longitude,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: nm_imagem,
          path: path,
          imgInfo: {
            nr_rg: "0000000-9",
            nm_nome: "Jonas Freitas",
            dt_nascimento: "10/12/1996",
            contentType: contentType,
            blob_size: objBlob.blob,
            blob: objBlob
          }
        };
      case "CPF":
        return {
          protocolo: protocolo,
          location: geoLocation.latitude + "_" + geoLocation.longitude,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: nm_imagem,
          path: path,
          imgInfo: {
            nr_cpf: "55555555866",
            contentType: contentType,
            blob_size: objBlob.blob,
            blob: objBlob
          }
        };
      case "COMP RESIDENCIA":
        return {
          protocolo: protocolo,
          location: geoLocation.latitude + "_" + geoLocation.longitude,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: nm_imagem,
          path: path,
          imgInfo: {
            cep: "06226-120",
            endereco: "Rua Goiania",
            cidade: "Osasco",
            estado: "SP",
            contentType: contentType,
            blob_size: objBlob.blob,
            blob: objBlob
          }
        };
      case "FOTO E DOC":
        return {
          protocolo: protocolo,
          location: geoLocation.latitude + "_" + geoLocation.longitude,
          status: "OK",
          tipo_doc: tipo_doc,
          nm_imagem: nm_imagem,
          path: path,
          imgInfo: {
            foto_status: "OK",
            contentType: contentType,
            blob_size: objBlob.blob,
            blob: objBlob
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
    }

    // Send the POST request.
    xmlhttp.open('POST', this.url, true);

    xmlhttp.setRequestHeader('Content-Type', 'text/xml');
    
    xmlhttp.send(sr);
  }

  sincronismoEnviaParte(info: any, fn: any) {

    const xmlhttp = new XMLHttpRequest();

    // The following variable contains the xml SOAP request.
    let sr = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoEnviarParte xmlns="http://www.e2doc.com.br/">
          <id>`+ this.token + `</id>
          <fileNamePart>`+ info.fileNamePart + `</fileNamePart>
          <buffer><![CDATA[`+ info.doc + `]]></buffer>
        </SincronismoEnviarParte>
      </soap:Body>
    </soap:Envelope>`;

    // var parser = new DOMParser();
    // var xmlDoc = parser.parseFromString(sr, "application/xml");
    // xmlDoc.getElementsByTagName("id")[0].textContent = "<![CDATA[" + this.token + "]]>";
    // xmlDoc.getElementsByTagName("fileNamePart")[0].textContent = info.fileNamePart;
    // xmlDoc.getElementsByTagName("buffer")[0].textContent = "<![CDATA[" + info.doc + "]]>";

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          const xml = xmlhttp.responseXML;
          let res = xml.getElementsByTagName('SincronismoEnviarParteResult')[0].childNodes[0].nodeValue;
          if (typeof fn === 'function') {
            fn(res);
          }
        }
      }
      else {
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
          <id>` + this.token + `</id>
          <partes>            
            <string>`+ info.fileNamePart + `</string>
          </partes>
          <vDadosDocumento>
            <string>`+ info.modelo + `</string>
            <string>`+ info.descricao + `</string>
            <string>`+ info.path + `</string>
            <string>`+ info.length + `</string>
            <string>`+ info.paginas + `</string>
            <string>`+ info.protocolo + `</string>
            <string>`+ info.hash + `</string>
            <string>`+ info.extensao + `</string>
            <string>`+ info.id_doc + `</string>            
          </vDadosDocumento>
          <modelo> CONTRATACAO </modelo>
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
        <id>` + this.token + `</id>
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

  enviarDocumentos(vetDoc: any, campos: string): Promise<string> {

    return new Promise((resolve, reject) => {

      let ctx = this;
      var msg = "";

      ctx.autenticar(function (res) {

        var doc = vetDoc[0];
        
        ctx.sincronismoIniciar(doc, campos, function (res) { //Sincronismo iniciar
          console.log("Sincronismo iniciar: " + res);
          ctx.sincronismoEnviaParte(doc, function (res) { //Enviar parte
            console.log("sincronismoEnviaParte: " + res);
            ctx.sincronismoEnviarArquivo(doc, function (res) { //Enviar arquivo
              console.log("sincronismoEnviarArquivo: " + res);
              ctx.sincronismoFinalizar(doc.protocolo, function (res) { //Finalizando
                console.log("sincronismoFinalizar: " + res)
                resolve("Envio finalizado");
              });
            });
          });
        });
      });

      setTimeout(() => {

      ctx.autenticar(function (res) {

        var doc = vetDoc[1];
        
        ctx.sincronismoIniciar(doc, campos, function (res) { //Sincronismo iniciar
          console.log("Sincronismo iniciar: " + res);
          ctx.sincronismoEnviaParte(doc, function (res) { //Enviar parte
            console.log("sincronismoEnviaParte: " + res);
            ctx.sincronismoEnviarArquivo(doc, function (res) { //Enviar arquivo
              console.log("sincronismoEnviarArquivo: " + res);
              ctx.sincronismoFinalizar(doc.protocolo, function (res) { //Finalizando
                console.log("sincronismoFinalizar: " + res)
                resolve("Envio finalizado");
              });
            });
          });
        });
      });
    }, 1000);

    setTimeout(() => {

      ctx.autenticar(function (res) {

        var doc = vetDoc[2];
        
        ctx.sincronismoIniciar(doc, campos, function (res) { //Sincronismo iniciar
          console.log("Sincronismo iniciar: " + res);
          ctx.sincronismoEnviaParte(doc, function (res) { //Enviar parte
            console.log("sincronismoEnviaParte: " + res);
            ctx.sincronismoEnviarArquivo(doc, function (res) { //Enviar arquivo
              console.log("sincronismoEnviarArquivo: " + res);
              ctx.sincronismoFinalizar(doc.protocolo, function (res) { //Finalizando
                console.log("sincronismoFinalizar: " + res)
                resolve("Envio finalizado");
              });
            });
          });
        });
      });
    }, 1000);

      // ctx.autenticar(function (res) {

      //   if (res.indexOf(res) <= 0) {
      //     vetDoc.forEach((element, index) => {

      //       setTimeout(() => {
      //         console.log("Enviando " + element.modelo + " " + index)
      //         ctx.sincronismoIniciar(element, campos, function (res) { //Sincronismo iniciar
      //           console.log("Sincronismo iniciar: " + res + " " + index)
      //           ctx.sincronismoEnviaParte(element, function (res) { //Enviar parte
      //             console.log("sincronismoEnviaParte: " + res + " " + index)
      //             ctx.sincronismoEnviarArquivo(element, function (res) { //Enviar arquivo
      //               console.log("sincronismoEnviarArquivo " + element.modelo + " " + index)
      //               ctx.sincronismoFinalizar(element.protocolo, function (res) { //Finalizando                      
      //                 console.log("Envio finalizado " + element.modelo);
      //                 resolve(msg);
      //               });
      //             });
      //           });
      //         });
      //       }, 10000);
      //     });
      //   }
      //   else {
      //     reject(res);
      //   }
      // });
    });
  }
}
