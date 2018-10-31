export class Indices {

    constructor(
        public indiceNome: string,
        public indiceTipo: string,
        public indiceTam: number,
        public indiceObrigatorio: boolean,
        private indiceValue: string
    ){ }

    get value() {
        return this.indiceValue;
    }

    set value(value) {
        if(this.validateValue(value)){
            this.indiceValue = value;
        }
        else{
            alert("Valor não validado!");
        }
    }

    private validateValue(value) {

        //validar informação de acordo com o tipo e tamanho
        if (value.lengh <= this.indiceTam) {
            return true;
        }
        else {
            return false;
        }
    }
}