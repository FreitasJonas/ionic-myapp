import { Documento } from "./Documento";
import { Indices } from "./Indices";

export class Pasta {

  constructor(
    public pastaNome: string,
    public pastaIndices: Array<Indices>,
    public pastaDocumentos: Array<Documento>) {
  }

  public stringfyIndices() {

    var strIndices = "";

    this.pastaIndices.forEach((indice, index) => {

      var strTemp = "<indice{0}>{1}</indice{0}><valor{0}>{2}</valor{0}>";
      strTemp = strTemp.replace("{0}", index.toString());
      strTemp = strTemp.replace("{1}", indice.indiceNome);
      strTemp = strTemp.replace("{2}", indice.value);
      strIndices += strTemp;
    });

    var campos = `<![CDATA[` + strIndices + `]]>`;

    return campos;
  }
}