import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MsgHelper } from '../../helpers/classes/MsgHelper';
import { ToastController } from 'ionic-angular';
import { XmlTextProvider } from '../xml-text/xml-text';
import { Pasta } from '../../helpers/classes/e2doc/Pasta';
import { Indices } from '../../helpers/classes/e2doc/Indices';
import { Documento } from '../../helpers/classes/e2doc/Documento';
import { Helper } from '../../providers/e2doc/helpers/helper';

@Injectable()
export class E2docPesquiaProvider {

    private user = "jonas";
    private pas = "Hoje01%";
    private key = "XXMP";

    public token = "";
    public retorno = "";
    public host = "https://www.e2doc.com.br/e2doc_webservice/pesquisa.asmx?wsdl";

    constructor(public http: HttpClient,
        public toastCtrl: ToastController,
        private xmlProvider: XmlTextProvider) {
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

                        if (Helper.isError(result)) {
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

                        if (Helper.isError(result)) {

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