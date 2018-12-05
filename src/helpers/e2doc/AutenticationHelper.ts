import { CryptoAES } from "../CryptoAES";

export class AutenticationHelper {

  public static ivBytes = [97, 15, 21, 52, 12, 14, 47, 62, 25, 24, 13, 20, 63, 16, 13, 24];
  public static keyBytes = [54, 51, 49, 49, 54, 55, 53, 54, 49, 54, 55, 57, 102, 99, 98, 54, 102, 99, 57, 49, 54, 57, 49, 97, 97, 55, 97, 55, 99, 55, 101, 53];

  //Cria a string de verificação e de envio
  public static urlBrowser = "https://www.e2doc.com.br/login/loginapp?c=a";             //Cria url que será enviada ao nevegador
  public static urlValidateUser = "https://www.e2doc.com.br/login/checkapp?c=a";  //Cria que será verificada

  static isAutenticated(storageContent) {

    if (storageContent !== null) {

      let decryptStr = CryptoAES.decrypt(decodeURIComponent(storageContent), this.keyBytes, this.ivBytes);

      let vetDados = decryptStr.split("||");

      let data = vetDados[3].split("/");
      let hora = vetDados[4].split(":");

      var dateStorage = new Date(data[2], data[1] - 1, data[0], hora[0], hora[1], hora[2]);

      var now = new Date();

      var timeDiff = Math.abs(now.getTime() - dateStorage.getTime());
      var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      return diffDays <= 30;
    }
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