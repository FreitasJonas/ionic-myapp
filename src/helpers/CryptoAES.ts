import * as CryptoJS from 'crypto-js';

export class CryptoAES {

    static crypt(message, key, iv) {

        var keyBytes = new Uint8Array(key);
        var ivBytes = new Uint8Array(iv);

        let keyB64 = this.Uint8ToBase64(keyBytes);
        let ivB64 = this.Uint8ToBase64(ivBytes);

        key = CryptoJS.enc.Base64.parse(keyB64); 
        iv = CryptoJS.enc.Base64.parse(ivB64); 
        
        var cipherData = CryptoJS.AES.encrypt(message, key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

        let str = encodeURIComponent(cipherData.toString()); 
        
        return str;
    }

    static decrypt(message, key, iv) {

        var keyBytes = new Uint8Array(key);
        var ivBytes = new Uint8Array(iv);

        let keyB64 = this.Uint8ToBase64(keyBytes);
        let ivB64 = this.Uint8ToBase64(ivBytes);

        key = CryptoJS.enc.Base64.parse(keyB64); 
        iv = CryptoJS.enc.Base64.parse(ivB64); 
        
        var decrypted = CryptoJS.AES.decrypt(message.toString(), key,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            
        return decrypted.toString(CryptoJS.enc.Utf8);
    }

    static Uint8ToBase64(u8Arr) {
        var CHUNK_SIZE = 0x8000; //arbitrary number
        var index = 0;
        var length = u8Arr.length;
        var result = '';
        var slice;
        while (index < length) {
            slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length));
            result += String.fromCharCode.apply(null, slice);
            index += CHUNK_SIZE;
        }
        return btoa(result);
    }

}