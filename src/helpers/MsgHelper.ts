import { ToastController, AlertController, LoadingController, LoadingOptions, Loading } from "ionic-angular";

export class MsgHelper {

  static presentToast(toastCtrl: ToastController, msg: string, duration?: number) {

    if(duration == undefined) { duration = 2000 }

    const toast = toastCtrl.create({
      message: msg,
      duration: duration,
      position: "top"
    });
    toast.present();
  }

  static presentAlert(alertCtrl: AlertController, mensagem: string, fnAcept, fnDecline, title?: string, btnAceptText?: string, btnDeclineText?:string) {

    title = title == undefined ? "" : title;
    btnAceptText = btnAceptText == undefined ? "Sim" : btnAceptText;
    btnDeclineText = btnDeclineText == undefined ? "Não" : btnDeclineText;

    //exibe alert
    alertCtrl.create({
      title: title,
      message: mensagem,
      buttons: [
        {
          text: btnDeclineText,
          handler: () => {
            //retorna para intro
            if(typeof(fnAcept) === 'function') {
              fnDecline();
            }
          },
          cssClass: 'alertInput'
        },
        {
          text: btnAceptText,
          handler: () => {
            //retorna para intro

            if(typeof(fnAcept) === 'function') {
              fnAcept();
            }
          },
          cssClass: 'alertInput'
        }
      ]
    }).present();   
  }

  static presentLoading(loadCtrl: LoadingController, message: string) : Loading {

    let options = {
      spinner: "dots",
      content: message,
      dismissOnPageChange: true
    }

    return loadCtrl.create(options);

  }
}