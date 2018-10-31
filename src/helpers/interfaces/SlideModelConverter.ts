import { Pasta } from "../classes/e2doc/Pasta";
import { SlideModel } from "./slideModel";

export class SlideModelConverter{
    public static converter(pasta: Pasta) : Array<SlideModel> {
        
        let vetModel = new Array<SlideModel>();

        pasta.pastaDocumentos.forEach((element) => {

            let model = new SlideModel();
            model.modelo = element.docNome;
            model.descricao = element.docDesc;
            model.obrigatorio = element.docObrigatorio;

            vetModel.push(model);            
        });

        return vetModel;
    }
}