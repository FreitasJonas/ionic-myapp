import { ModeloIndice } from "./ModeloIndice";

export class IndiceValidator {

    static indiceTypes = { numerico: "0", alfa_numerico: "1", alfa: "2", data: "3" }

    static validate(indice: ModeloIndice) {
        if(this.vObg(indice)) {
            if(this.vType(indice)) {
                if(this.vRegex(indice)) {
                    return;
                }            
            }
        }
    }

    static vObg(indice: ModeloIndice) : boolean {

        if (indice.obr == "1") {

            if (indice.valor == "" || indice.valor == null || indice.valor === 'undefinied') {

                indice.messageValidate = indice.nome + ": Campo obrigatório";
                indice.validate = false;
                return false;
            }
            else {  
                indice.validate = true;
                return true;
            }
        }
        else {
            indice.validate = true;
            return true;
        }
    }

    static vType(indice: ModeloIndice) : boolean {

        switch (indice.tipo) {

            case this.indiceTypes.numerico:
                return this.isNumerico(indice.valor);

            case this.indiceTypes.alfa_numerico:
                return this.isAlfaNumerico(indice.valor);

            case this.indiceTypes.alfa:
                return this.isAlfa(indice.valor);

            case this.indiceTypes.data:
                return true; //Campos tipo data numca terão formatação errada, isto por que já é definido o formato na view

            default: return false
        }        
    }

    static vRegex(indice: ModeloIndice) : boolean {

        //se não houver expressão regular
        if (indice.exp == "" || indice.exp == null || indice.exp === 'undefinied') {
            return true;
        }
        else {
            let regex = new RegExp(indice.exp);
            return regex.test(indice.valor);
        }
    }

    static isNumerico(value: any) : boolean {

        let r = Number(value);
        return !isNaN(r);
    }

    static isAlfaNumerico(value: any) : boolean {

        var code, i, len;

        for (i = 0, len = value.length; i < len; i++) {
          code = value.charCodeAt(i);
          if (!(code > 47 && code < 58) &&  // numeric (0-9)
              !(code > 64 && code < 91) &&  // upper alpha (A-Z)
              !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
          }
        }
        
        return true;
    }

    static isAlfa(value: any) : boolean {

        var code, i, len;

        for (i = 0, len = value.length; i < len; i++) {
          code = value.charCodeAt(i);
          if (!(code > 64 && code < 91) &&  // upper alpha (A-Z)
              !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
          }
        }
        
        return true;
    }
}