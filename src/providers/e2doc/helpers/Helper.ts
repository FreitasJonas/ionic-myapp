import { Pasta } from "../../../helpers/classes/e2doc/Pasta";
import { Indices } from "../../../helpers/classes/e2doc/Indices";
import { Documento } from "../../../helpers/classes/e2doc/Documento";
import { IndiceModel } from "../../../helpers/interfaces/IndiceModel";

export class Helper {

    public static OK = -1;
    public static ERRO = -0;

    public static isError(str: string): boolean {

        var msg = str.indexOf("[ERRO]");

        if (msg == this.OK) {
            return true;
        }
        else {
            return false;
        }
    }

    static getConfigPasta(modeloPasta: string): Pasta {

        //carregar configuração do webservice
        let pasta = new Pasta(modeloPasta);

        //indices
        let indice1 = new Indices("Solicitante", "String", 100, true, "Jonas Freitas");
        let indice2 = new Indices("Responsavel", "String", 100, true, "Jonas Freitas");
        let indice3 = new Indices("Data", "String", 100, true, "21/11/2018");
        let indice4 = new Indices("Cargo", "String", 100, true, "Suporte Tecnico");
        let indice5 = new Indices("Salario", "String", 100, true, "3.000,00");
        let indice6 = new Indices("Justificativa", "String", 100, true, "Falta de pessoal");

        pasta.pastaIndices.push(indice1);
        pasta.pastaIndices.push(indice2);
        pasta.pastaIndices.push(indice3);
        pasta.pastaIndices.push(indice4);
        pasta.pastaIndices.push(indice5);
        pasta.pastaIndices.push(indice6);

        let docRG = new Documento("Formulario", true);
        docRG.docDesc = `Formulário de solicitação de abertura de processo seletivo`;

        let docCPF = new Documento("Assinatura", true);
        docCPF.docDesc = ``;

        //pasta.pastaDocumentos.push(doc1);
        pasta.pastaDocumentos.push(docRG);
        pasta.pastaDocumentos.push(docCPF);

        return pasta;

    }

    public static getStringIndices(indices: Array<IndiceModel>) : string {
        var strIndices = "";
    
        indices.forEach((indice, index) => {
    
          var strTemp = `<indice` + index + `> {1} </indice` + index + `> <valor` + index + `> {2} </valor` + index + `>`;
          
          strTemp = strTemp.replace("{1}", indice.nome);
          strTemp = strTemp.replace("{2}", indice.valor);
          strIndices += strTemp;
        });
    
        var campos = `<![CDATA[` + strIndices + `]]>`;
                    
        return campos;
    }
}