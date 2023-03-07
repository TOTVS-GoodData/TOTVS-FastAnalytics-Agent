import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { merge, flatMap, map, switchMap, mergeMap } from 'rxjs/operators';

import { HttpService } from './http.service';

import { GDProject, GDProcess } from '../utilities/interfaces';

import { environment } from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class GoodDataService {
  private url: string;
  
  constructor( private _httpService: HttpService ) {
  }
  
  public init(profile_id: string,  current_project_id: string): Observable<boolean> {
    return this.getProjects(profile_id).pipe(switchMap((projects: GDProject[]) => {
      this.AVAILABLE_PROJECTS = projects;
      this._CURRENT_PROJECT = this.AVAILABLE_PROJECTS.find((p: GDProject) => { return p.id === current_project_id});
      
      if (this._CURRENT_PROJECT != undefined) {
        return this.updateProjectTree().pipe(map((res) => {
          return res;
        }));
      } else {
        return Promise.resolve(true);
      }
    }));
  }
  
  private updateProjectTree(): Observable<boolean> {
    return this._CURRENT_PROJECT.ob_processes.pipe(switchMap((p: GDProcess[]) => {
      this._CURRENT_PROJECT.processes = p;
      return Promise.resolve(true);
    }));
  }
  
  private getProjects(profile_id: string): Observable<GDProject[]> {
    let projects: Array<GDProject> = [];
    let url: string = 'gdc/account/profile/' + profile_id + '/projects';
    return this._httpService.get(url, { withCredentials: true })
      .pipe(map((res: any) => {
        projects = [];
        for (let project of res.projects) {
          let id: string = project.project.links.self.replace('/gdc/projects/', '');
          let p = {
             id: id
            ,name: project.project.meta.title
            ,description: project.project.meta.summary
            ,ob_processes: this.getProcesses(id)
            ,processes: []
          }
          projects.push(p);
        }
        return projects;
      }));
  }
  
  public getProcesses(project_id: string): Observable<GDProcess[]> {
    let processes: Array<GDProcess> = [];
    let url: string = 'gdc/projects/' + project_id + '/dataload/processes';
    return this._httpService.get(url, { withCredentials: true })
      .pipe(map((res: any) => {
        processes = res.processes.items.map((p: any) => {
          return {
             id: p.process.links.self.replace('/gdc/projects/' + project_id + '/dataload/processes/', '')
            ,url: p.process.links.self
            ,name: p.process.name
            ,graphs: p.process.graphs.map((g: any) => {
              return g.replace(p.process.name,'');
              })
            ,type: p.process.type
          }
        });
      return processes;
    }));
  }
  /*
  public getGraphs(project_id: string): Observable<GDProcess[]> {
    let processes: Array<GDProcess> = [];
    let url: string = 'gdc/projects/' + project_id + '/dataload/processes';
    return this._httpService.get(url, { withCredentials: true })
      .pipe(map((res: any) => {
        processes = [];
        return null;
    }));
  }*/
  
  public setCurrentProject(id: string): Observable<boolean> {
    this._CURRENT_PROJECT = this._AVAILABLE_PROJECTS.find((p: GDProject) => { return p.id === id });
    return this.updateProjectTree().pipe(map((res: boolean) => {
      return res;
    }));
  }
  
  private _CURRENT_PROJECT: GDProject;
  get CURRENT_PROJECT(): GDProject {
    return this._CURRENT_PROJECT;
  }
  
  set CURRENT_PROJECT(current_project: GDProject) {
    this._CURRENT_PROJECT = current_project;
  }
  
  private _AVAILABLE_PROJECTS: GDProject[];
  get AVAILABLE_PROJECTS(): GDProject[] {
    return this._AVAILABLE_PROJECTS;
  }
  
  set AVAILABLE_PROJECTS(availableProjects: GDProject[]) {
    this._AVAILABLE_PROJECTS = availableProjects;
  }
  
  /*
  public getDashboards(project_id: string): Observable<GDProcess[]> {
    let dashboards: Array<Dashboard> = [];
    let url: string = 'gdc/md/' + project_id + '/query/projectdashboards?showAll=0';
    return this._httpService.get(url, { withCredentials: true })
      .pipe(map((res: any) => {
        dashboards = [];
        for (let d of res.query.entries) {
          let dashboard_id = d.link.replace('/gdc/md/' + project_id + '/obj/', '');
          let dashboard_obj: Dashboard = {
             id: dashboard_id
            ,identifier: d.identifier
            ,type: 'Dashboard'
            ,title: d.title
            ,favorite: (this._sessionService.FAVORITES.find((elem) => {
               return ((elem.user_id == this._sessionService.USER_ID)
                   && (elem.project_id == project_id)
                   && (elem.object_type == 'Dashboard')
                   && (elem.object_id == dashboard_id))
             }) != undefined)
            ,interactions: (() => {
              let x: Interactions = this._sessionService.INTERACTIONS.find((elem) => {
                return ((elem.user_id == this._sessionService.USER_ID)
                     && (elem.project_id == project_id)
                     && (elem.object_type == 'Dashboard')
                     && (elem.object_id == dashboard_id))
               });
              if (x != undefined) return x.interactions;
              else return 0;
            })()
            ,opened: false
            ,hide: false
            ,tags: ((d.tags == '') ? null : d.tags.split(' '))
            ,ob_tabs: this.getDashboardTabs(project_id, dashboard_id)
            ,tabs: []
          }
          dashboards.push(dashboard_obj);
        }
        dashboards.sort((a, b) => {
          if (a.title < b.title) { return -1; }
          else if (a.title > b.title) { return 1; }
          else { return 0; }
        });
        return dashboards;
      }));
  }*/
}
