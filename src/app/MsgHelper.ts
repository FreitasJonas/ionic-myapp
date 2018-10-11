import { ToastController } from "ionic-angular";

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
      duration: 8000,
      position: "top"
    });
    toast.present();
  }

}