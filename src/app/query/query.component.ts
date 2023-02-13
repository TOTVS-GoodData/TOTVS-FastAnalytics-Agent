import { Component, OnInit, ViewChild } from '@angular/core';
import { Project, Query } from '../utilities/interfaces';
import { PoModalComponent } from '@po-ui/ng-components';
import { PoTableAction, PoTableColumn } from '@po-ui/ng-components';
import { PoModalAction } from '@po-ui/ng-components';

import { QueryService } from '../service/query.service';
import { QueryProject } from './query-project';
import { PoSelectOption } from '@po-ui/ng-components';
import { ProjectService } from '../service/project.service';
import { Util } from '../shared/util';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';
import { ElectronService } from 'ngx-electronyzer';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.css']
})
export class QueryComponent implements OnInit {

  @ViewChild('queryModal') queryModal: PoModalComponent;
  @ViewChild('modalDelete') modalDelete: PoModalComponent;
  @ViewChild('modalExport') modalExport: PoModalComponent;

  public queryEdit = new Query();
  public inserting = false;
  public modalTitle: string;
  public queryToDelete: string;

  public projectExport: Project;
  public isHideLoading = true;

  public columnsQuery: Array<PoTableColumn> =  this.getColumns();

  public listProject: Array<PoSelectOption> = [ { label: undefined, value: undefined}];
  public listProjectNew: Array<PoSelectOption> = [ { label: undefined, value: undefined}];

  readonly typeOptions: Array<PoSelectOption> = [
    {label: 'Dimensão', value: 'Dimensão'},
    {label: 'Fato', value: 'Fato'}
  ];

  readonly recurrenceOptions: Array<PoSelectOption> = [
    {label: 'Período', value: 'Período'},
    {label: 'Mensal', value: 'Mensal'}
  ];

   actions: Array<PoTableAction> = [
    { action: this.openModal.bind( this), label: 'Editar'},
    { action: this.deleteQuery.bind( this), label: 'Remover'}
  ];

  close: PoModalAction = {
    action: () => {
      this.queryModal.close();
    },
    label: 'Cancelar'
  };

  confirm: PoModalAction = {
    action: () => {
      const messageError = this.validSaveQuery();

      if ( messageError ) {
        const thfNotification: PoNotification = { message: messageError, orientation: PoToasterOrientation.Top };
        this.thfNotification.error( thfNotification );
      } else {
        if (this.inserting ) {
          const index = this.listProject.findIndex( project => project.value === this.queryEdit.projectId );
          if ( this.listProject[index] ) {
            this.queryEdit.projectName = this.listProject[index].label;
          }
        }

        this._queryService.saveQuery( this.queryEdit, this.inserting);
        this.queryModal.close();
        this.loadArchives();
      }

    },
    label: 'Confirmar'
  };


  closeModalDelete: PoModalAction = {
    action: () => {
      this.modalDelete.close();
    },
    label: 'Cancelar'
  };

  confirmModalDelete: PoModalAction = {
    action: () => {
      this.delete();
    },
    label: 'Confirmar'
  };

  closeModalExport: PoModalAction = {
    action: () => {
      this.modalExport.close();
    },
    label: 'Cancelar'
  };

  confirmModalExport: PoModalAction = {
    action: () => {
      this.export();
    },
    label: 'Confirmar'
  };

  archives: Array<QueryProject>;

  constructor( private _queryService: QueryService,
               private _projectService: ProjectService,
               private thfNotification: PoNotificationService,
               private _electronService: ElectronService,
               private _util: Util ) {

    this.listProject = [];
    this.listProjectNew = [];
  }

  ngOnInit() {
    this.projectExport = new Project();

    this.loadProject();

    this.loadArchives();
  }

  loadArchives() {
    this.archives = [];
    this.archives = this._queryService.getQuery();
  }

  getColumns(): Array<PoTableColumn> {
    return [
      { property: 'fileName', label: 'Nome Arquivo' },
      { property: 'type', label: 'Tipo' }
    ];
  }

  openModal( query: Query ) {
    this.inserting = false;
    this.queryEdit = new Query();
    this.queryEdit = query;
    this.queryEdit.query = this._queryService.loadQuery( this.queryEdit.dirPath, this.queryEdit.fileName );
    this.modalTitle = 'Editar Query';
    this.queryModal.open();
  }

