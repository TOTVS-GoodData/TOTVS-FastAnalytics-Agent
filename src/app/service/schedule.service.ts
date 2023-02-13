import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Schedule } from '../utilities/interfaces';
import { ServerService } from './server.service';

@Injectable()
export class ScheduleService {

  private apiUrl: string;

  constructor( private _http: HttpClient, private _serverJson: ServerService ) {
    this.apiUrl = `http://localhost:${this._serverJson.getServerPort()}/schedules`;
  }

  getScheduleList() {
    return this._http.get<Schedule[]>( this.apiUrl );
  }

  getScheduleProjectList() {
    // expand só pode ser usado se o campo de referencia, exemplo:projecId for
    // de  preenchimento obrigatório na entidade filha, exemplo: schedule
    return this._http.get<any[]>( `${this.apiUrl}/?_expand=project` );
  }

  getSchedule( id: string ) {
    return this._http.get<Schedule>( `${this.apiUrl}/${id}` );
  }

  saveSchedule( schedule: Schedule ) {
    if ( schedule.id ) {
      return this._http.put( `${this.apiUrl}/${schedule.id}`, schedule );
    } else {
      return this._http.post( this.apiUrl, schedule );
    }
  }

  deleteSchedule( id: string ) {
      return this._http.delete( `${this.apiUrl}/${id}/` );
  }

  projectBySchedule( idSchedule: string ) {
    const url = `http://localhost:${this._serverJson.getServerPort()}/schedules/${idSchedule}?_expand=project`;
    return this._http.get<any>( url );
  }

}
