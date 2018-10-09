// import { File } from '@ionic-native/file';

export class ImageHelper {

    // constructor(private file: File) {

    // }

    // public writeFile(base64Data: any, folderName: string, fileName: any) {

    //     let contentType = this.getContentType(base64Data);
    //     let DataBlob = this.base64toBlob(base64Data, contentType);

    //     // here iam mentioned this line this.file.externalRootDirectory is a native pre-defined file path storage. You can change a file path whatever pre-defined method.  
    //     let filePath = this.file.externalRootDirectory + folderName;
    //     this.file.writeFile(filePath, fileName, DataBlob, contentType).then((success) => {
    //       this.presentToast("File Writed Successfully " + success);
    //     }).catch((err) => {
    //       this.presentToast("Error Occured While Writing File" + err);
    //     })
    //   }

    //here is the method is used to get content type of an bas64 data  
    public getContentType(base64Data: any) {
        let block = base64Data.split(";");
        let contentType = block[0].split(":")[1];
        return contentType;
    }

    //here is the method is used to convert base64 data to blob data  
    public base64toBlob(b64Data, contentType) {
        contentType = contentType || '';
        let sliceSize = 512;
        let byteCharacters = atob(b64Data);
        let byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);
            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        let blob = new Blob(byteArrays, {
            type: contentType
        });
        return blob;
    }
}