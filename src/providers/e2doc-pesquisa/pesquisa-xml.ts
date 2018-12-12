import { AppAccount } from "../../helpers/Account";

export class PesquisaXmlProvider {

    public static getXmlAutenticar(account : AppAccount) {

        let text = `<?xml version="1.0" encoding="utf-8"?>
          <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
              <AutenticarUsuario xmlns="http://www.e2doc.com.br/">
                <usuario>` + account.usuario + `</usuario>
                <senha>` + account.senha + `</senha>
                <chave>?` + account.empresa.toUpperCase() + `?</chave>
              </AutenticarUsuario>
            </soap:Body>
          </soap:Envelope>`;

        return { xmlText: text, tagResult: "AutenticarUsuarioResult" }
    }

    public static getXmlConsultar(token, modelo, campos) {

        let text = `<?xml version="1.0" encoding="utf-8"?>
          <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
              <Consultar xmlns="http://www.e2doc.com.br/">
                <key>` + token + `</key>
                <modelo>` + modelo + `</modelo>
                <campos>` + campos + `</campos>
              </Consultar>
            </soap:Body>
          </soap:Envelope>`;

        return { xmlText: text, tagResult: "ConsultarResult" }

    }

    public static getXmlVerDoc(token, id) {

        let text = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <VerDoc xmlns="http://www.e2doc.com.br/">
            <key>` + token + `</key>
              <id>` + id + `</id>
              <texto></texto>
            </VerDoc>
          </soap:Body>
        </soap:Envelope>`;

        return { xmlText: text, tagResult: "lk" }

    }

    public static stringfyIndices(campos) {

        var strIndices = "";

        for (var i = 0; i < campos.length; i++) {

            strIndices += `<indice` + i + `>` + campos[i].iName + `</indice` + i + `> 
                           <valor` + i + `>` + campos[i].iValue + `</valor` + i + `>`;
        }

        strIndices = `<![CDATA[` + strIndices + `]]>`;

        return campos;
    }

}