  insertQuery() {
    this.queryEdit = new Query();
    this.inserting = true;
    this.queryModal.open();
    this.modalTitle = 'Nova Query';
  }

  deleteQuery( query: Query ) {
    this.queryToDelete = query.dirPath + '/' + query.fileName;
    this.modalDelete.open();
  }

  delete() {
    let success = true;

    success = this._queryService.deleteQuery( this.queryToDelete );

    if (success) {
      this.loadArchives();
    }
    this.modalDelete.close();
  }

  loadProject() {
    this.listProject = [];
    this.listProjectNew = [];
    return new Promise<void>( ( resolve, reject ) => {
      this._projectService.getProjects().subscribe((projects: Array<any>) => {
        let option: PoSelectOption;
        for ( let i = 0; i < projects.length; i ++ ) {
          if ( projects[i].lineProduct === 1) {
            option = { label: projects[i].title, value: projects[i].id };
            this.listProject.push( option );

            const index = this.archives.findIndex( archiveProj => archiveProj.projectId === projects[i].id.toString() );

            if ( index > -1 ) {
              this.listProjectNew.push( option );
            }

          }
        }
        resolve( );
      },
      error => {
        console.error( error );
        reject( );
      });
    });
  }

  exportQuery() {
    this.projectExport = new Project();
    this.modalExport.open();
  }

  export(  ) {
    this.isHideLoading = false;
    this.modalExport.close();
    this._projectService.getProject( this.projectExport.id )
        .subscribe( ( proj ) => {
          this.projectExport = proj;
          this._util.tokenWithPrivileges( this.projectExport ).then(
              () => {
                this.updateProjectQueryPath(  ).then(
                  ( queryFolder ) => {
                      this._electronService.ipcRenderer.sendSync( 'exportQueries', this.projectExport.id, queryFolder );
                      setTimeout(() => {
                        this.loadArchives();
                        this.loadProject();
                        this.isHideLoading = true;
                      }, 10000);
                    },
                  ( err ) => {
                    console.error( err );
                    this.isHideLoading = true;
                  });
              },
              (error) => {
                this.isHideLoading = true;
                const thfNotification: PoNotification = { message: error, orientation: PoToasterOrientation.Top };
                this.thfNotification.error( thfNotification );
              }
            );
        });
  }

  updateProjectQueryPath(  ) {
    return new Promise( ( resolve, reject ) => {
      let queryFolder;

      queryFolder = this._electronService.ipcRenderer.sendSync( 'getQueryPath', this.projectExport.id, this.projectExport.title );
      this.projectExport.gdc_query_folder = queryFolder;

      this._projectService
      .saveProject( this.projectExport )
      .subscribe( ( ) => {
        resolve( queryFolder );
      },
      error => {
        console.log( error );
        reject();
      } );
    });
  }


  onChangeProject( project ) {
    const position = project - 1;
    this.queryEdit.projectName = this.listProject[ position ].label;
  }

  validSaveQuery() {
    let messageError = '';

    if ( ( this.queryEdit.fileName === undefined ) || ( this.queryEdit.fileName === '' ) ) {
      messageError = 'Informar o nome do arquivo';
    } else if ( ! ( ( this.queryEdit.fileName.toUpperCase().endsWith( '.TXT' ) ) ||
                    ( this.queryEdit.fileName.toUpperCase().endsWith( '.SQL' ) ) ) ) {
      messageError = 'Informar extensão do arquivo';
    } else if ( ( this.queryEdit.query === undefined ) || ( this.queryEdit.query === '' ) ) {
      messageError = 'Informar conteúdo da query';
    } else if ( ( this.queryEdit.recurrence === undefined ) || ( this.queryEdit.recurrence === '' ) ) {
      messageError = 'Informar recorrência da query';
    } else if ( ( this.queryEdit.type === undefined ) || ( this.queryEdit.type === '' ) ) {
      messageError = 'Informar tipo da query';
    } else if ( ( this.queryEdit.projectId === undefined ) || ( this.queryEdit.projectId === '' ) ) {
      messageError = 'Informar projeto da query';
    }

    return messageError;
  }

}
