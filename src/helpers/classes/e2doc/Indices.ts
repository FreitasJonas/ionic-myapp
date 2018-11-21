export class Indices {

    public msgValidado: string;
    public isValid: boolean;
    private indiceValue: string;

    constructor(
        public indiceNome: string,
        public indiceTipo: string,
        public indiceTam: number,
        public indiceObrigatorio: boolean,
        value: string
    ) {
        this.setValue(value);
    }

    getValue() {
        return this.indiceValue;
    }

    setValue(value): boolean {
        this.validateValue(value);

        if (this.isValid) {
            this.indiceValue = value;
        }

        return this.isValid;
    }

    private validateValue(value: string) {

        //validar informação de acordo com o tipo e tamanho
        if (value.length <= this.indiceTam) {
            this.msgValidado = "";
            this.isValid = true;
        }
        else {
            this.msgValidado = "Limite de caracteres atingido!";
            this.isValid = false;
        }
    }
}