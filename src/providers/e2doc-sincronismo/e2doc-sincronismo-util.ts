import { Dicionario } from "../../helpers/e2docS/Dicionario";
import { ModeloIndice } from "../../helpers/e2docS/ModeloIndice";
import { ModeloDoc } from "../../helpers/e2docS/ModeloDoc";
import { ModeloPasta } from "../../helpers/e2docS/modeloPasta";
import { E2docSincronismoProvider } from "./e2doc-sincronismo";

export class SincronismoUtil {

    constructor( private e2doc: E2docSincronismoProvider ) {}

      getConfigPasta(): Promise<Array<ModeloPasta>> {

        let _pastas = new Array<ModeloPasta>();
    
        return new Promise((resolve, reject) => {
    
          this.e2doc.getConfiguracao(100, "", "", "", "").then((pastas) => {
    
            let erro = pastas.getElementsByTagName("erro")[0];
    
            if (typeof erro === 'undefined') {
    
              let nodes = pastas.getElementsByTagName("modelos")[0].childNodes;
    
              for (var i = 0; i < nodes.length; i++) {
    
                let id = nodes[i].childNodes[0].firstChild.nodeValue;
                let nome = nodes[i].childNodes[1].firstChild.nodeValue;
                let cod = nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue;
    
                let pasta = new ModeloPasta();
                pasta.id = id;
                pasta.nome = nome;
                pasta.cod = cod;
    
                _pastas.push(pasta);
              }
    
              resolve(_pastas);
            }
            else {
              reject("[ERRO] Falha lendo Xml");
            }
          }, err => {
    
            reject(err);
    
          });
    
        });
      }
    
      getConfigDocumento(pasta): Promise<Array<ModeloDoc>> {
    
        return new Promise((resolve, reject) => {
    
          let lstDocs = new Array<ModeloDoc>();
    
          this.e2doc.getConfiguracao(200, pasta.id, pasta.nome, "", "").then(docs => {
    
            let erro = docs.getElementsByTagName("erro")[0];
    
            if (typeof erro === 'undefined') { //Se não encontrar erro
    
              let nodes = docs.getElementsByTagName("docs")[0].childNodes;
    
              for (var i = 0; i < nodes.length; i++) {
    
                let id = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
                let nome = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;
                let cod = nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue;
                let obr = nodes[i].childNodes[3].firstChild === null ? "" : nodes[i].childNodes[3].firstChild.nodeValue;
    
                lstDocs.push(new ModeloDoc(pasta.id, id, nome, cod, obr));
              }
    
              resolve(lstDocs);
            }
          }, erro => {
            reject("[ERRO] " + erro);
          });
    
        });
      }
    
