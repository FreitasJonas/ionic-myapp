export class Indices {

    constructor(
        public indiceNome: string,
        public indiceTipo: string,
        public indiceTam: number,
        public indiceObrigatorio: boolean,
        private indiceValue: string
    ){ }

    getValue() {
        return this.indiceValue;
    }

    setValue(value) : boolean {
        if(this.validateValue(value)){
            this.indiceValue = value;
            return true;
        }
        else{
            return false;
        }
    }

    private validateValue(value: string) {

        //validar informação de acordo com o tipo e tamanho
        if (value.length <= this.indiceTam) {
            return true;            
        }
        else {
            return false;            
        }
    }
}