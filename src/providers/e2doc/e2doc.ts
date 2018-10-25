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

  postSOAP(xmlText: string, tagResult: string): Promise<string> {

    return new Promise((resolve, reject) => {

      const xmlhttp = new XMLHttpRequest();
      
      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            const xml = xmlhttp.responseXML;
            let result = xml.getElementsByTagName(tagResult)[0].childNodes[0].nodeValue;

            if (result.indexOf("[ERRO]") <= 0) {

              resolve(result);

            }
            else {

              reject(result);

            }
          }
        }
      }

      // Send the POST request.
      xmlhttp.open('POST', this.url, true);

      xmlhttp.setRequestHeader('Content-Type', 'text/xml');

      xmlhttp.send(xmlText);

    });
  }

  enviarDocumentos(vetDoc: any, index: number, campos: string): Promise<string> {

    return new Promise((resolve, reject) => {

      console.log("Autenticando!");
      this.postSOAP(this.xmlProvider.getXmlAutenticar(this.user, this.pas, this.key), "AutenticarUsuarioResult").then((res) => {

        this.token = res;
        
        let doc = vetDoc[index];

        console.log(doc);
        
        console.log("Iniciando Sincronismo!");
        this.postSOAP(this.xmlProvider.getXmlSincIniciar(res, campos, this.user, doc.protocolo), "SincronismoIniciarResult").then((res) => {

          console.log("Enviando Parte!");
          this.postSOAP(this.xmlProvider.getXmlEnviaParte(this.token, doc.fileNamePart, doc.doc), "SincronismoEnviarParteResult").then((res) => {

            console.log("Enviando arquivo!");
            this.postSOAP(this.xmlProvider.getXmlEnviaArquivo(this.token, doc), "SincronismoEnviarArquivoResult").then((res) => {

              console.log("Finalizando!");
              this.postSOAP(this.xmlProvider.getXmlFinalizar(this.token, doc.protocolo), "SincronismoFinalizarResult").then((res) => {

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

      // ctx.autenticar(function (res) {

      //   var doc = vetDoc[4];

      //   console.log(doc);

      //   ctx.sincronismoIniciar(doc, campos, function (res) { //Sincronismo iniciar
      //     console.log("Sincronismo iniciar: " + res);
      //     ctx.sincronismoEnviaParte(doc, function (res) { //Enviar parte
      //       console.log("sincronismoEnviaParte: " + res);
      //       ctx.sincronismoEnviarArquivo(doc, function (res) { //Enviar arquivo
      //         console.log("sincronismoEnviarArquivo: " + res);
      //         ctx.sincronismoFinalizar(doc.protocolo, function (res) { //Finalizando
      //           console.log("sincronismoFinalizar: " + res)
      //           resolve("Envio finalizado");
      //         });
      //       });
      //     });
      //   });
      // });

      

      //   console.log("------------------INICIO SYNC--------------------");

      //   setTimeout(() => {


      //   ctx.autenticar(function (res) {        

      //     var doc = vetDoc[1];

      //     ctx.sincronismoIniciar(doc, campos, function (res) { //Sincronismo iniciar
      //       console.log("Sincronismo iniciar: " + res);
      //       ctx.sincronismoEnviaParte(doc, function (res) { //Enviar parte
      //         console.log("sincronismoEnviaParte: " + res);
      //         ctx.sincronismoEnviarArquivo(doc, function (res) { //Enviar arquivo
      //           console.log("sincronismoEnviarArquivo: " + res);
      //           ctx.sincronismoFinalizar(doc.protocolo, function (res) { //Finalizando
      //             console.log("sincronismoFinalizar: " + res)
      //             resolve("Envio finalizado");
      //           });
      //         });
      //       });
      //     });
      //   });      
      // }, 5000);

      // console.log("------------------FIM SYNC--------------------");

      // console.log("------------------INICIO SYNC--------------------");

      // setTimeout(() => {

      //   ctx.autenticar(function (res) {

      //     var doc = vetDoc[2];

      //     ctx.sincronismoIniciar(doc, campos, function (res) { //Sincronismo iniciar
      //       console.log("Sincronismo iniciar: " + res);
      //       ctx.sincronismoEnviaParte(doc, function (res) { //Enviar parte
      //         console.log("sincronismoEnviaParte: " + res);
      //         ctx.sincronismoEnviarArquivo(doc, function (res) { //Enviar arquivo
      //           console.log("sincronismoEnviarArquivo: " + res);
      //           ctx.sincronismoFinalizar(doc.protocolo, function (res) { //Finalizando
      //             console.log("sincronismoFinalizar: " + res)
      //             resolve("Envio finalizado");
      //           });
      //         });
      //       });
      //     });
      //   });
      // }, 5000);

      // console.log("------------------FIM SYNC--------------------");

      // ctx.autenticar(function (res) {

      //   if (res.indexOf("[ERRO]") <= 0) {
      //     vetDoc.forEach((element, index) => {            

      //       setTimeout(() => {

      //         ctx.sincronismoIniciar(element, campos, function (res) { //Sincronismo iniciar

      //           console.log("------------------INICIO SYNC " + element.modelo + "--------------------");

      //           if (res.indexOf("[ERRO]") <= 0) {
      //             console.log("[" + element.modelo + "] Sincronismo iniciar: " + res);                  
      //           }
      //           else {
      //             console.log("[" + element.modelo + "]" + " Sincronismo iniciar: OK");                  
      //           }                


      //           ctx.sincronismoEnviaParte(element, function (res) { //Enviar parte

      //             if (res.indexOf("[ERRO]") <= 0) {
      //               console.log("[" + element.modelo + "]" +" sincronismoEnviaParte: " + res);
      //             }
      //             else {
      //               console.log("[" + element.modelo + "]" +" sincronismoEnviaParte: OK");            
      //             }                  


      //             ctx.sincronismoEnviarArquivo(element, function (res) { //Enviar arquivo

      //               if (res.indexOf("[ERRO]") <= 0) {
      //                 console.log("[" + element.modelo + "]" + "sincronismoEnviarArquivo: " + res)
      //               }
      //               else {
      //                 console.log("[" + element.modelo + "]" +" sincronismoEnviarArquivo: OK");            
      //               }

      //               ctx.sincronismoFinalizar(element.protocolo, function (res) { //Finalizando                      

      //                 if (res.indexOf("[ERRO]") <= 0) {
      //                   console.log("[" + element.modelo + "]" +" sincronismoFinalizar: " + res)
      //                 }
      //                 else {
      //                   console.log("[" + element.modelo + "]" +" sincronismoFinalizar: " + element.modelo );            
      //                 }                     

      //                 console.log("------------------FIM SYNC " + element.modelo + "--------------------");

      //               });
      //             });
      //           });
      //         });              

      //         resolve(msg);
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
