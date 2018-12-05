import { Dicionario } from "./Dicionario";

export class ModeloIndice {
 
  public hasDic: boolean;
  public dic: Dicionario;
  public nameLabel: string;
  public valor: string;

  public id_pasta: string;
  public id: string;
  public nome: string;

  public pos: string;
  public def: string;
  public tam: string;
  public fixo: string;
  public obr: string;
  public unico: string;
  public calta: string;
  public cbaixa: string;
  public dupla: string;
  public tipo: string;
  public rgi: string;
  public rgf: string;
  public exp: string;
  public ordem: string;

  public messageValidate: string;
  public validate: boolean;
  
  constructor(options) {

    this.id_pasta = options.id_pasta;
    this.id = options.id;
    this.nome = options.nome;
    
    this.pos = options.pos;
    this.def = options.def;
    this.tam = options.tam;
    this.fixo = options.fixo;
    this.obr = options.obr;
    this.unico = options.unico;
    this.calta = options.calta;
    this.cbaixa = options.cbaixa;
    this.dupla = options.dupla;
    this.tipo = options.tipo;
    this.rgi = options.rgi;
    this.rgf = options.rgf;
    this.exp = options.exp;
    this.ordem = options.ordem;

    this.nameLabel = this.nome;

    if(this.obr == "1") {

      this.nameLabel += "*";

    }
  }
}