import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoSelectOption, PoSwitchLabelPosition } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';
import { PoNotificationService } from '@po-ui/ng-components';
import { ElectronService } from 'ngx-electronyzer';
import { ModalService } from '../modal/modal.service';
import { Project, DataBase, Java, Parameter, GDProject, GDProcess } from '../utilities/interfaces';
import { DataBaseService } from '../service/data-base.service';
import { JavaService } from '../service/java.service';
import { ProjectService } from '../service/project.service';
import { LoginService } from '../service/login.service';
import { GoodDataService } from '../service/gooddata.service';
import { UserService } from '../service/user.service';
import { PoInfoOrientation } from '@po-ui/ng-components';
import { SessionService } from '../service/session-service';
import { CNST_ORIGEM, CNST_ERP, CNST_MODALIDADE_CONTRATACAO, CNST_UPLOAD_URL, CNST_DOMAIN, CNST_EXTENSION } from '../utilities/constants';
import { Utilities } from '../utilities/utilities';

import { merge, flatMap, map, switchMap, mergeMap } from 'rxjs/operators';

import { forkJoin, Observable } from 'rxjs';

const CNST_FIELD_NAMES: Array<any> = [
   { key: 'modalidade', value: 'Modalidade de Contratação' }
  ,{ key: 'erp', value: 'ERP' }
  ,{ key: 'codigot', value: 'Código T do cliente' }
  ,{ key: 'modulo', value: 'Módulo' }
  ,{ key: 'origem', value: 'Origem dos dados' }
  ,{ key: 'gdc_username', value: 'Usuário' }
  ,{ key: 'environment', value: 'Domínio' }
  ,{ key: 'gdc_password', value: 'Senha' }
  ,{ key: 'gdc_projectId', value: 'Projeto' }
  ,{ key: 'gdc_upload_url', value: 'URL para upload do arquivo' }
  ,{ key: 'gdc_etl_process_url', value: 'URL do processo de ETL' }
  ,{ key: 'gdc_etl_graph', value: 'Graph (CloudConnect)' }
  ,{ key: 'gdc_upload_archive', value: 'Nome do arquivo' }
  ,{ key: 'gdc_archive_extension', value: 'Extensão do arquivo' }
  ,{ key: 'databaseId', value: 'Banco de dados' }
  ,{ key: 'javaConfigurationId', value: 'Configuração' }
  ,{ key: 'gdc_query_folder', value: 'Pasta de queries customizadas' }
  ,{ key: 'gdc_script_folder', value: 'Pasta de scripts customizados' }
];

@Component({
  selector: 'app-project-add',
  templateUrl: './project-add.component.html',
  styleUrls: ['./project-add.component.css'],
})

export class ProjectAddComponent {
  
  @ViewChild( 'javaParams', { read: ElementRef } ) javaParams: any;
  
  protected _CNST_FIELD_NAMES: any;
  protected _CNST_UPLOAD_URL: any;
  protected _CNST_EXTENSION: any;
  protected _CNST_DOMAIN: any;
  protected _CNST_MODALIDADE_CONTRATACAO: any;
  protected _CNST_ERP: any;
  protected _CNST_ORIGEM: any;
  protected _CNST_MODULO: any;
  
  public smartOptionsPosition: PoSwitchLabelPosition = PoSwitchLabelPosition.Left;
  public orientation = PoInfoOrientation.Horizontal;
  public project: Project = new Project();
  public database: DataBase = new DataBase();
  public javaConfiguration: Java = new Java();
  
  public po_grid_config = [ { column: 'value', label: 'value', width: '100%'} ];
  
  /*************************************************/
  /* MAPEAMENTO DOS NOMES DOS CAMPOS DO FORMULÁRIO */
  /*************************************************/
  protected lbl_modalidade: string;
  protected lbl_erp: string;
  protected lbl_codigot: string;
  protected lbl_modulo: string;
  protected lbl_origem: string;
  protected lbl_gdc_username: string;
  protected lbl_environment: string;
  protected lbl_gdc_password: string;
  protected lbl_gdc_projectId: string;
  protected lbl_gdc_upload_url: string;
  protected lbl_gdc_etl_process_url: string;
  protected lbl_gdc_etl_graph: string;
  protected lbl_gdc_upload_archive: string;
  protected lbl_gdc_archive_extension: string;
  protected lbl_databaseId: string;
  protected lbl_javaConfigurationId: string;
  protected lbl_gdc_query_folder: string;
  protected lbl_gdc_script_folder: string;
  
