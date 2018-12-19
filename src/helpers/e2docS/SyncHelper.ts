import { ModeloPasta } from "./modeloPasta";
import { ModeloDoc } from "./ModeloDoc";
import { ModeloIndice } from "./ModeloIndice";
import { Hasher } from "../Hasher";
import date from 'date-and-time';

export class SyncHelper {

    static getVetDoc(pasta: ModeloPasta, documento: ModeloDoc, base64: string, ordem?: number) : Promise<any>{

        return new Promise((resolve) => {

            Hasher.getHash(base64, function (hasher) {

                let vetDoc = [];

                let strOrdem = ordem < 0 ? "_1" : "_" + ordem;
                let extensao = ".JPG";
    
                let protocolo = SyncHelper.getProtocolo();
                var fileName = protocolo + ordem + strOrdem + extensao; // "_1.JPG";
    
                vetDoc.push({
                    modeloPasta: pasta.nome,
                    modelo: documento.nome,                                     //modelo de documento
                    descricao: documento.nome,                                  //modelo de documento
                    path: "/e2app/" + fileName,                                 //caminho do arquivo, não possui por que não é salvo no disposiivo
                    fileString: hasher.base64,                                  //string binaria do arquivo         
                    length: hasher.size,                                        //tamanho em bytes do arquivo
                    paginas: 1,                                                 //arquivo sempre será de 1 pagina
                    hash: hasher.hash,                                          //hash gerado a partir da string binaria
                    extensao: extensao,                                            //sempre .jpg
                    id_doc: 1,                                                  //ordem do documento, indice do loop
                    protocolo: protocolo + strOrdem,                                //protocolo + ordem do documento
                    fileNamePart: fileName                          //nome da parte, será sempre apenas uma parte
                });
    
                resolve(vetDoc);
            })

        });        
    }

    static getProtocolo() {

        let dt = new Date();
        return date.format(dt, 'DDMMYYYY') + date.format(dt, 'HHmmss');
    }

    static getStringIndices(indices: Array<ModeloIndice>) : string {

        var strIndices = "";
    
        indices.forEach((indice, index) => {
    
          var strTemp = `<indice` + index + `> {1} </indice` + index + `>
                         <valor` + index + `> {2} </valor` + index + `>`;
          
          strTemp = strTemp.replace("{1}", indice.nome);
          strTemp = strTemp.replace("{2}", typeof(indice.valor) === 'undefined' ? "" : indice.valor);
          strIndices += strTemp;
        });
    
        var campos = `<![CDATA[` + strIndices + `]]>`;
                    
        return campos;
    }

    static removerAcentos( newStringComAcento ) {
        var string = newStringComAcento;
        var mapaAcentosHex 	= {
            a : /[\xE0-\xE6]/g,
            A : /[\xC0-\xC6]/g,
            e : /[\xE8-\xEB]/g,
            E : /[\xC8-\xCB]/g,
            i : /[\xEC-\xEF]/g,
            I : /[\xCC-\xCF]/g,
            o : /[\xF2-\xF6]/g,
            O : /[\xD2-\xD6]/g,
            u : /[\xF9-\xFC]/g,
            U : /[\xD9-\xDC]/g,
            c : /\xE7/g,
            C : /\xC7/g,
            n : /\xF1/g,
            N : /\xD1/g
        };
      
        for ( var letra in mapaAcentosHex ) {
          var expressaoRegular = mapaAcentosHex[letra];
          string = string.replace( expressaoRegular, letra );
        }
      
        return string;
    }

}