import { CryptoAES } from "../CryptoAES";
import { Storage } from '@ionic/storage';
import { HttpProvider } from "../../providers/http/http";
import date from 'date-and-time';


export class AutenticationHelper {

  public static ivBytes = [97, 15, 21, 52, 12, 14, 47, 62, 25, 24, 13, 20, 63, 16, 13, 24];
  public static keyBytes = [54, 51, 49, 49, 54, 55, 53, 54, 49, 54, 55, 57, 102, 99, 98, 54, 102, 99, 57, 49, 54, 57, 49, 97, 97, 55, 97, 55, 99, 55, 101, 53];

  //Cria a string de verificação e de envio
  public static urlBrowser = "https://www.e2doc.com.br/login/loginapp?c=a";             //Cria url que será enviada ao nevegador
  public static urlValidateUser = "https://www.e2doc.com.br/login/checkapp?c=a";        //Cria que será verificada

  static getDados(user: string, password: string, base: string, platform: string) : string {

    let dt = new Date();

    let data = date.format(dt, 'DD/MM/YYYY');
    let hora = date.format(dt, 'HH:mm:ss');

    return user + "||" + password + "||" + base + "||" + data + "||" + hora + "||" + platform + "||1.0.0.0||" + "";

  }

  static getDadosFromStorage(storage: Storage) : Promise<any> {

    return new Promise((resolve) => {

      storage.get(this.getKeyStorage()).then(storageContent => {

        if (storageContent !== null) {

          let strDados = CryptoAES.decrypt(decodeURIComponent(storageContent), this.keyBytes, this.ivBytes);

          resolve(strDados);
        }
      });
    });
  }

  static isValidUser(http: HttpProvider, strData: string) : string {

    return http.getValidationApp(AutenticationHelper.urlValidateUser + strData);

  }

  static isAutenticated(http: HttpProvider, storage: Storage): Promise<boolean> {

    return new Promise((resolve) => {

      storage.get(this.getKeyStorage()).then(dadosCodificados => {

        if (dadosCodificados !== null) {

          let vetDados = CryptoAES.decrypt(decodeURIComponent(dadosCodificados), this.keyBytes, this.ivBytes).split("||");

          let data = vetDados[3].split("/");          
          var dateStorage = new Date(data[2], data[1] - 1, data[0]);
          
          let agora = new Date();
          
          let diff = date.subtract(agora, dateStorage).toDays();   

          //se estiver dentro do prazo de 30 dias
          if (diff <= 30) {

            let e2docRetorno = this.validateData(http, dadosCodificados);

            //se estiver ok
            if(e2docRetorno == "1") {
              resolve(true);
            }
            else {
              resolve(false);
            }
          }
          else {
            resolve(false);
          }
        }
        else{
          resolve(false);
        }
      });
    });
  }

  static validateData( http: HttpProvider, dadosEncod : string ) : string {

    return http.getValidationApp(AutenticationHelper.urlValidateUser + dadosEncod);

  }

  static saveToStorage(storage: Storage, dadosEncod: string): any {

    storage.set(AutenticationHelper.getKeyStorage(), dadosEncod);

  }

  static getUserName(storageContent) {

    if (storageContent !== null) {

      let decryptStr = CryptoAES.decrypt(decodeURIComponent(storageContent), this.keyBytes, this.ivBytes);

      let vetDados = decryptStr.split("||");

      return vetDados[0];
    }
  }

  static getKeyStorage() {
    return "AutSorage";
  }

  static getMessageError(e2docResponse) {

    let msgErro = "";

    if (e2docResponse == "0") {
      msgErro = "Não foi possível realizar a autenticação no sistema, verifique as informações!";
    }
    else if (e2docResponse == "-1") {
      msgErro = "Falha ao realizar o acesso, tente novamente mais tarde ou entre em contato conosco através do Suporte Técnico";
    }
    else if (e2docResponse == "-2") {
      msgErro = "Não foi possível realizar o login, atualize o Aplicativo e tente novamente";
    }
    else if (e2docResponse == "-3") {
      msgErro = "Verifique suas configurações de Data e Hora";
    }
    else if (e2docResponse == "-4") {
      msgErro = "Não foi possível conectar";
    }
    else {
      msgErro = "Erro desconhecido";
    }

    return msgErro;

  }
}