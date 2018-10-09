import { ToastController } from "ionic-angular";

export class MsgHelper{

    constructor(public toastCtrl: ToastController){
        
    }

    presentToast(msg: string) {
        const toast = this.toastCtrl.create({
          message: msg,
          duration: 3000
        });
        toast.present();
      }

}