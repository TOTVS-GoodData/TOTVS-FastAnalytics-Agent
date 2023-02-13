import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Project, DataBase } from '../utilities/interfaces';
import { ServerService } from './server.service';

@Injectable()
export class DataBaseService {

  private apiUrl: string;

  constructor( private _http: HttpClient, private _serverJson: ServerService ) {
    this.apiUrl = `http://localhost:${this._serverJson.getServerPort()}/dataBases`;
  }

  getDataBaseList() {
    return this._http.get<DataBase[]>( this.apiUrl );
  }

  getDataBase( id: string ) {
    return this._http.get<DataBase>( `${this.apiUrl}/${id}` );
  }

  saveDataBase( dataBase: DataBase ) {
    if ( dataBase.id ) {
      return this._http.put( `${this.apiUrl}/${dataBase.id}`, dataBase );
    } else {
      return this._http.post( this.apiUrl, dataBase );
    }
  }

  deleteDataBase( id: string ) {
      return this._http.delete( `${this.apiUrl}/${id}/` );
  }

  projectsByDataBase( idDataBase: string ) {
    const url = `http://localhost:${this._serverJson.getServerPort()}/projects?dataBaseId=${idDataBase}`;
    return this._http.get<Project[]>( url );
  }

}
