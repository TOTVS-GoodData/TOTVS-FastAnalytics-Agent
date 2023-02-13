import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electronyzer';

import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private port: string;

  constructor( private _electronService: ElectronService,
               private _thfNotification: PoNotificationService ) {
    this.setServerPort();
  }

  setServerPort() {
    if ( this._electronService.isElectronApp ) {
        this.port = this._electronService.ipcRenderer.sendSync( 'startServer' );
        if ( ( this.port === null ) || ( this.port === undefined ) || ( this.port === '' ) ) {
          const thfNotification: PoNotification = {
            message: 'Não foi possível iniciar o servidor da aplicação, por favor indicar uma porta disponível no menu Configurações!',
            orientation: PoToasterOrientation.Top };
          this._thfNotification.error( thfNotification );
        }
    } else {
        this.port = '3000';
    }
  }

  getServerPort() {
    return this.port;
  }

  saveServerPort( portServer: string ) {

    if ( this._electronService.isElectronApp ) {
      this.port = portServer;
      return this._electronService.ipcRenderer.sendSync( 'saveServerPort', portServer );
    } else {
      return false;
    }
  }

}
