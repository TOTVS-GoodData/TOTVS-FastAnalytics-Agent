import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { SessionService } from '../service/session-service';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

@Injectable({
  providedIn: 'root'
})
export class Utilities {
  constructor(
     private _sessionService: SessionService
    ,private _notificationService: PoNotificationService
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
  
  public createNotification(type: string, message: string): void {
    let notification: PoNotification = {
       message: message
      ,orientation: PoToasterOrientation.Top
    };
    
    if (type == 'ERR') {
      notification.message = 'Erro! - ' + notification.message;
      this._notificationService.error(notification);
    } else if (type == 'OK') {
      this._notificationService.success(notification);
    }
  }
}