      getIndices(pasta): Promise<Array<ModeloIndice>> {
    
        let self = this;
    
        return new Promise((resolve, reject) => {
    
          let _indices = new Array<ModeloIndice>();
    
          this.e2doc.getConfiguracao(300, pasta.id, pasta.nome, "", "").then(indices => {
    
            let erro = indices.getElementsByTagName("erro")[0];
    
            if (typeof erro === 'undefined') { //Se não encontrar erro
    
              let nodes = indices.getElementsByTagName("indices")[0].childNodes;
    
              for (var i = 0; i < nodes.length; i++) {
    
                let options = {
    
                  id_pasta: pasta.id,
    
                  id: nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue,
                  nome: nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue,
    
                  pos: nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue,
                  def: nodes[i].childNodes[3].firstChild === null ? "" : nodes[i].childNodes[3].firstChild.nodeValue,
                  tam: nodes[i].childNodes[4].firstChild === null ? "" : nodes[i].childNodes[4].firstChild.nodeValue,
                  fixo: nodes[i].childNodes[5].firstChild === null ? "" : nodes[i].childNodes[5].firstChild.nodeValue,
                  obr: nodes[i].childNodes[6].firstChild === null ? "" : nodes[i].childNodes[6].firstChild.nodeValue,
                  unico: nodes[i].childNodes[7].firstChild === null ? "" : nodes[i].childNodes[7].firstChild.nodeValue,
                  calta: nodes[i].childNodes[8].firstChild === null ? "" : nodes[i].childNodes[8].firstChild.nodeValue,
                  cbaixa: nodes[i].childNodes[9].firstChild === null ? "" : nodes[i].childNodes[9].firstChild.nodeValue,
                  dupla: nodes[i].childNodes[10].firstChild === null ? "" : nodes[i].childNodes[10].firstChild.nodeValue,
                  tipo: nodes[i].childNodes[11].firstChild === null ? "" : nodes[i].childNodes[11].firstChild.nodeValue,
    
                  rgi: nodes[i].childNodes[12].firstChild === null ? "" : nodes[i].childNodes[12].firstChild.nodeValue,
                  rgf: nodes[i].childNodes[13].firstChild === null ? "" : nodes[i].childNodes[13].firstChild.nodeValue,
                  exp: nodes[i].childNodes[14].firstChild === null ? "" : nodes[i].childNodes[14].firstChild.nodeValue,
    
                  dicId: nodes[i].childNodes[15].firstChild === null ? "" : nodes[i].childNodes[15].firstChild.nodeValue,
    
                  ordem: nodes[i].childNodes[16].firstChild === null ? "" : nodes[i].childNodes[16].firstChild.nodeValue
                }
    
                let indice = new ModeloIndice(options);
    
                //se houver dicionário
                if (options.dicId !== "0") {
    
                  self.getIndiceDicionarios(pasta).then(dic => {
    
                    let _dic = dic.find(d => d.id == options.dicId);
    
                    indice.hasDic = true;
                    indice.dic = _dic;
    
                    this.getDicionarioItem(_dic).then(itens => {
    
                      indice.dic.itens = itens;
    
                    }, err => {
                      reject(err);
                    });
                  });
                }
    
                _indices.push(indice);
              }
    
              resolve(_indices);
            }
            else {
    
              reject("[ERRO] Falha lendo Xml");
    
            }
          }, err => {
    
            reject(err);
    
          });
    
        });
      }
    
      getIndiceDicionarios(pasta): Promise<Array<Dicionario>> {
    
        return new Promise((resolve, reject) => {
    
          let dicS = new Array<Dicionario>();
    
          this.e2doc.getConfiguracao(400, pasta.id, pasta.nome, "", "").then(dicionarios => {
    
            let erro = dicionarios.getElementsByTagName("erro")[0];
    
            if (typeof erro === 'undefined') { //Se não encontrar erro
    
              let nodes = dicionarios.getElementsByTagName("dics")[0].childNodes;
    
              for (var i = 0; i < nodes.length; i++) {
    
                let idDic = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
                let nomeDic = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;
    
                dicS.push(new Dicionario(idDic, nomeDic));
              }
              resolve(dicS);
            }
            else {
              reject("[ERRO] (getIndiceDicionarios) Falha lendo Xml");
            }
          }, err => {
    
            reject(err);
    
          });
        });
      }
    
      getDicionarioItem(dic: Dicionario): Promise<Array<{ chave: any, valor: any }>> {
    
        let _itens = new Array<{ chave: any, valor: any }>();
    
        return new Promise((resolve, reject) => {
    
          this.e2doc.getConfiguracao(500, dic.id, dic.nome, "", "").then(itens => {
    
            let erro = itens.getElementsByTagName("erro")[0];
    
            if (typeof erro === 'undefined') {
    
              let nodes = itens.getElementsByTagName("itens")[0].childNodes;
    
              for (var i = 0; i < nodes.length; i++) {
    
                let chave = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
                let valor = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;
    
                _itens.push({ chave, valor });
              }
    
              resolve(_itens);
    
            } else {
              reject("[ERRO] (getDicionarioItem) Falha lendo Xml");
            }
          }, err => {
    
            reject(err);
    
          });
        });
      }
}