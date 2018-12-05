export class Dicionario {

    // public chave: string;
    // public valor: string;

    public itens = new Array<{ chave: any, valor: any }>();

    constructor(public id: string,
        public nome: string) { }        

}