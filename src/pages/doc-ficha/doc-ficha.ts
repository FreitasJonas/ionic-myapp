import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-doc-ficha',
  templateUrl: 'doc-ficha.html',
})
export class DocFichaPage {

  public teste = "teste3";

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     public storage: Storage) {    
  }

  ionViewDidLoad() {

    let key = this.navParams.get('key');   

    this.storage.get(key).then((res)=>{     
                  
      res.forEach(element => {

        if(element.tipo_doc = "RG"){
          console.log(element.imgInfo.nr_rg);        
        }
      });      
    });
  }

  assinarEnviar(){
    this.teste = "teste";
  }

}
