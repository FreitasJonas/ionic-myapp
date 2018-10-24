import { Injectable } from '@angular/core';

@Injectable()
export class XmlTextProvider {

  constructor() {

  }

  getXmlAutenticar(user: string, password: string, key: string) {

    return `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <AutenticarUsuario xmlns="http://www.e2doc.com.br/">
              <usuario>` + user + `</usuario>
              <senha>` + password + `</senha>
              <key>` + key + `</key>
            </AutenticarUsuario>
          </soap12:Body>
        </soap12:Envelope>`;
  }

  getXmlSincIniciar(token: string, campos: string, user: string, protocolo: string) {

    return `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoIniciar xmlns="http://www.e2doc.com.br/">
          <id>` + token + `</id>
          <modelo>CONTRATACAO</modelo>
          <campos>` + campos + `</campos>
          <usuario>` + user + `</usuario>
          <protocolo>` + protocolo + `</protocolo>
        </SincronismoIniciar>
      </soap:Body>
    </soap:Envelope>`;
  }

  getXmlEnviaParte(token: string, fileNamePart: string, fileBase64: string) {

    return `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <SincronismoEnviarParte xmlns="http://www.e2doc.com.br/">
          <id>`+ token + `</id>
          <fileNamePart>`+ fileNamePart + `</fileNamePart>
          <buffer><![CDATA[`+ fileBase64 + `]]></buffer>
        </SincronismoEnviarParte>
      </soap:Body>
    </soap:Envelope>`;
  }

  getXmlEnviaArquivo(token: string, info: any) {

    return `<?xml version="1.0" encoding="utf-8"?>
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
          <modelo> CONTRATACAO </modelo>
          <protocolo>`+ info.protocolo + `</protocolo>
        </SincronismoEnviarArquivo>
      </soap12:Body>
    </soap12:Envelope>`;
  }

  getXmlFinalizar(token: string, protocolo: string) {

    return `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SincronismoFinalizar xmlns="http://www.e2doc.com.br/">
        <id>` + token + `</id>
          <protocolo>` + protocolo + `</protocolo>
        </SincronismoFinalizar>
      </soap12:Body>
    </soap12:Envelope>`;
  }
}
