import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { e2docHelper } from '../../helpers/e2doc/e2docHelper';

@Injectable()
export class E2docPesquisaProvider {

    private host = "https://www.e2doc.com.br/e2doc_webservice/pesquisa.asmx?wsdl";

    constructor(public http: HttpClient,
        public toastCtrl: ToastController,
        ) {
    }

    autenticar(xml) {

        var self = this;

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
            xmlhttp.open('POST', self.host, true);

            xmlhttp.setRequestHeader('Content-Type', 'text/xml');

            xmlhttp.send(xml.xmlText);

        });
    }

    consultar(xml) {

        let self = this;

        return new Promise((resolve, reject) => {

            const xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {

                        const xmlDocument = xmlhttp.responseXML;

                        let result = xmlDocument.getElementsByTagName(xml.tagResult)[0];

                        if (typeof (result.getElementsByTagName("erro")[0]) !== 'undefined') { //Se não encontrar nada

                            let msg = result.getElementsByTagName("erro")[0];

                            reject(msg);
                        }
                        else {

                            var res = result.getElementsByTagName("rs")[0].childNodes;

                            resolve(result);
                        }
                    }
                }
            }

            // Send the POST request.
            xmlhttp.open('POST', self.host, true);

            xmlhttp.setRequestHeader('Content-Type', 'text/xml');

            xmlhttp.send(xml.xmlText);

        });
    }

    verDoc(xml) {

        let self = this;

        return new Promise((resolve, reject) => {

            const xmlhttp = new XMLHttpRequest();

            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        const xmlDocument = xmlhttp.responseXML;

                        let result = xmlDocument.getElementsByTagName(xml.tagResult)[0].childNodes[0].nodeValue;

                        if (e2docHelper.isError(result)) {

                            reject(result);

                        }
                        else {

                            resolve(result);

                        }
                    }
                }
            }

            // Send the POST request.
            xmlhttp.open('POST', self.host, true);

            xmlhttp.setRequestHeader('Content-Type', 'text/xml');

            xmlhttp.send(xml.xmlText);

        });
    }
}


