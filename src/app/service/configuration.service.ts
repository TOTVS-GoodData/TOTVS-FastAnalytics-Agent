import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Configuration } from '../utilities/interfaces';
import { ServerService } from './server.service';

@Injectable()
export class ConfigurationService {

  private apiUrl: string;

  constructor( private _http: HttpClient, private _serverJson: ServerService ) {
    this.apiUrl = `http://localhost:${this._serverJson.getServerPort()}/configurations`;
  }

  getConfiguration() {
    return this._http.get<Configuration>( this.apiUrl );
  }

  saveConfiguration( configuration: Configuration ) {
    if ( configuration.id ) {
      return this._http.put( `${this.apiUrl}/${configuration.id}`, configuration );
    } else {
      return this._http.post( this.apiUrl, configuration );
    }
  }
}
