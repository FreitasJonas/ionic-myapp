export class Documento {

    public docFileName: string;
    public docFileBase64: string;
    public docFileHash: string;
    public docFileTam: number;
    public docFilePaginas: number;
    public docDesc: string;
    public docFileExtensao: string;
    
    constructor(
        public docNome: string,        
        public docObrigatorio: boolean,
        ) { }
}