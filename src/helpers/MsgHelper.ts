import { ToastController, AlertController } from "ionic-angular";

export class MsgHelper {

  constructor(public toastCtrl: ToastController) {

  }

  presentToast(msg: string) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: "top"
    });
    toast.present();
  }

  presentToast2(msg: string) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 5000
    });
    toast.present();
  }

  static presentAlert( alertCtrl: AlertController, mensagem: string, fnAcept, fnDecline, title?: string) {

    //exibe alert
    alertCtrl.create({
      title: title,
      message: mensagem,
      buttons: [
        {
          text: 'Sim',
          handler: () => {
            //retorna para intro

            if(typeof(fnAcept) === 'function') {
              fnAcept();
            }
          }
        },
        
        {
          text: 'Não',
          handler: () => {
            //retorna para intro
            if(typeof(fnAcept) === 'function') {
              fnDecline();
            }
          }
        }
      ]
    }).present();   

  }

}