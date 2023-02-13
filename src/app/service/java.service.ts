import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Java } from '../utilities/interfaces';
import { ServerService } from './server.service';

@Injectable()
export class JavaService {
  private http: HttpClient;
  private apiUrl: string;

  constructor( http: HttpClient, private _serverJson: ServerService ) {
    this.http = http;
    this.apiUrl = `http://localhost:${this._serverJson.getServerPort()}/javaConfigurations`;
  }

  getJavaConfigurations() {
    return this.http.get( this.apiUrl );
  }

  getJavaConfiguration( id: string ): Observable<Java> {
    return this.http.get<Java>( `${this.apiUrl}/${id}` );
  }

  saveJavaConfiguration( java: Java ) {
    if ( java.id ) {
      return this.http.put( `${this.apiUrl}/${java.id}`, java );
    } else {
      return this.http.post( this.apiUrl, java );
    }
  }

  deleteJavaConfiguration( id: string ) {
    return this.http.delete( `${this.apiUrl}/${id}/` );
  }

  projectsByJava( idJava: string ) {
    const url = `http://localhost:${this._serverJson.getServerPort()}/projects?javaConfigurationId=${idJava}`;
    return this.http.get( url );
  }

}
