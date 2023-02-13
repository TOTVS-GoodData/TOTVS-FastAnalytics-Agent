import { ElectronService } from 'ngx-electronyzer';
import { Project } from '../utilities/interfaces';
import { UserService } from '../service/user.service';
import { Injectable } from '@angular/core';

@Injectable()
export class Util {
    constructor( private _electronService: ElectronService,
        private _userService: UserService ) {}

    tokenWithPrivileges( project: Project ) {
        return new Promise<void>( ( resolve, reject ) => {
          let hasPrivileges = false;
          let token = '';
          let password = '';

          password = this._electronService.ipcRenderer.sendSync( 'decrypt', project.gdc_password );
          this._userService.login( project.gdc_username, password )
            .subscribe(
              () => {
                this._userService.getProject( project.gdc_projectId ).subscribe( ( projectData ) => {
                  token =  projectData.project.content.authorizationToken;
                  hasPrivileges = this._electronService.ipcRenderer.sendSync( 'checkToken', token );
                  if ( hasPrivileges ) {
                    resolve();
                  } else {
                    reject( 'Projeto sem autorização de exportação!' );
                  }
                }, error => {
                  reject( error );
                });
              },
              error => {
                reject( error );
              });
          });
    }

}
