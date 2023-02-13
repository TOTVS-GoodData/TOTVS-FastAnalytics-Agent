import { Component, OnInit } from '@angular/core';

import { ElectronService } from 'ngx-electronyzer';
import { PoSwitchLabelPosition } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';
import { PoNotificationService } from '@po-ui/ng-components';

import { Configuration } from '../utilities/interfaces';
import { ConfigurationService } from '../service/configuration.service';
import { ServerService } from '../service/server.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  public version = '1.0.0';

  public configuration: Configuration = new Configuration();
  public serverPort: string;
  public showQueriesPosition: PoSwitchLabelPosition = PoSwitchLabelPosition.Left;


  constructor( private _configutarionService: ConfigurationService,
               private _serverJson: ServerService,
               private thfNotification: PoNotificationService,
               private _electronService: ElectronService ) {
  }

  ngOnInit() {
    this._configutarionService.getConfiguration()
          .subscribe( ( data ) => {
            this.setConfiguration( data[0] );
          }, () => this.setConfiguration( undefined ) );
  }

  public saveConfiguration( event: any ) {

    event.preventDefault( );

    if ( this._electronService.isElectronApp ) {
      this._electronService.ipcRenderer.sendSync( 'uninstallAgent' );
    }

    if ( ( this._serverJson.getServerPort() === null ) || ( this._serverJson.getServerPort() === '' ) ||
         ( this._serverJson.getServerPort() === undefined ) ) {
      if ( this.validConfiguration() ) {
        this.savePort();
      }
    } else {
      if ( this.validConfiguration() ) {
        this._configutarionService
            .saveConfiguration( this.configuration )
            .subscribe( () => {
              this.savePort();
            }, error => {
              console.log( error );
            } );
      }
    }

  }

  private validConfiguration() {
    let valid = true;

    if ( ( this.configuration.intervalExecutionServer === null ) || ( this.serverPort === null ) ||
         ( this.configuration.intervalExecutionServer === undefined ) || ( this.serverPort === '' ) ) {
      valid = false;
      const thfNotification: PoNotification = {
        message: 'Preencher todos os campos de configuração!',
        orientation: PoToasterOrientation.Top };
      this.thfNotification.error( thfNotification );
    }

    return valid;
  }

  private savePort() {
    if ( this._serverJson.saveServerPort( this.serverPort ) ) {
      const thfNotification: PoNotification = {
        message: 'Configuração gravada com sucesso! Reiniciar a aplicação e o serviço de Agendamento para aplicar as alterações!!!',
        orientation: PoToasterOrientation.Top };
      this.thfNotification.warning( thfNotification );
    } else {
      const thfNotification: PoNotification = {
        message: 'Houve um erro ao alterar a porta do Servidor!',
        orientation: PoToasterOrientation.Top };
      this.thfNotification.error( thfNotification );
    }

  }

  private setConfiguration( config: Configuration ) {
    if ( config === undefined ) {
      this.configuration.intervalExecutionServer = 1;
      this.configuration.showQuery = false;
    } else {
      this.configuration = config;
    }
    this.serverPort = this._serverJson.getServerPort();
  }

}
