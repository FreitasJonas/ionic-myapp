import { Documento } from "./Documento";
import { Indices } from "./Indices";

export class Pasta {

  public pastaIndices: Array<Indices> = new Array<Indices>();
  public pastaDocumentos: Array<Documento> = new Array<Documento>();
  public protocolo: string;

  constructor(public pastaNome: string) {
  }

  public setValueIndice(nome: string, value: string): Boolean {

    let index = this.pastaIndices.findIndex(i => i.indiceNome == nome);

    let indice = this.pastaIndices[index];

    let validate = indice.setValue(value);    

    if (validate) {
      //substitui no vetor
      this.pastaIndices.splice(index, 1, indice);
      return true;
    }
    else {
      return false;
    }
  } 
}