  /*************************************************/
  /*************************************************/
  /*************************************************/
  
  public operation: string;
  
  public showModalDataBase = false;
  public showModalJava = false;
  
  public listProjects: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listProcess: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listGraph: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listJava: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listDataBase: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listJavaParams: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  public listExtensions: Array<PoSelectOption> = [ { label: undefined, value: undefined } ];
  
  protected no_option_selected: PoSelectOption = { label: '', value: 'null' };
  
  constructor(
     private _projectService: ProjectService
    ,private _userService: UserService
    ,private _javaService: JavaService
    ,private router: Router
    ,private _utilities: Utilities
    ,private activatedRoute: ActivatedRoute
    ,private thfNotification: PoNotificationService
    ,private _electronService: ElectronService
    ,private _dataBaseService: DataBaseService
    ,private modalService: ModalService
    ,private _sessionService: SessionService
    ,private _goodDataService: GoodDataService
    ,private _loginService: LoginService
  ) {
    this._CNST_FIELD_NAMES = CNST_FIELD_NAMES;
    this.lbl_modalidade = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'modalidade'; }).value;
    this.lbl_erp = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'erp'; }).value;
    this.lbl_codigot = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'codigot'; }).value;
    this.lbl_modulo = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'modulo'; }).value;
    this.lbl_origem = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'origem'; }).value;
    this.lbl_gdc_username = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_username'; }).value;
    this.lbl_environment = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'environment'; }).value;
    this.lbl_gdc_password = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_password'; }).value;
    this.lbl_gdc_projectId = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_projectId'; }).value;
    this.lbl_gdc_upload_url = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_upload_url'; }).value;
    this.lbl_gdc_etl_process_url = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_etl_process_url'; }).value;
    this.lbl_gdc_etl_graph = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_etl_graph'; }).value;
    this.lbl_gdc_upload_archive = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_upload_archive'; }).value;
    this.lbl_gdc_archive_extension = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_archive_extension'; }).value;
    this.lbl_databaseId = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'databaseId'; }).value;
    this.lbl_javaConfigurationId = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'javaConfigurationId'; }).value;
    this.lbl_gdc_query_folder = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_query_folder'; }).value;
    this.lbl_gdc_script_folder = this._CNST_FIELD_NAMES.find((v: any) => { return v.key == 'gdc_script_folder'; }).value;
       
    this._CNST_EXTENSION = CNST_EXTENSION;
    this._CNST_DOMAIN = CNST_DOMAIN;
    this._CNST_UPLOAD_URL = CNST_UPLOAD_URL;
    this._CNST_MODALIDADE_CONTRATACAO = CNST_MODALIDADE_CONTRATACAO;
    this._CNST_ORIGEM = CNST_ORIGEM;
    this._CNST_ERP = CNST_ERP.map((v) => {
      return { label: v.ERP, value: v.ERP };
    });
    this.project.environment = this._CNST_DOMAIN;
    this.project.gdc_password = 'Gooddata@totvs123';
    this.project.gdc_username = 'dev.gd@totvs.com.br';
    this._CNST_MODULO = null;
    forkJoin([
       this._projectService.getDatabases2()
      ,this._projectService.getJavaConfiguration()
    ]).subscribe((results: [DataBase[], Java[]]) => {
      this.listDataBase = results[0].map((db: DataBase) => {
        return { label: db.name, value: db.id };
      });
      this.listDataBase.push(this.no_option_selected);
      this.listJava = results[1].map((j: Java) => {
        return { label: j.name, value: j.id };
      });
      this.listJava.push(this.no_option_selected);
    });
    this.listProjects = [];
       
       /*
       
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
*/
    
    
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
/*
    this.loadJava().then( () => {
      this.loadDataBase().then( () => {
        this.project = project;
        this.project.typeProduct = ( this.project.typeProduct === undefined ? 'P' : this.project.typeProduct );
        this.project.gdc_password = this._electronService.ipcRenderer.sendSync( 'decrypt', this.project.gdc_password );
        //this.loadProjects().then( ( ) => {
          //  this.loadProcess( this.project.gdc_projectId );
           // this.loadGraph( this.project.gdc_etl_process_url );
        //}, ( err ) => console.error( err ));
      });
    });*/
  }
  
  public folderAdd(): void {
    
  }
  
  public scriptAdd(): void {
    
  }
  
  public onChangeContract(): void {
    
  }
  
  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  
  public getProjects(): void {
    this._loginService.doLogin(this.project.gdc_username, this.project.gdc_password, this.project.environment, false)
      .subscribe((b: boolean) => {
        return this._goodDataService.init(this._sessionService.USER_ID, this.project.gdc_projectId).subscribe((b: boolean) => {
          this.listProjects = this._goodDataService.AVAILABLE_PROJECTS.map((p: GDProject) => {
            return { label: p.name + ' - ' + p.id, value: p.id }
          });
          
          if (this._goodDataService.CURRENT_PROJECT === undefined) {
            this.project.gdc_projectId = undefined;
            this.project.gdc_etl_process_url = undefined;
            this.project.gdc_etl_graph = undefined;
            
            this.listProcess = [];
            this.listGraph = [];
          } else {
            this.listProcess = this._goodDataService.CURRENT_PROJECT.processes.map((p: GDProcess) => {
              return { label: p.name + ' - ' + p.id, value: p.id }
            });
            
            if (this.project.gdc_etl_process_url != undefined) {
              this.listGraph = this._goodDataService.CURRENT_PROJECT.processes.find((p: any) => { return this.project.gdc_etl_process_url === p.id }).graphs.map((g: string) => {
                return { label: g, value: g }
              });
            }
          }
          this._utilities.createNotification('OK', 'Projetos carregados com sucesso!');
        },(err: any) => {
          this._utilities.createNotification('ERR', err.error.message);
        });
      },
      (err: any) => {
        this._utilities.createNotification('ERR', err.error.message);
      });
  }
  
  public onChangeERP(e: string): void {
    this._CNST_MODULO = CNST_ERP.filter((v) => v.ERP === e)[0].Modulos;
    this.project.modulo = null;
  }
  
  public onChangeProject(): void {
    this._goodDataService.setCurrentProject(this.project.gdc_projectId).subscribe((b: boolean) => {
      this.listProcess = this._goodDataService.CURRENT_PROJECT.processes.map((p: GDProcess) => {
        return { label: p.name + ' - ' + p.id, value: p.id }
      });
      this.project.gdc_etl_process_url = undefined;
      
      this.listGraph = [];
      this.project.gdc_etl_graph = undefined;
      
      this.project.gdc_upload_url = this._CNST_UPLOAD_URL + 'project-uploads/' + this.project.gdc_projectId + '/today/';
      
      return null;
    });
  }
  
  public onChangeProcess(): void {
    this.project.gdc_etl_graph = undefined;
    this.listGraph = this._goodDataService.CURRENT_PROJECT.processes.find((p: any) => { return this.project.gdc_etl_process_url === p.id }).graphs.map((g: string) => {
      return { label: g, value: g }
    });
  }
  
  public onChangeDatabase(id: string): void {
    if (id != this.no_option_selected.value) {
      this._projectService.getDatabases2().subscribe((database: DataBase[]) => {
        this.database = database.find((db: DataBase) => { return (db.id === id ); });
      });
    } else {
      this.database = new DataBase();
    }
  }
  
  public onChangeJava(id: string): void {
    if (id != this.no_option_selected.value) {
      this._projectService.getJavaConfiguration().subscribe((java: Java[]) => {
        this.javaConfiguration = java.find((j: Java) => { return (j.id === id ); });
        this.listJavaParams = this.javaConfiguration.params.map((p: Parameter) => {
          return { label: p.value, value: p.value };
        });
      });
    } else {
      this.javaConfiguration = new Java();
    }
  }
  
  public goToProjects(): void {
    this.router.navigate(['/project']);
  }
  
  public validProject(): Observable<boolean> {
    let proj = new Project();
    
    // Todo processo de ETL precisa ter um graph preenchido. //
    if (this.project.gdc_etl_process_url != undefined) {
      proj.gdc_etl_graph = (proj.gdc_etl_graph != undefined ? proj.gdc_etl_graph : null);
    }
    
    // Regras de negócio do FAST Analytics //
    if (((this.project.modalidade == 'FAST_1') || (this.project.modalidade == 'FAST_2')) && ((this.project.erp == 'Datasul') || (this.project.erp == 'RM'))) {
      proj.gdc_query_folder = (proj.gdc_query_folder != undefined ? proj.gdc_query_folder : null);
      proj.dataBaseId = (proj.dataBaseId != undefined ? proj.dataBaseId : null);
      
      if (this.project.erp == 'RM') {
        proj.gdc_script_folder = (proj.gdc_script_folder != undefined ? proj.gdc_script_folder : null);
      }
    }
    
    // Ajuste da interface PO.UI (não dispara eventos com valores 'null') //
    if (this.project.dataBaseId == this.no_option_selected.value) { this.project.dataBaseId = ''; }
    if (this.project.javaConfigurationId == this.no_option_selected.value) { this.project.javaConfigurationId = ''; }
    
    let propertiesNotDefined = Object.getOwnPropertyNames.call(Object, proj).map((p: string) => {
      if ((this.project[p] == undefined) && (p != 'id')) return p;
    }).filter((p: string) => { return p != null; });
    
    // Validação dos campos de formulário //
    if (propertiesNotDefined.length > 0) {
      if (propertiesNotDefined[0] == 'gdc_etl_graph') {
        this._utilities.createNotification('ERR', 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido. Por favor selecione um graph para ser executado, ou remova a seleção do campo "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === 'gdc_etl_process_url'}).value + '".');
      } else {
        this._utilities.createNotification('ERR', 'Campo obrigatório "' + this._CNST_FIELD_NAMES.find((f: any) => { return f.key === propertiesNotDefined[0]}).value + '" não preenchido.');
      }
      
      return new Observable((obs) => { obs.error(false); });
    }
    
    // Validação das credenciais do GoodData //
    return this._loginService.doLogin(this.project.gdc_username, this.project.gdc_password, this.project.environment, false)
      .pipe(switchMap((b: boolean) => {
      return Promise.resolve(b);
    }));
  }
  
  public saveProject(): void {
    this.validProject().subscribe((v: boolean) => {
      if (v) {
        this.project.title = this._goodDataService.AVAILABLE_PROJECTS.find((p: GDProject) => { return this.project.gdc_projectId == p.id; }).name;
        /*
        console.log(this.project);
        Object.getOwnPropertyNames.call(Object, this.project).map((p: string) => {
          if (this.project[p] == null) { this.project[p] = undefined; }
        });
        console.log(this.project);
        */
        if (this._electronService.isElectronApp) {
          this.project.gdc_password = this._electronService.ipcRenderer.sendSync( 'encrypt', this.project.gdc_password );
        }
        
        this._projectService.saveProject(this.project).subscribe((res: boolean) => {
          this._utilities.createNotification('OK', 'Projeto salvo com sucesso.');
          this.goToProjects();
        }, error => {
          this._utilities.createNotification('ERR', error.message);
        });
      }
    });
  }
      // Muito importante!!!
      // Ao limpar um campo que seja referência em outra estrutura deve eliminar
      // o atributo do json (setar o valor como undefined), pois caso contrário ele ficaria com um valor inválido,
      // o que traria sérios problemas, como por exemplo na exclusão da estrutura pai apagaria todos os filhos
      // com código inválido
/*      if ( this.project.javaConfigurationId === '' ) {
        this.project.javaConfigurationId = undefined;
      }

      
    } else {
      
  }*/
  
  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////
  
  
  enterPassword( event ) {
    event.preventDefault( );
    this.getProjects();
  }
  
  public focusParams() {
    this.javaParams.nativeElement.click();
  }
  
  selectFolder( type: number) {
   
  }

  selectFileMyProperties() {
    
  }
  
  dataBaseAdd() {
    this.showModalDataBase = true;
    this.modalService.open( 'modal-data-base' );
  }

  closeModalDataBase() {
    this.showModalDataBase = false;
    this.modalService.close( 'modal-data-base' );/*
    this.loadDataBase().then( ( ) => {
      if ( ( this.project.dataBaseId === null ) && ( this.listDataBase.length === 1) ) {
        this.project.dataBaseId = this.listDataBase[0].value.toString();
      }
    });*/
  }

  javaAdd() {
    this.showModalJava = true;
    this.modalService.open( 'modal-java' );
  }

  closeModalJava() {
    this.showModalJava = false;
    this.modalService.close( 'modal-java' );/*
    this.loadJava().then( ( ) => {
      if ( ( ( this.project.javaConfigurationId === null ) || ( this.project.javaConfigurationId === undefined ) ) &&
        ( this.listJava.length === 1) ) {
          this.project.javaConfigurationId = this.listJava[0].value.toString();
      }
    });*/
  }
}
