import { Pasta } from "../classes/e2doc/Pasta";
import { IndiceModel } from "./IndiceModel";

export class IndiceModelConverter{
    public static converter(pasta: Pasta) : Array<IndiceModel> {
        
        let vetModel = new Array<IndiceModel>();

        pasta.pastaIndices.forEach((element) => {

            let model = new IndiceModel();
            model.nome = element.indiceNome;
            model.valor = element.getValue();

            vetModel.push(model);            
        });

        return vetModel;
    }
}