export class SlideModel {
    public modelo: string;
    public descricao: string;
    public obrigatorio : boolean;
    public enviado : boolean;   
    public status: Status = Status.Parado;     
}

export enum Status {
    Parado = 0,
    Aguandando = 1,
    Verificado = 2
}