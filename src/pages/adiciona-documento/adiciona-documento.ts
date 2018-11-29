import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { E2docSincronismoProvider } from '../../providers/e2doc-sincronismo/e2doc-sincronismo';
import { ModeloPasta } from '../../helpers/e2docS/modeloPasta';
import { ModeloDoc } from '../../helpers/e2docS/ModeloDoc';
import { ModeloIndice } from '../../helpers/e2docS/ModeloIndice';
import { Dicionario } from '../../helpers/e2docS/Dicionario';

@IonicPage()
@Component({
  selector: 'page-adiciona-documento',
  templateUrl: 'adiciona-documento.html',
})

export class AdicionaDocumentoPage {

  public pastas = new Array<ModeloPasta>();
  
  constructor(public navCtrl: NavController, public navParams: NavParams, private e2doc: E2docSincronismoProvider) {

    this.getConfigPasta();
    console.log(this.pastas);

  }

  private getConfigPasta() {

    console.log("INICIO 100");
    this.e2doc.getConfiguracao(100, "", "", "", "").then((pastas) => {

      let nodes = pastas.getElementsByTagName("modelos")[0].childNodes;

      for (var i = 0; i < nodes.length; i++) {

        let id = nodes[i].childNodes[0].firstChild.nodeValue;
        let nome = nodes[i].childNodes[1].firstChild.nodeValue;
        let cod = nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue;

        let pasta = new ModeloPasta();
        pasta.id = id;
        pasta.nome = nome;
        pasta.cod = cod;

        this.pastas.push(pasta);
      }
    });
  }

  getConfigDocumento(pasta) {

    this.e2doc.getConfiguracao(200, pasta.id, pasta.nome, "", "").then(docs => {

      let erro = docs.getElementsByTagName("erro")[0];

      if (typeof erro === 'undefined') { //Se não encontrar erro

        let nodes = docs.getElementsByTagName("docs")[0].childNodes;

        for (var i = 0; i < nodes.length; i++) {

          let id = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
          let nome = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;
          let cod = nodes[i].childNodes[2].firstChild === null ? "" : nodes[i].childNodes[2].firstChild.nodeValue;
          let obr = nodes[i].childNodes[3].firstChild === null ? "" : nodes[i].childNodes[3].firstChild.nodeValue;

          return new ModeloDoc(pasta.id, id, nome, cod, obr);
        }
      }
    });
  }

  getIndices(pasta) {

    let indices = new Array<ModeloIndice>();

    this.e2doc.getConfiguracao(300, pasta.id, pasta.nome, "", "").then(indices => {

      let erro = indices.getElementsByTagName("erro")[0];

      if (typeof erro === 'undefined') { //Se não encontrar erro

        let nodes = indices.getElementsByTagName("indices")[0].childNodes;

        for (var i = 0; i < nodes.length; i++) {

          let id = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
          let nome = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;

          let id_pasta = pasta.id;

          indices.push(new ModeloIndice(id_pasta, id, nome));
        }
      }
    });

    return indices;
  }


  getIndiceDicionarios(pasta) {

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
      }
    });
    return dicS;
  }

  getDicionarioItem(dic) {

    this.e2doc.getConfiguracao(500, dic.id, dic.nome, "", "").then(itens => {

      let erro = itens.getElementsByTagName("erro")[0];

      if (typeof erro === 'undefined') {

        let nodes = itens.getElementsByTagName("itens")[0].childNodes;

        for (var i = 0; i < nodes.length; i++) {

          let chave = nodes[i].childNodes[0].firstChild === null ? "" : nodes[i].childNodes[0].firstChild.nodeValue;
          let valor = nodes[i].childNodes[1].firstChild === null ? "" : nodes[i].childNodes[1].firstChild.nodeValue;

          dic.chave = chave;
          dic.valor = valor;

        }
      }
    });

    return dic;
  }
}






