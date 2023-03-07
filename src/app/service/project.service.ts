import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { merge, flatMap, map, switchMap, mergeMap } from 'rxjs/operators';

import { DatabaseData, Project, DataBase , Java} from '../utilities/interfaces';
import { ServerService } from './server.service';

import { environment } from '../../environments/environment';

@Injectable()
export class ProjectService {
  private http: HttpClient;
  private apiUrl: string;
  private url: string;
  private data: DatabaseData = null;
  
  constructor( http: HttpClient, private _serverJson: ServerService ) {
    this.http = http;
    this.apiUrl = `http://localhost:${this._serverJson.getServerPort()}/projects`;
    this.loadData().subscribe((res: boolean) => {
      return res;
    });
  }
  
  public async initService(): Promise<boolean> {
    await this.loadData().subscribe((res: boolean) => {
      return res;
    });
    
    return Promise.resolve(true);
  }
  
  private getDataUrl(): string {
    let url;
    if (!environment.production) {
      url = 'assets/db.json';
    } else {
      url = `http://localhost:${this._serverJson.getServerPort()}/projects`;
    }
    
    return url;
  }
  
  
  
  getProjects() {
    return this.http.get( this.apiUrl );
  }

  getProject( id: string ): Observable<Project> {
    return this.http.get<Project>( `${this.apiUrl}/${id}` );
  }

  getProjectDataBase( id: string ): Observable<any> {
    // expand só pode ser usado se o campo de referencia for
    // de  preenchimento obrigatório na entidade filha, exemplo: o database é obrigatório no projeto
    return this.http.get( `${this.apiUrl}/${id}?_expand=dataBase` );
  }

  getProjectsDataBase(): Observable<any> {
    if (!environment.production) {
      this.url = 'assets/db.json';
    } else {
      this.url = `${this.apiUrl}/?_expand=dataBase`;
    }
  
    return this.http.get(this.url);
  }

  public saveProject(project: Project): Observable<boolean> {
    return new Observable((obs) => { obs.next(true); obs.complete(); });
    
    /*
    if (project.id) {
      return this.http.put(this.getDataUrl() + '/' + project.id, project);
    } else {
      return this.http.post(this.getDataUrl(), project);
    }*/
  }
  
  deleteProject( id: string ) {
    return this.http.delete( `${this.apiUrl}/${id}/` );
  }
  
  private loadData(): Observable<boolean> {
    return this.http.get(this.getDataUrl()).pipe(map((db: string) => {
      this.data = JSON.parse(JSON.stringify(db));
      return true;
    }));
  }
  
  public getProjects2(): Observable<Project[]> {
    if (this.data !== null) {
      return new Observable((obs) => { obs.next(this.data.projects); obs.complete(); });
    } else {
      return this.loadData().pipe(map((db: any) => {
        return this.data.projects;
      }));
    }
  }
  
  public getDatabases2(): Observable<DataBase[]> {
    if (this.data !== null) {
      return new Observable((obs) => { obs.next(this.data.dataBases); obs.complete(); });
    } else {
      return this.loadData().pipe(map((db: any) => {
        return this.data.dataBases;
      }));
    }
  }
  
  public getJavaConfiguration(): Observable<Java[]> {
    if (this.data !== null) {
      return new Observable((obs) => { obs.next(this.data.javaConfigurations); obs.complete(); });
    } else {
      return this.loadData().pipe(map((j: any) => {
        return this.data.javaConfigurations;
      }));
    }
  }
}
