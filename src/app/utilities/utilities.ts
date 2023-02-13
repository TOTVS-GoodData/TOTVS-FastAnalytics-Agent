import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SessionService } from '../service/session-service';


@Injectable({
  providedIn: 'root'
})
export class Utilities {
  constructor(
    private _sessionService: SessionService
  ) {}
  
  public getDefaultHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');
    headers = headers.append('Content-type', 'application/json');
    return headers;
  }
  
  public addGoodDataHeaders(headers: HttpHeaders): HttpHeaders {
    if (this._sessionService.TOKEN_SST != undefined) { headers = headers.append('X-GDC-AuthSST', this._sessionService.TOKEN_SST); }
    if (this._sessionService.TOKEN_TT != undefined) { headers = headers.append('X-GDC-AuthTT', this._sessionService.TOKEN_TT); }
    return headers;
  }
}