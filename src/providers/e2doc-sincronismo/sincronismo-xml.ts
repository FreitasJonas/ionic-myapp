import { Injectable } from '@angular/core';
import { AppAccount } from '../../helpers/Account';


@Injectable()
export class SincronismoXmlProvider {

  public url = "https://www.e2doc.com.br/e2doc_webservice/sincronismo.asmx?wsdl";
  public urlApp = "https://www.e2doc.com.br/e2doc_webservice/App.asmx?wsdl";

  getXmlAutenticar( account : AppAccount) {

    let text = `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <AutenticarUsuario xmlns="http://www.e2doc.com.br/">
              <usuario>` + account.usuario + `</usuario>
              <senha>` + account.senha + `</senha>
              <key>?` + account.empresa.toUpperCase() + `?</key>
            </AutenticarUsuario>
          </soap12:Body>
        </soap12:Envelope>`;

    return { xmlText: text, tagResult: "AutenticarUsuarioResult", url: this.url }
  }

  getXmlSincIniciar(token: string, modeloPasta: string, campos: string, user: string, protocolo: string) {

    let text = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoIniciar xmlns="http://www.e2doc.com.br/">
          <id>` + token + `</id>
          <modelo>` + modeloPasta + `</modelo>
          <campos>` + campos + `</campos>
          <usuario>` + user + `</usuario>
          <protocolo>` + protocolo + `</protocolo>
        </SincronismoIniciar>
      </soap:Body>
    </soap:Envelope>`;

    return { xmlText: text, tagResult: "SincronismoIniciarResult", url: this.url }
  }

  getXmlEnviaParte(token: string, fileNamePart: string, fileBase64: string) {

    let text = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoEnviarParte xmlns="http://www.e2doc.com.br/">
          <id>`+ token + `</id>
          <fileNamePart>`+ fileNamePart + `</fileNamePart>
          <buffer><![CDATA[`+ fileBase64 + `]]></buffer>
        </SincronismoEnviarParte>
      </soap:Body>
    </soap:Envelope>`;

    return { xmlText: text, tagResult: "SincronismoEnviarParteResult", url: this.url }
  }

  getXmlEnviaArquivo(token: string, info: any) {

    let text = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SincronismoEnviarArquivo xmlns="http://www.e2doc.com.br/">
          <id>` + token + `</id>
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
          <modelo> ` + info.modeloPasta + ` </modelo>
          <protocolo>`+ info.protocolo + `</protocolo>
        </SincronismoEnviarArquivo>
      </soap12:Body>
    </soap12:Envelope>`;

    return { xmlText: text, tagResult: "SincronismoEnviarArquivoResult", url: this.url }
  }

  getXmlFinalizar(token: string, protocolo: string) {

    let text = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SincronismoFinalizar xmlns="http://www.e2doc.com.br/">
        <id>` + token + `</id>
          <protocolo>` + protocolo + `</protocolo>
        </SincronismoFinalizar>
      </soap12:Body>
    </soap12:Envelope>`;

    return { xmlText: text, tagResult: "SincronismoFinalizarResult", url: this.url }
  }

  getXmlUpload(token: string, protocolo: string, seq: string, extensao: string, hash: string, b64string: string) {

    let text = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <Upload xmlns="http://www.e2doc.com.br/">
          <token>` + token + `</token>
          <protocolo>` + protocolo + `</protocolo>
          <seq>` + seq + `</seq>
          <extensao>` + extensao + `</extensao>
          <hashArquivo>` + hash + `</hashArquivo>
          <buffer><![CDATA[`+ b64string + `]]></buffer>
        </Upload>
      </soap:Body>
    </soap:Envelope>`;

    return { xmlText: text, tagResult: "UploadResult", url: this.urlApp }
  }

  getXmlAutenticarApp( account : AppAccount ) {

    let text = `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <AutenticarUsuario xmlns="http://www.e2doc.com.br/">
              <usuario>` + account.usuario + `</usuario>
              <senha>` + account.senha + `</senha>
              <key>?` + account.empresa.toUpperCase() + `?</key>
            </AutenticarUsuario>
          </soap12:Body>
        </soap12:Envelope>`;

    return { xmlText: text, tagResult: "AutenticarUsuarioResult", url: this.urlApp }
  }

  getXmlResponse(token: string, protocolo: string): any {
    
    let text = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <Resp xmlns="http://www.e2doc.com.br/">
          <token>` + token + `</token>
          <protocolo>` + protocolo + `</protocolo>
        </Resp>
      </soap:Body>
    </soap:Envelope>`;

    return { xmlText: text, tagResult: "RespResult", url: this.urlApp }
  }

  getXmlConfiguracao(token: string, cmd: number, pr1: string, pr2: string, pr3: string, pr4: string): any {
    
    let text = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <Configuracao xmlns="http://www.e2doc.com.br/">
          <id>` + token + `</id>
          <cmd>` + cmd + `</cmd>
          <pr1>` + pr1 + `</pr1>
          <pr2>` + pr2 + `</pr2>
          <pr3>` + pr3 + `</pr3>
          <pr4>` + pr4 + `</pr4>
        </Configuracao>
      </soap:Body>
    </soap:Envelope>`;

    return { xmlText: text, tagResult: "ConfiguracaoResult", url: this.url }
  }
}
