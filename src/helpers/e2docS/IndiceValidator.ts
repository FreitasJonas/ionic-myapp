import { ModeloIndice } from "./ModeloIndice";

export class IndiceValidator {

    static validade(indice: ModeloIndice) {

        if (indice.obr == "1") {

            if (indice.valor == "" || indice.valor == null || indice.valor === 'undefinied') {

                indice.messageValidate = indice.nome + ": Campo obrigatório";
                indice.validate = false;

                // console.log(indice.nome + ": Não Validado");
            }
            else {
                // console.log(indice.nome + ": Validado");
                indice.validate = true;
            }
        }
        else {
            // console.log(indice.nome + ": Validado");
            indice.validate = true;
        }
    }

}