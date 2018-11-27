import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class HttpProvider {

  constructor(public http: HttpClient) {

  }

  getValidationTokenApp(url) {

    // this.http.get(url, {}).subscribe(data => {

    //   console.log(data);
    // });


    return "1";
  }
}
