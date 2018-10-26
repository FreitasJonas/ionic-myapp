import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsgHelper } from '../../app/MsgHelper';
import { ToastController } from 'ionic-angular';
import { ImageHelper } from '../../app/ImageHelper';
import { File } from '@ionic-native/file';
import { XmlTextProvider } from '../xml-text/xml-text';

@Injectable()
export class E2docProvider {

  public user = "jonas";
  public pas = "Hoje01!";
  public key = "XXMP";

  public token = "";
  public retorno = "";

  public OK = -1;
  public ERRO = -0;

  public msgHelper = new MsgHelper(this.toastCtrl);

  private imageHelper = new ImageHelper();

  constructor(public http: HttpClient,
    public toastCtrl: ToastController,
    private file: File,
    private xmlProvider: XmlTextProvider) {
  }

  isError(str: string): boolean {

    var msg = str.indexOf("[ERRO]");

    if (msg == this.OK) {
      return true;
    }
    else {
      return false;
    }
  }

  //texto xml
  //tag de resultado para obter valor
  postSOAP(xml: any): Promise<string> {

    return new Promise((resolve, reject) => {

      const xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            const xmlDocument = xmlhttp.responseXML;
            let result = xmlDocument.getElementsByTagName(xml.tagResult)[0].childNodes[0].nodeValue;                       
            if (this.isError(result)) {              
              resolve(result);
            }
            else {
              reject(result);
            }
          }
        }
      }

      // Send the POST request.
      xmlhttp.open('POST', xml.url, true);

      xmlhttp.setRequestHeader('Content-Type', 'text/xml');

      xmlhttp.send(xml.xmlText);

    });
  }

  //protocolo
  //tipo documento
  //dados celular (geo location)
  //imagem  
  sendImageFromOCR(protocolo: string, tipo_doc: string, extensao: string, hash: string, b64string: string): Promise<string> {

    return new Promise((resolve, reject) => {

      console.log("Autenticando!");
      this.postSOAP(this.xmlProvider.getXmlAutenticarApp(this.user, this.pas, this.key)).then((token) => {

        console.log("Upload!");
        this.postSOAP(this.xmlProvider.getXmlUpload(token, protocolo, tipo_doc, extensao, hash, b64string)).then((res) => {

          resolve(tipo_doc + ": Envio finalizado!");

        }, (err) => {
          reject(tipo_doc + " Falha no upload: " + err);
        })
      }, (err) => {
        reject("Falha na autentição: " + err);
      });
    });



    // var contentType = this.imageHelper.getContentType(img);
    // var objBlob = this.imageHelper.base64toBlob(img, contentType);
    // var path = this.file.externalRootDirectory + "myapp";

    // let nm_imagem = protocolo + "_" + tipo_doc + ".jpg";

    // this.file.writeFile(path, nm_imagem, objBlob.blob);

    // switch (tipo_doc) {
    //   case "RG":
    //     return {
    //       protocolo: protocolo,
    //       location: geoLocation.latitude + "_" + geoLocation.longitude,
    //       status: "OK",
    //       tipo_doc: tipo_doc,
    //       nm_imagem: nm_imagem,
    //       path: path,
    //       base64: "",
    //       imgInfo: {
    //         nr_rg: "0000000-9",
    //         nm_nome: "Jonas Freitas",
    //         dt_nascimento: "10/12/1996",
    //         contentType: contentType,
    //         blob_size: objBlob.blob,
    //         blob: objBlob
    //       }
    //     };
    //   case "CPF":
    //     return {
    //       protocolo: protocolo,
    //       location: geoLocation.latitude + "_" + geoLocation.longitude,
    //       status: "OK",
    //       tipo_doc: tipo_doc,
    //       nm_imagem: nm_imagem,
    //       path: path,
    //       base64: "",
    //       imgInfo: {
    //         nr_cpf: "55555555866",
    //         contentType: contentType,
    //         blob_size: objBlob.blob,
    //         blob: objBlob
    //       }
    //     };
    //   case "COMP RESIDENCIA":
    //     return {
    //       protocolo: protocolo,
    //       location: geoLocation.latitude + "_" + geoLocation.longitude,
    //       status: "OK",
    //       tipo_doc: tipo_doc,
    //       nm_imagem: nm_imagem,
    //       path: path,
    //       base64: "",
    //       imgInfo: {
    //         cep: "06226-120",
    //         endereco: "Rua Goiania",
    //         cidade: "Osasco",
    //         estado: "SP",
    //         contentType: contentType,
    //         blob_size: objBlob.blob,
    //         blob: objBlob
    //       }
    //     };
    //   case "FOTO E DOC":
    //     return {
    //       protocolo: protocolo,
    //       location: geoLocation.latitude + "_" + geoLocation.longitude,
    //       status: "OK",
    //       tipo_doc: tipo_doc,
    //       nm_imagem: nm_imagem,
    //       path: path,
    //       base64: "",
    //       imgInfo: {
    //         foto_status: "OK",
    //         contentType: contentType,
    //         blob_size: objBlob.blob,
    //         blob: objBlob
    //       }
    //     };
    // }
  }


  //vetor de documentos
  //indice do objeto a ser enviado
  //campos
  enviarDocumentos(vetDoc: any, index: number, campos: string): Promise<string> {

    return new Promise((resolve, reject) => {

      console.log("Autenticando!");
      this.postSOAP(this.xmlProvider.getXmlAutenticar(this.user, this.pas, this.key)).then((res) => {

        this.token = res;

        let doc = vetDoc[index];

        console.log(doc);

        console.log("Iniciando Sincronismo!");
        this.postSOAP(this.xmlProvider.getXmlSincIniciar(res, campos, this.user, doc.protocolo)).then((res) => {

          console.log("Enviando Parte!");
          this.postSOAP(this.xmlProvider.getXmlEnviaParte(this.token, doc.fileNamePart, doc.fileString)).then((res) => {

            console.log("Enviando arquivo!");
            this.postSOAP(this.xmlProvider.getXmlEnviaArquivo(this.token, doc)).then((res) => {

              console.log("Finalizando!");
              this.postSOAP(this.xmlProvider.getXmlFinalizar(this.token, doc.protocolo)).then((res) => {

                resolve(doc.modelo + ": Envio finalizado!");

              }, (err) => {
                reject(doc.modelo + "Falha finalizando: " + err);
              })
            }, (err) => {
              reject(doc.modelo + "Falha enviando arquivo: " + err);
            })
          }, (err) => {
            reject(doc.modelo + "Falha enviando parte: " + err);
          })
        }, (err) => {
          reject(doc.modelo + "Falha iniciando sincronismo: " + err);
        })
      }, (err) => {

        reject("Falha na autentição: " + err);
      });
    });
  }
}
