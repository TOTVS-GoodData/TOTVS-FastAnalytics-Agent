import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoSelectOption, PoSwitchLabelPosition } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';
import { PoNotificationService } from '@po-ui/ng-components';
import { ElectronService } from 'ngx-electronyzer';
import { ModalService } from '../modal/modal.service';
import { Project } from '../utilities/interfaces';
import { DataBaseService } from '../service/data-base.service';
import { JavaService } from '../service/java.service';
import { ProjectService } from '../service/project.service';
import { UserService } from '../service/user.service';
import { PoInfoOrientation } from '@po-ui/ng-components';
import { SessionService } from '../service/session-service';

@Component({
  selector: 'app-project-add',
  templateUrl: './project-add.component.html',
  styleUrls: ['./project-add.component.css'],
})

export class ProjectAddComponent {

  public smartOptionsPosition: PoSwitchLabelPosition = PoSwitchLabelPosition.Left;
  public orientation = PoInfoOrientation.Horizontal;
  public project: Project = new Project();
  public operation: string;

  public showModalDataBase = false;
  public showModalJava = false;

  public listProjects: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listProcess: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listGraph: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listJava: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listDataBase: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];

  constructor( private _projectService: ProjectService, private _userService: UserService, private _javaService: JavaService,
    private router: Router, private activatedRoute: ActivatedRoute, private thfNotification: PoNotificationService,
    private _electronService: ElectronService, private _dataBaseService: DataBaseService,
    private modalService: ModalService, private _sessionService: SessionService) {

    if ( this._electronService.isElectronApp ) {
      this._electronService.ipcRenderer.on( 'loadDataBase', () => {
        this.loadDataBase().then( ( ) => {
          if ( ( this.project.dataBaseId === null ) && ( this.listDataBase.length === 1) ) {
            this.project.dataBaseId = this.listDataBase[0].value.toString();
          }
        });
      });

      this._electronService.ipcRenderer.on( 'loadJava', ()  => {
        this.loadJava().then( ( ) => {
          if ( ( this.project.javaConfigurationId === null ) && ( this.listJava.length === 1) ) {
            this.project.javaConfigurationId = this.listJava[0].value.toString();
          }
        });
      });
    }

    this.listProjects = [];
    
    this._sessionService.initSession();
    
    this.activatedRoute.params.subscribe( params => {
      const idProject = params[ 'id' ];
      const typeProject = params[ 'type' ];

      if ( idProject ) {
        this.operation = 'Alterar Projeto';
        this._projectService.getProject( idProject )
            .subscribe( ( project ) => {
                  this.editProject( project );
                }, erro => console.log( erro ) );
      } else {
      //  this.insertProject( typeProject );
      }
    });
  }

  insertProject(modalidadeContratacao: string, codigoT: string) {
    this.operation = 'Cadastrar Projeto';
   // this.loadJava();
    //this.loadDataBase();
   // this.setDefaultValue( typeProject );
  }

  editProject( project: Project ) {
    // A lista deve conter o id do projeto antes que ele seja carregado no objeto,
    // para que haja um match do projeto que está gravado com a lista completa,
    // dessa forma o valor será exibido no combo na edição. O mesmo acontece para os outros combos
    this.listProjects = [ { label: project.title + ' - ' + project.gdc_projectId, value: project.gdc_projectId } ];
    this.listProcess = [ { label: project.gdc_etl_process_url, value: project.gdc_etl_process_url } ];
    this.listGraph = [ { label: project.gdc_etl_graph, value: project.gdc_etl_graph } ];

    this.loadJava().then( () => {
      this.loadDataBase().then( () => {
        this.project = project;
        this.project.typeProduct = ( this.project.typeProduct === undefined ? 'P' : this.project.typeProduct );
        this.project.gdc_password = this._electronService.ipcRenderer.sendSync( 'decrypt', this.project.gdc_password );
        this.loadProjects().then( ( ) => {
            this.loadProcess( this.project.gdc_projectId );
            this.loadGraph( this.project.gdc_etl_process_url );
        }, ( err ) => console.error( err ));
      });
    });
  }

  saveProject( event ) {

    event.preventDefault( );

    if ( this.validProject() ) {

      this.project.title = this.getTitle();

      this.project.gdc_password = this._electronService.ipcRenderer.sendSync( 'encrypt', this.project.gdc_password );

      // Muito importante!!!
      // Ao limpar um campo que seja referência em outra estrutura deve eliminar
      // o atributo do json (setar o valor como undefined), pois caso contrário ele ficaria com um valor inválido,
      // o que traria sérios problemas, como por exemplo na exclusão da estrutura pai apagaria todos os filhos
      // com código inválido
      if ( this.project.javaConfigurationId === '' ) {
        this.project.javaConfigurationId = undefined;
      }

      this._projectService
          .saveProject( this.project )
          .subscribe( () => {
            this.backProjectList();
          }, error => {
            console.log( error );
          } );
    }
  }

  validProject( ) {
    let valid = true;

    if ( ( ( this.project.filesystem_input_dir !== undefined ) && ( this.project.filesystem_input_dir !== '' ) ) &&
      ( ( this.project.filesystem_wildcard === undefined ) || ( this.project.filesystem_wildcard === '') ) ) {
        const thfNotification: PoNotification = {
          message: 'Informar a extensão dos arquivos para upload!',
          orientation: PoToasterOrientation.Top
        };
        this.thfNotification.error( thfNotification );
        valid = false;
    } else if ( ( this.project.lineProduct ===  2 ) &&
              ( ( this.project.pathMyProperties === undefined ) || ( this.project.pathMyProperties === '' ) ||
                ( ! this.project.pathMyProperties.endsWith( '.properties' ) ) ) ) {
        const thfNotification: PoNotification = {
          message: 'Informar o caminho do arquivo .properties',
          orientation: PoToasterOrientation.Top
        };
        this.thfNotification.error( thfNotification );
        valid = false;
    } else if ( ( ( this.project.typeProduct === 'D') || ( this.project.typeProduct === 'R') ) &&
            ( this.project.gdc_query_folder === undefined) ) {
      const thfNotification: PoNotification = {
        message: 'Informar o caminho do diretório queries',
        orientation: PoToasterOrientation.Top
      };
      this.thfNotification.error( thfNotification );
      valid = false;
    } else if ( ( this.project.typeProduct === 'R')  && ( this.project.gdc_script_folder === undefined) ) {
        const thfNotification: PoNotification = {
        message: 'Informar o caminho do diretório script',
        orientation: PoToasterOrientation.Top
        };
        this.thfNotification.error( thfNotification );
        valid = false;

    }

    return valid;
  }


  backProjectList( ) {
    this.router.navigate( [ '/project' ] );
  }

  getTitle() {
    let title = '';
    const index = this.listProjects.findIndex( project => project.value === this.project.gdc_projectId );

    if ( this.listProjects[index] ) {

      title = this.listProjects[index].label;
      const finalTitle = title.lastIndexOf( '-' );
      title = title.slice( 0, finalTitle ).trim();

    }
    return title;
  }

  onAdd( event ) {
    return true;
  }

  onRemove( event ) {
    return true;
  }

  onSave( event ) {
    return true;
  }

  // Valores default quando criar um projeto novo
  setDefaultValue( typeProject: string ) {
    this.project.lineProduct = 1;
    this.project.typeProduct = typeProject;

    this.project.gdc_upload_archive = ( ( typeProject === 'D' ) ? 'DATASUL.zip' :
                                        ( typeProject === 'R' ) ? 'TOTVSANALYTICS.zip' : 'PROTHEUS.zip' );

    if ( typeProject === 'R' ) {
      this.project.gdc_script_folder = 'script';
    }

    this.project.gdc_tsa = false;
    this.project.gdc_unlock = false;
  }

  getProjectsByProfile( profile: string ) {
    this.listProjects = [ ];
    this._userService.getProjects( profile ).subscribe(
        ( result: any ) => {
          console.log(result);
          for ( let i = 0; i < result.body.projects.length; i ++ ) {
            // Trata a url do project para pegar somente o id
            let idProject = result.body.projects[i].project.links.self;
            const lastBar = idProject.lastIndexOf( '/' ) + 1;
            idProject = idProject.slice( lastBar );

            let option: PoSelectOption;
            
            console.log(result.body.projects[i].project.meta.title);
            option = { label: result.body.projects[i].project.meta.title + ' - ' + idProject, value: idProject };
            
            this.listProjects = [...this.listProjects, { label: result.body.projects[i].project.meta.title + ' - ' + idProject, value: idProject }];
          }

          if ( ( this.project.gdc_projectId === undefined ) || ( this.project.gdc_projectId === '' ) ) {
            if ( this.listProjects.length > 0 ) {
              this.project.gdc_projectId = this.listProjects[0].value.toString();
              this.setUploadUrl();
              this.loadProcess( this.project.gdc_projectId );
            }
          }
        },
        error => {
          console.log( error );
        }
    );
  }

  loadProjects() {
    let profile: string;
    return new Promise<void>( ( resolve, reject ) => {
      this._userService.login( this.project.gdc_username, this.project.gdc_password )
        .subscribe(
          res => {
            // Trata o retorno para obter o profile do usuário
            profile = res.userLogin.profile;
            const lastBar = profile.lastIndexOf( '/' ) + 1;
            profile = profile.slice( lastBar );
            this._sessionService.TOKEN_SST = res.userLogin.token;
            
            
            this._userService.refreshToken().subscribe(res2 => {
              this._sessionService.TOKEN_TT = res2.body.userToken.token;
              this.getProjectsByProfile( profile );
            resolve();
            });
            
            
          },
          error => {
            console.log( error );
            reject();
          });
      });
  }

  loadProcess( idProject: string ) {
    const baseUrl = 'https://analytics.totvs.com.br';
    this._userService.getProcess( idProject ).subscribe(
      ( result: any ) => {
        this.listProcess = [ ];
        for ( let i = 0; i < result.processes.items.length; i ++ ) {
          const process = baseUrl + result.processes.items[i].process.links.self;
          let option: PoSelectOption;
          option = { label: process, value: process };
          this.listProcess.push( option );
        }
      },
      error => {
        console.log( error );
      }
    );
  }

  loadGraph( process: string ) {
    this._userService.getGraphs( process ).subscribe(
        ( result: any ) => {
          this.listGraph = [ ];
          for ( let i = 0; i < result.process.executables.length; i ++ ) {
            const graph = result.process.executables[i];
            let option: PoSelectOption;
            option = { label: graph, value: graph };
            this.listGraph.push( option );

            if ( ( this.project.gdc_etl_graph === undefined ) || ( this.project.gdc_etl_graph === '' ) ) {
              if ( option.label.toUpperCase().indexOf( 'MAIN' ) !== -1 ) {
                this.project.gdc_etl_graph = option.value.toString();
              }
            }
          }
      },
      error => {
        console.log( error );
      }
    );
  }

  onChangeProject() {
    this.project.gdc_etl_process_url = '';
    this.listProcess = [ ];
    this.loadProcess( this.project.gdc_projectId );
    this.project.gdc_etl_graph = '';
    this.listGraph = [ ];

    if (this.project.gdc_projectId !== '' ) {
      this.setUploadUrl();
    }
  }

  setUploadUrl() {
    const baseUrl = 'https://secure-di.gooddata.com';
    this.project.gdc_upload_url = `${baseUrl}/project-uploads/${this.project.gdc_projectId}/today/`;
  }

  onChangeProcess() {
    this.project.gdc_etl_graph = '';
    this.listGraph = [ ];
    this.loadGraph( this.project.gdc_etl_process_url );
  }

  loadProjectBanner( ) {
    this.loadProjects( ).then(
      ( ) => {
        const thfNotification: PoNotification = {
          message: 'Projetos carregados com sucesso!',
          orientation: PoToasterOrientation.Top
        };
        this.thfNotification.success( thfNotification );
      },
      ( ) => {
        const thfNotification: PoNotification = {
          message: 'Erro ao carregar projetos!',
          orientation: PoToasterOrientation.Top
        };
        this.thfNotification.error( thfNotification );
      }
    );
  }

  enterPassword( event ) {
    event.preventDefault( );
    this.loadProjectBanner();
  }

  selectFolder( type: number) {
   
  }

  selectFileMyProperties() {
    
  }

  loadJava() {
    return new Promise<void>( ( resolve, reject ) => {
      this._javaService.getJavaConfigurations().subscribe(
        ( result: Array<any> ) => {
          this.listJava = [];
          let option: PoSelectOption;
          for ( let i = 0; i < result.length; i ++ ) {
            option = { label: result[i].name, value: result[i].id };
            this.listJava.push( option );
          }
          resolve();
        },
        error => {
          console.error( error );
          reject();
        }
      );
    });
  }

  loadDataBase() {
    return new Promise<void>( ( resolve, reject ) => {
      this._dataBaseService.getDataBaseList().subscribe(
        ( dataBase ) => {
          this.listDataBase = [];
          let option: PoSelectOption;
          for ( let i = 0; i < dataBase.length; i ++ ) {
            option = { label: dataBase[i].name + ' - ' + dataBase[i].jdbc_driver, value: dataBase[i].id };
            this.listDataBase.push( option );

            if ( ( this.project.gdc_etl_graph === undefined ) || ( this.project.gdc_etl_graph === '' ) ) {
              if ( option.label.toUpperCase().indexOf( 'MAIN' ) !== -1 ) {
                this.project.gdc_etl_graph = option.value.toString();
              }
            }
          }
          resolve();
        },
        error => {
          console.error( error );
          reject();
        }
      );
    });
  }

  onChangeLineProject() {
    if ( this.project.typeProduct === 'P' ) {
      if ( this.project.lineProduct === 1 ) {
        this.project.pathMyProperties = '';
        this.project.gdc_upload_archive = 'PROTHEUS.zip';
        this.project.gdc_tsa = false;
        this.project.gdc_unlock = false;
      } else if ( this.project.lineProduct === 2 ) {
        this.project.gdc_upload_archive = 'TOTVSSMARTANALYTICS.zip';
        this.project.gdc_tsa = true;
        this.project.gdc_unlock = false;
      }
    }
  }

  dataBaseAdd() {
    this.showModalDataBase = true;
    this.modalService.open( 'modal-data-base' );
  }

  closeModalDataBase() {
    this.showModalDataBase = false;
    this.modalService.close( 'modal-data-base' );
    this.loadDataBase().then( ( ) => {
      if ( ( this.project.dataBaseId === null ) && ( this.listDataBase.length === 1) ) {
        this.project.dataBaseId = this.listDataBase[0].value.toString();
      }
    });
  }

  javaAdd() {
    this.showModalJava = true;
    this.modalService.open( 'modal-java' );
  }

  closeModalJava() {
    this.showModalJava = false;
    this.modalService.close( 'modal-java' );
    this.loadJava().then( ( ) => {
      if ( ( ( this.project.javaConfigurationId === null ) || ( this.project.javaConfigurationId === undefined ) ) &&
        ( this.listJava.length === 1) ) {
          this.project.javaConfigurationId = this.listJava[0].value.toString();
      }
    });
  }
}
