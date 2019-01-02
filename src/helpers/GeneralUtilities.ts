import { CameraOptions, Camera } from "@ionic-native/camera";

export class GeneralUtilities {


    static getCameraOptions(camera: Camera) : CameraOptions {

        let cameraOptions : CameraOptions = {
            quality: 50,
            destinationType: camera.DestinationType.NATIVE_URI,
            encodingType: camera.EncodingType.JPEG,
            sourceType: camera.PictureSourceType.CAMERA,
            mediaType: camera.MediaType.PICTURE,
            targetHeight: 800,
            targetWidth: 800,
            allowEdit: false,
            saveToPhotoAlbum: true
          }

        return cameraOptions;
    }

    static getImagePickerOptions() : any {

        let options = {
            quality: 50,
            maximumImagesCount: 20,
            width: 800,
            height: 800,
            outputType: 0 //0 - path, 1 - Base64
          }

        return options;
    }

    static getKeyDocsStorage() : string {
        return "e2docAppDocs";
    }

    static separatePathFromFileName(path: string) : any {

        let fileName = path.substring(path.lastIndexOf("/") + 1, path.length);
        path = path.substring(0, path.lastIndexOf("/"));

        return { path: path, fileName: fileName }
    }
}