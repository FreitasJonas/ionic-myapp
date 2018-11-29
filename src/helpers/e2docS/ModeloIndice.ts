import { Dicionario } from "./Dicionario";

export class ModeloIndice {

  public dic: Dicionario;

  constructor(public id_pasta: string,
    public id: string,
    public nome: string) {

  }
}