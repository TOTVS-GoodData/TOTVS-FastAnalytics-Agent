import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { PoRadioGroupOption } from '@po-ui/ng-components';
import { PoModalAction, PoModalComponent } from '@po-ui/ng-components';
import { PoNotificationService } from '@po-ui/ng-components';
import { ElectronService } from 'ngx-electronyzer';
import { Project, DataBase } from '../utilities/interfaces';
import { ProjectService } from '../service/project.service';
import { UserService } from '../service/user.service';
import { Util } from '../shared/util';
import { optionsProjectType, CNST_MODALIDADE_CONTRATACAO } from '../utilities/constants';

import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})

export class ProjectComponent implements OnInit {

  @ViewChild('modal') modal: PoModalComponent;
  @ViewChild('modal_1') modal_1: PoModalComponent;
  @ViewChild('projectForm') projectForm: NgForm;
  
  projects: Project[];
  isHideLoading = true;
  projectToDelete: string;
  isDeleteProject: boolean;
  modalTitle: string;
  projectType: string;
  
  
  opt: any;
  
  
  protected _CNST_MODALIDADE_CONTRATACAO: any;
  protected modalidadeContratacao: string = null;
  protected codigoT: string = null;
  
  public setoptions(): Array<any> {
    return [
       { label: 'Editar',  function: 'editProject', url: 'project-add' }
      ,{ label: 'Excluir', function: 'deleteProject' }
    ];
  }
  
  actionsComponent: Array<{}> = [
    { label: 'Novo', action: () => { this.insertProject() }, icon: 'po-icon po-icon-plus' }
  ];

  constructor(
     private projectService: ProjectService
    ,private router: Router
    ,private _electronService: ElectronService
    ,private thfNotification: PoNotificationService
    ,private _userService: UserService
    ,private _util: Util
  ) {
    this.opt = optionsProjectType;
    this._CNST_MODALIDADE_CONTRATACAO = CNST_MODALIDADE_CONTRATACAO;
  }
  
  ngOnInit(): void {
    forkJoin([
       this.projectService.getProjects2()
      ,this.projectService.getDatabases2()
    ]).subscribe((results: [Project[], DataBase[]]) => {
      this.projects = results[0].map((p: Project) => {
        p.dataBaseId = results[1].find((db: DataBase) => {
          return db.id === p.dataBaseId;
        }).name;
        return p;
      });
    });
  }
  
  protected insertProject(): void {
    this.modal_1.open();
  }
  
  public modal_contract_close(): void {
    this.modalidadeContratacao = null;
    this.codigoT = null;
    this.modal_1.close();
  }
  
  public modal_contract_confirm(): void {
      this.router.navigate([ '/project-add', this.modalidadeContratacao, this.codigoT ]);
  }
  
  close: PoModalAction = {
    action: () => {
      this.modal.close();
    },
    label: 'Cancelar'
  };
  
  confirm: PoModalAction = {
    action: () => {
      if ( this.isDeleteProject ) {
        this.delete();
      } else {
        //this.deleteFolderQuery();
      }
    },
    label: 'Confirmar',
  };
  
  editProject( index: string ) {
    const type = ( this.projectType === undefined ? 'P' : this.projectType );
    this.router.navigate( [ '/project-add', type, index ] );
  }

  deleteProject( index: string ) {
    this.isDeleteProject = true;
    this.projectToDelete = index;
    this.modalTitle = 'Deseja realmente excluir o projeto?';
    this.modal.open();
  }

  delete() {
    this.projectService.deleteProject( this.projectToDelete )
    .subscribe( ( ) => {
      //this.getProjects();
      this.modal.close();
    }, ( error ) => {
      console.log( error );
      this.modal.close();
    });
  }

  updateProjectQueryPath( index: string, clear: boolean ) {
    return new Promise( ( resolve, reject ) => {
      if ( this._electronService.isElectronApp ) {
        this.projectService.getProject( index )
        .subscribe( ( res ) => {
          const project = res;
          let queryFolder;

          if ( clear ) {
            queryFolder = project.gdc_query_folder;
            project.gdc_query_folder = undefined;
          } else {
            queryFolder = this._electronService.ipcRenderer.sendSync( 'getQueryPath', project.id, project.title );
            project.gdc_query_folder = queryFolder;
          }

          this.projectService
          .saveProject( project )
          .subscribe( ( ) => {
            resolve( queryFolder );
          },
          error => {
            console.log( error );
            reject();
          } );
        }, error => console.log( error ) );
      } else {
        reject(  );
      }
    });
  }

  tokenWithPrivileges( index: string ) {
    return new Promise<void>( ( resolve, reject ) => {
      const project = this.projects.find( proj => proj.id === index );

      this._util.tokenWithPrivileges( project ).then(
          () => {
            resolve();
          },
          (error) => {
            reject( error);
          }
      );
    });
  }
}
