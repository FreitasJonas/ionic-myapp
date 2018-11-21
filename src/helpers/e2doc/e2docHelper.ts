import { Pasta } from "./Pasta";
import { Indices } from "./Indices";
import { Documento } from "./Documento";
import { IndiceModel } from "../IndiceModel";

export class e2docHelper {
  
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

    static getConfigPastaMAGNA(modeloPasta: string): Pasta {

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

    static getConfigPastaRH(): Pasta {


        //carregar configuração do webservice
        let pasta = new Pasta("CONTRATACAO");
        
        //indices
        let indice1 = new Indices("NOME", "String", 100, true, "");
        let indice2 = new Indices("RG", "String", 100, true, "");
        let indice3 = new Indices("CPF", "String", 100, true, "");
        let indice4 = new Indices("DATA NASCIMENTO", "String", 100, true, "");
        let indice5 = new Indices("CEP", "String", 100, true, "");
        let indice6 = new Indices("RUA", "String", 100, true, "");
        let indice7 = new Indices("CIDADE", "String", 100, true, "");
        let indice8 = new Indices("VALIDACAO", "String", 100, true, "");
    
        pasta.pastaIndices.push(indice1);
        pasta.pastaIndices.push(indice2);
        pasta.pastaIndices.push(indice3);
        pasta.pastaIndices.push(indice4);
        pasta.pastaIndices.push(indice5);
        pasta.pastaIndices.push(indice6);
        pasta.pastaIndices.push(indice7);
        pasta.pastaIndices.push(indice8);
    
        //documentos
        //let doc1 = new Documento("ASSINATURA", "", false);
    
        // let doc4 = new Documento("FICHA", true);
        // doc4.docDesc = `Tire uma foto da sua identidade onde constam os
        // seu dados, certifique-se de que os dados
        // apareçam bem na foto.`;
    
        let docRG = new Documento("RG", true);
        docRG.docDesc = `Tire uma foto da sua identidade onde constam os
        seu dados, certifique-se de que os dados
        apareçam bem na foto.`;
    
        let docCPF = new Documento("CPF", true);
        docCPF.docDesc = `Tire uma foto do seu CPF, caso já conste no seu RG, igonore esta etapa`;
    
        let docCOMP = new Documento("COMP RESIDENCIA", false);
        docCOMP.docDesc = `Tire uma foto do seu comprovante de residência,
        certifique-se de que os dados do endereço e do nome
        estejam aparecendo bem na foto.`;    
    
        let docFOTO = new Documento("FOTO E DOC", false);
        docFOTO.docDesc = `Tire uma foto sua segurando a sua identidade com a parte de trás virada para a câmera,
        certifique-se de estar bonito na foto!`;    
    
        //pasta.pastaDocumentos.push(doc1);
        pasta.pastaDocumentos.push(docRG);
        pasta.pastaDocumentos.push(docCPF);
        pasta.pastaDocumentos.push(docCOMP);    
        pasta.pastaDocumentos.push(docFOTO);    
    
        return pasta;
      }
}