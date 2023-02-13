import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electronyzer';
import { QueryProject } from '../query/query-project';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

@Injectable()
export class QueryService {

    constructor( private _electronService: ElectronService, private _thfNotification: PoNotificationService ) {}

    getQuery() {

        let query: any;
        const queryList = new Array<QueryProject>();

        query = [];

        query.projects = [];

        if ( this._electronService.isElectronApp ) {
           query  = this._electronService.ipcRenderer.sendSync( 'listQueries' );

            query.projects.forEach( function ( item ) {
                let projectId = '';
                let projectName = '';
                let posHifen = 0;
                const queryProject = new QueryProject();

                posHifen = item.projeto.indexOf(' - ');
                projectId = item.projeto.substr( 0, posHifen);
                projectName = item.projeto.substr( posHifen + 3 );


                queryProject.project = projectName;
                queryProject.projectId = projectId;

                queryProject.files = [];

                queryProject.files.push( item.files );

                queryList.push( queryProject );

            });

        }

        return queryList;
    }

    loadQuery( dirPath, fileName) {
        const file = dirPath + '/' + fileName;
        let query = '';

        if ( this._electronService.isElectronApp ) {
            query  = this._electronService.ipcRenderer.sendSync( 'loadQuery', file );
        }

        return query;
    }

    deleteQuery( file ) {
        let success = true;

        if ( this._electronService.isElectronApp ) {
            success  = this._electronService.ipcRenderer.sendSync( 'deleteQuery', file );
        }

        if (!success) {
            const thfNotification: PoNotification = { message: 'Houve um erro ao remover o arquivo!',
                orientation: PoToasterOrientation.Top };

            this._thfNotification.error( thfNotification );
        } else {
            const thfNotification: PoNotification = { message: 'Arquivo removido com sucesso!',
            orientation: PoToasterOrientation.Top };

            this._thfNotification.success( thfNotification );
        }

        return success;
    }

    saveQuery( queryinfo, isNew ) {
        let query = '';
        let path = '';
        let result;

        if ( this._electronService.isElectronApp ) {
            if ( isNew ) {
                let folder = '';

                folder = this._electronService.ipcRenderer.sendSync( 'getQueryPath', queryinfo.projectId, queryinfo.projectName );

                if ( queryinfo.type === 'Dimensão') {
                    folder = folder + 'dim/';
                } else {
                    folder = folder + 'fact/';
                    if ( queryinfo.recurrence === 'Mensal') {
                        folder = folder + 'mensal/';
                    }
                }

                path = folder + queryinfo.fileName;

            } else {
                path = queryinfo.dirPath + '/' + queryinfo.fileName;
            }

            query = queryinfo.query;

            result = this._electronService.ipcRenderer.sendSync( 'saveQuery', path, query );

        }
    }

}
