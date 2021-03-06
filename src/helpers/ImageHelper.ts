export class ImageHelper {
    
    public static getContentType(base64Data: any) {
        let block = base64Data.split(";");
        let contentType = block[0].split(":")[1];
        return contentType;
    }

    //here is the method is used to convert base64 data to blob data  
    public static base64toBlob(b64Data, contentType) {
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
        
        //blob
        let blob = new Blob(byteArrays, {
            type: contentType
        });

        return { blob: blob, binaryString: byteCharacters };
    }

    //here is the method is used to convert base64 data to blob data  
    public static base64toByteArray(b64Data, contentType) {
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
                
        return byteArray;
    }

    public static _base64ToArrayBuffer(base64) {
        var binary_string =  window.atob(base64);        
        var len = binary_string.length;
        var bytes = new Uint8Array( len );
        var strBytes = "";
        for (var i = 0; i < len; i++)        {
            bytes[i] = binary_string.charCodeAt(i);
            strBytes += bytes[i];
        }
        
        return strBytes;
        //return bytes.buffer;
    }
}