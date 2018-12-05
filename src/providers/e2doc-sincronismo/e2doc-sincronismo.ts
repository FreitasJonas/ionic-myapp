import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsgHelper } from '../../helpers/MsgHelper';
import { ToastController } from 'ionic-angular';
import { SincronismoXmlProvider } from './sincronismo-xml';
import { e2docHelper } from '../../helpers/e2doc/e2docHelper';

@Injectable()
export class E2docSincronismoProvider {

  private user = "jonas";
  private pas = "Hoje01%";
  private key = "XXMP";

  public token = "";
  public retorno = "";

  public msgHelper = new MsgHelper(this.toastCtrl);

  constructor(public http: HttpClient,
    public toastCtrl: ToastController,
    private xmlProvider: SincronismoXmlProvider) {
  }

  //texto xml
  //tag de resultado para obter valor
  postSOAP(xml: any): Promise<string> { 

    console.log(xml.xmlText);

    return new Promise((resolve, reject) => {

      const xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            const xmlDocument = xmlhttp.responseXML;
            let result = xmlDocument.getElementsByTagName(xml.tagResult)[0].childNodes[0].nodeValue;
            if (e2docHelper.isError(result)) {
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

  //texto xml
  //tag de resultado para obter valor
  postConfig(xml: any): Promise<any> {

    return new Promise((resolve, reject) => {

      const xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = () => {
        if (xmlhttp.readyState == 4) {
          if (xmlhttp.status == 200) {
            const xmlDocument = xmlhttp.responseXML;
            //let result = xmlDocument.getElementsByTagName(xml.tagResult);

            resolve(xmlDocument);
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

        console.log("Fazendo Upload!");
        this.postSOAP(this.xmlProvider.getXmlUpload(token, protocolo, tipo_doc, extensao, hash, b64string)).then((res) => {

          resolve(tipo_doc + ": Envio finalizado!");

        }, (err) => {
          reject(tipo_doc + " Falha no upload: " + err);
        })
      }, (err) => {
        reject("Falha na autentição: " + err);
      });
    });
  }

  getResponse(protocolo: string): Promise<any> {

    return new Promise((resolve, reject) => {

      console.log("Autenticando!");
      this.postSOAP(this.xmlProvider.getXmlAutenticarApp(this.user, this.pas, this.key)).then((token) => {

        console.log("Obtendo resposta");
        this.postSOAP(this.xmlProvider.getXmlResponse(token, protocolo)).then((res) => {

          resolve(res);

        }, (err) => {

          reject("Falha ao obter resposta: " + err);

        });

      }, (err) => {

        reject("Falha na autentição: " + err);

      });
    });
  }

  //vetor de documentos
  //indice do objeto a ser enviado
  //campos
  enviarDocumentos(vetDoc: any, index: number, campos: string): Promise<string> {

    return new Promise((resolve, reject) => {

      let doc = vetDoc[index];

      if (typeof (doc) === "undefined") {
        reject("Envio finalizado, mas nem todos os documentos foram inseridos!");
      }
      else {

        console.log("Autenticando!");
        this.postSOAP(this.xmlProvider.getXmlAutenticar(this.user, this.pas, this.key)).then((res) => {

          this.token = res;

          console.log("Iniciando Sincronismo!");
          this.postSOAP(this.xmlProvider.getXmlSincIniciar(res, doc.modeloPasta, campos, this.user, doc.protocolo)).then((res) => {

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
      }
    });
  }

  enviarDocumento(doc: any, campos: string): Promise<any> {

    return new Promise((resolve, reject) => {

      if (typeof (doc) === "undefined") {
        reject("Envio finalizado, mas nem todos os documentos foram inseridos!");
      }
      else {

        console.log("Autenticando!");
        this.postSOAP(this.xmlProvider.getXmlAutenticar(this.user, this.pas, this.key)).then((res) => {

          this.token = res;

          console.log("Iniciando Sincronismo! ");

          this.postSOAP(this.xmlProvider.getXmlSincIniciar(res, doc.modeloPasta, campos, this.user, doc.protocolo)).then((res) => {

            console.log("Enviando Parte!");
            this.postSOAP(this.xmlProvider.getXmlEnviaParte(this.token, doc.fileNamePart, doc.fileString)).then((res) => {

              console.log("Enviando arquivo!");
              this.postSOAP(this.xmlProvider.getXmlEnviaArquivo(this.token, doc)).then((res) => {

                console.log("Finalizando!");
                this.postSOAP(this.xmlProvider.getXmlFinalizar(this.token, doc.protocolo)).then((res) => {

                  resolve(doc.modelo + ": Envio finalizado!");

                }, (err) => {
                  reject(doc.modelo + ": Falha finalizando: " + err);
                })
              }, (err) => {
                reject(doc.modelo + ": Falha enviando arquivo: " + err);
              })
            }, (err) => {
              reject(doc.modelo + ": Falha enviando parte: " + err);
            })
          }, (err) => {
            reject(doc.modelo + ": Falha iniciando sincronismo: " + err);
          })
        }, (err) => {

          reject("Falha na autentição: " + err);
        });
      }
    });
  }

  getConfiguracao(cmd: number, pr1: string, pr2: string, pr3: string, pr4: string): Promise<any> {

    return new Promise((resolve, reject) => {

      this.postSOAP(this.xmlProvider.getXmlAutenticarApp(this.user, this.pas, this.key)).then((token) => {

        this.postConfig(this.xmlProvider.getXmlConfiguracao(token, cmd, pr1, pr2, pr3, pr4)).then((res) => {

          resolve(res);

        }, (err) => {

          reject("Falha ao obter resposta: " + err);

        });

      }, (err) => {

        reject("Falha na autentição: " + err);

      });
    });
  }
}
