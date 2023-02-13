import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PoSelectOption } from '@po-ui/ng-components';
import { PoCheckboxGroupOption } from '@po-ui/ng-components';
import { PoModalComponent } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';
import { PoNotificationService } from '@po-ui/ng-components';
import { Project, Schedule } from '../utilities/interfaces';
import { ProjectService } from '../service/project.service';
import { ScheduleService } from '../service/schedule.service';



@Component({
  selector: 'app-schedule-add',
  templateUrl: './schedule-add.component.html',
  styleUrls: ['./schedule-add.component.css']
})

export class ScheduleAddComponent implements OnInit {

  @ViewChild( 'gridSqlParams', { read: ElementRef } ) gridSqlParams: any;
  @ViewChild( 'gridEtlParams', { read: ElementRef } ) gridEtlParams: any;
  @ViewChild('modalSqlParams') modalSqlParams: PoModalComponent;

  private oldStartDateTime = '';
  private _listProjectType: Array<Project>;

  public operation: string;
  public hours: number;
  public dailySelected = { daily: false, halfHour: false };
  public daily = false;
  public halfHour = false;
  public etlParams: string;
  public sqlParams: string;
  public sqlParamsItems: Array<Object>;
  public dbSource = '';

  public schedule: Schedule = new Schedule();
  public listProject: Array<PoSelectOption> = [ { label: undefined, value: undefined }];

  public readonly intervalOptions: Array<PoCheckboxGroupOption> = [
    { value: 'daily', label: 'Diariamente' },
    { value: 'halfHour', label: 'A cada meia-hora' }
  ];

  columnsSql: Array<any> = this.getColumnsSql();
  columnsEtl: Array<any> = this.getColumnsEtl();

  constructor(  private _scheduleService: ScheduleService,
                private thfNotification: PoNotificationService,
                private router: Router, private _projectService: ProjectService,
                private activatedRoute: ActivatedRoute ) {

    this.schedule.etlParams = [];
    this.schedule.sqlParams = [];
    this.listProject = [];
    this._listProjectType = [];

    this.activatedRoute.params.subscribe( params => {
      const idProject = params[ 'id' ];

      if ( idProject ) {
        this.operation = 'Alterar Agendamento';
        this._scheduleService.getSchedule( idProject )
          .subscribe( ( schedule ) => {
            this.editSchedule( schedule );
          }, erro => console.log( erro ) );
      } else {
        this.insertSchedule();
      }
    });
  }

  ngOnInit() {
  }

  insertSchedule() {
    this.operation = 'Cadastrar Agendamento';
    this.loadProject();
    this.privateSetCommonParams();
  }

  editSchedule( schedule: Schedule ) {
    this.loadProject().then(
      ( ) => {
        this.schedule = schedule;
        this.oldStartDateTime = this.schedule.startDateTime;
        this.setInterval();
      }
    );
  }

  loadProject() {
    this.listProject = [];
    this._listProjectType = [];
    return new Promise<void>( ( resolve, reject ) => {
      this._projectService.getProjects().subscribe( (projects: Array<any>) => {
        let option: PoSelectOption;
        for ( let i = 0; i < projects.length; i ++ ) {
          option = { label: projects[i].title, value: projects[i].id };
          this.listProject.push( option );

          const prj = new Project();
          prj.id = projects[i].id;
          prj.typeProduct = projects[i].typeProduct;
          prj.lineProduct = projects[i].lineProduct;

          this._listProjectType.push( prj );
        }
        resolve( );
      },
      error => {
        console.error( error );
        reject( );
      });
    });
  }

  saveSchedule( event ) {

    event.preventDefault( );

    if ( this.validSchedule() ) {
      this._scheduleService
        .saveSchedule( this.schedule )
        .subscribe( () => {
          this.backScheduleList();
        }, error => {
          console.log( error );
        } );
    }
  }

  validSchedule() {
    let valid = true;
    const strEmptyParams = this.hasEmptyParams();

    this.schedule.interval = this.getInterval();
    this.clearLastExec();

    if ( strEmptyParams ) {
      const thfNotification: PoNotification = {
        message: `Existem parâmetros vazios! ${strEmptyParams}`,
        orientation: PoToasterOrientation.Top
      };
      this.thfNotification.error( thfNotification );
      valid = false;
    } else if ( this.invalidStartDateTime() ) {
      const thfNotification: PoNotification = {
        message: 'Informar intervalo, data e horário inicial de execução do projeto!',
        orientation: PoToasterOrientation.Top
      };
      this.thfNotification.error( thfNotification );
      valid = false;
    }
    return valid;
  }


  focusSqlParams( ) {
    this.gridSqlParams.nativeElement.click();
  }

  focusEtlParams( ) {
    this.gridEtlParams.nativeElement.click();
  }

  changeInterval( ) {
    // Ao mudar a opção de Diariamente para Meia-hora
    if ( this.dailySelected.daily && this.dailySelected.halfHour && this.daily ) {
        this.daily = false;
        this.dailySelected.daily = false;
    }

    // Ao mudar a opção de Meia-hora para Diariamente
    if ( this.dailySelected.daily && this.dailySelected.halfHour && this.halfHour ) {
      this.halfHour = false;
      this.dailySelected.halfHour = false;
    }

    this.daily = this.dailySelected.daily;
    this.halfHour = this.dailySelected.halfHour;

    // Limpa o campo intervalo de horas se a opção Diariamente ou Meia-hora for marcada
    if ( this.dailySelected.daily || this.dailySelected.halfHour ) {
      this.hours = null;
    }
  }

  setInterval( ) {
    if ( ( this.schedule.interval !== undefined ) && ( this.schedule.interval != null ) ) {

      if ( this.schedule.interval === 1440 ) {
        this.daily = true;
        this.dailySelected.daily = true;
      } else if ( this.schedule.interval === 30 ) {
        this.halfHour = true;
        this.dailySelected.halfHour = true;
      } else {
        this.hours = this.schedule.interval / 60;
      }
    }
  }

  validHour( ) {
    if ( ( this.hours !== undefined ) && ( this.hours != null ) ) {
      if ( ( this.hours < 1 ) || ( this.hours > 24 ) ) {
        this.hours = null;
        const thfNotification: PoNotification = {
          message: 'Intervalo de horas inválido!',
          orientation: PoToasterOrientation.Top
        };
        this.thfNotification.error( thfNotification );
      }
    }
  }

  getInterval() {
    // Calcula o intervalo de execução em minutos
    let interval: number;

    if ( ( this.dailySelected !== undefined ) && ( this.dailySelected.daily !== undefined ) && ( this.dailySelected.daily ) ) {
      interval = 1440;
    } else if ( ( this.dailySelected !== undefined ) && ( this.dailySelected.halfHour !== undefined ) && ( this.dailySelected.halfHour ) ) {
      interval = 30;
    } else if ( this.hours != null ) {
      interval = this.hours * 60;
    }

    return interval;
  }

  getColumnsSql(): Array<any> {
    return [
      { column: 'name', label: 'Nome', width: 80, required: true, editable: true  },
      { column: 'value', label: 'Valor', width: 180, required: false, editable: true },
      { column: 'type', label: 'Expressão SQL?', width: 30, checkbox: true }
    ];
  }

  getColumnsEtl(): Array<any> {
    return [
      { column: 'name', label: 'Nome', width: 80, required: true, editable: true  },
      { column: 'value', label: 'Valor', width: 180, required: true, editable: true }
    ];
  }

  backScheduleList( ) {
    this.router.navigate( [ '/schedule' ] );
  }

  private hasEmptyParams() {
    let strEmptyParams;
    const emptySqlParams = this.hasEmptySqlParams( );
    const emptyEtlParams = this.hasEmptyEtlParams( );

    if ( emptySqlParams[ 0 ] === true || emptyEtlParams[ 0 ] === true ) {
      // Remove o primeiro indice, boolean
      const filterEmptySqlParams = emptySqlParams.slice( 1, emptySqlParams.length );
      const filterEmptyEtlParams = emptyEtlParams.slice( 1, emptyEtlParams.length );

      // Concatena as duas listas para obter todos os parâmetros vazios
      const emptyParams = filterEmptySqlParams.concat( filterEmptyEtlParams );

      // Une todos os itens da lista com delimitador desejado
      strEmptyParams = emptyParams.join( ', ' );
    }

    return strEmptyParams;
  }

  private clearLastExec() {
    if ( ( this.oldStartDateTime !== undefined ) && ( this.schedule.startDateTime !== undefined ) ) {
      if ( this.oldStartDateTime !== this.schedule.startDateTime ) {
        this.schedule.lastExecution = undefined;
      }
    }
  }

  private invalidStartDateTime() {
    let invalid = false;
    invalid = ( this.schedule.interval !== undefined ) &&
              ( ( this.schedule.startDateTime === undefined ) || ( this.schedule.startDateTime.length < 16 ) );
    return invalid;
  }

  private hasEmptySqlParams() {
    const emptyValueList: Array < boolean | string > = [ false ];

    for ( let i = 0; i < this.schedule.sqlParams.length; i ++ ) {
      if ( ( ( this.schedule.sqlParams[i].value === undefined ) ) ||
           ( ( this.schedule.sqlParams[i].name === undefined ) || ( this.schedule.sqlParams[i].name.trim() === '' ) ) ) {
        emptyValueList[ 0 ] = true;
        emptyValueList.push( this.schedule.sqlParams[i].name );
      }
    }
    return emptyValueList;
  }

  private hasEmptyEtlParams() {
    const emptyValueList: Array < boolean | string > = [ false ];

    for ( let i = 0; i < this.schedule.etlParams.length; i ++ ) {
      if ( ( ( this.schedule.etlParams[i].value === undefined ) || ( this.schedule.etlParams[i].value.trim() === '' ) ) ||
           ( ( this.schedule.etlParams[i].name === undefined ) || ( this.schedule.etlParams[i].name.trim() === '' ) ) ) {
        emptyValueList[ 0 ] = true;
        emptyValueList.push( this.schedule.etlParams[i].name );
      }
    }
    return emptyValueList;
  }

  private getTypeProduct() {
    let typeProduct = '';

    if ( this.schedule.projectId ) {
      const index = this._listProjectType.findIndex( project => project.id === this.schedule.projectId );

      typeProduct = this._listProjectType[ index ].typeProduct;

      typeProduct = ( typeProduct === undefined ? 'P' : typeProduct );
    }
    return typeProduct;
  }

  private getLineProduct() {
    let lineProduct = 0;

    if ( this.schedule.projectId ) {
      const index = this._listProjectType.findIndex( project => project.id === this.schedule.projectId );

      lineProduct = this._listProjectType[ index ].lineProduct;

      lineProduct = ( lineProduct === undefined ? 1 : lineProduct );
    }
    return lineProduct;
  }

  private setDefaultValue( typeProduct, lyneProduct ) {
    this.schedule.sqlParams = [];
    if ( lyneProduct === 1 ) {
      if ( typeProduct === 'P' ) {
        this.setDefaultValueProtheus();
      } else if ( typeProduct === 'R' ) {
        this.setDefaultValueRM();
      } else if ( typeProduct === 'D' ) {
        this.setDefaultValueDatasul();
      }
    }
  }

  private privateSetCommonParams() {
    this.schedule.etlParams.push( { name: 'LOAD_MODE_FCT', value: 'FULL_LOAD' } );
    this.schedule.etlParams.push( { name: 'LOAD_MODE_DIM', value: 'FULL_LOAD' } );
  }

  private setDefaultValueProtheus() {
    this.schedule.sqlParams.push( { name: 'START_DATE', value: undefined, type: false } );
    this.schedule.sqlParams.push( { name: 'FINAL_DATE', value: undefined, type: false } );
    this.schedule.sqlParams.push( { name: 'EXTRACTION_DATE', value: undefined, type: false } );
  }

  private setDefaultValueRM() {
    this.schedule.sqlParams.push( { name: 'EXTRACAO_PERIODO_DATA_INICIAL', value: undefined, type: false } );
    this.schedule.sqlParams.push( { name: 'EXTRACAO_PERIODO_DATA_FINAL', value: undefined, type: false } );
    this.schedule.sqlParams.push( { name: 'GERAL_MATRIZ_TRADUCAO_ORG_EXT', value: 'EMS2', type: false } );
    this.schedule.sqlParams.push( { name: 'GERAL_INSTANCIA', value: 'R', type: false } );
    this.schedule.sqlParams.push( { name: 'MOEDA', value: 'R$', type: false } );
  }

  private setDefaultValueDatasul() {
    this.schedule.sqlParams.push( { name: 'GERAL_MATRIZ_TRADUCAO_ORG_EXT', value: 'EMS2', type: false } );
    this.schedule.sqlParams.push( { name: 'GERAL_INSTANCIA', value: '01', type: false } );
    // FATO MANUFATURA
    this.schedule.sqlParams.push( { name: 'PRODUCAO_REALIZADA_PERIODO_INICIAL', value: 'ADD_MONTHS(SYSDATE, -1)', type: true } );
    this.schedule.sqlParams.push( { name: 'PRODUCAO_REALIZADA_PERIODO_FINAL', value: 'SYSDATE', type: true } );
    // FATO COMERCIAL
    this.schedule.sqlParams.push( { name: 'FATURAMENTO_PERIODO_INICIAL', value: 'ADD_MONTHS(SYSDATE, -1)', type: true } );
    this.schedule.sqlParams.push( { name: 'FATURAMENTO_PERIODO_FINAL', value: 'SYSDATE', type: true } );
    this.schedule.sqlParams.push( { name: 'PEDIDO_PERIODO_INICIAL', value: 'ADD_MONTHS(SYSDATE, -1)', type: true } );
    this.schedule.sqlParams.push( { name: 'PEDIDO_PERIODO_FINAL', value: 'ADD_MONTHS(SYSDATE, -1)', type: true } );
    this.schedule.sqlParams.push( { name: 'DEVOLUCAO_PERIODO_INICIAL', value: 'ADD_MONTHS(SYSDATE, -1)', type: true } );
    this.schedule.sqlParams.push( { name: 'DEVOLUCAO_PERIODO_FINAL', value: 'SYSDATE', type: true } );
    // FATO FINANCEIRO
    this.schedule.sqlParams.push( { name: 'CONTAS_PAGAR_PERIODO_INICIAL', value: 'ADD_MONTHS(SYSDATE, -1)', type: true } );
    this.schedule.sqlParams.push( { name: 'CONTAS_PAGAR_PERIODO_FINAL', value: 'ADD_MONTHS(SYSDATE, +1)', type: true } );
    this.schedule.sqlParams.push( { name: 'CONTAS_RECEBER_PERIODO_INICIAL', value: 'ADD_MONTHS(SYSDATE, -1)', type: true } );
    this.schedule.sqlParams.push( { name: 'CONTAS_RECEBER_PERIODO_FINAL', value: 'ADD_MONTHS(SYSDATE, +1)', type: true } );
    // FATO CONTROLADORIA
    this.schedule.sqlParams.push( { name: 'CONTABILIDADE_PERIODO_INICIAL', value: 'ADD_MONTHS(SYSDATE, -1)', type: true } );
    this.schedule.sqlParams.push( { name: 'CONTABILIDADE_PERIODO_FINAL', value: 'SYSDATE', type: true } );
    this.schedule.sqlParams.push( { name: 'CONTABILIDADE_CODIGO_CENARIO_CONTABIL', value: 'FISCAL', type: false } );
    this.schedule.sqlParams.push( { name: 'ORCAMENTO_PERIODO_INICIAL', value: 'ADD_MONTHS(SYSDATE, +1)', type: true } );
    this.schedule.sqlParams.push( { name: 'ORCAMENTO_PERIODO_FINAL', value: 'SYSDATE', type: true } );
    this.schedule.sqlParams.push( { name: 'ORCAMENTO_CODIGO_CENARIO_CONTABIL', value: '', type: false } );
    this.schedule.sqlParams.push( { name: 'ORCAMENTO_CODIGO_CENARIO_ORCAMENTARIO', value: '', type: false } );
    this.schedule.sqlParams.push( { name: 'ORCAMENTO_CODIGO_UNIDADE_ORCAMENTARIA', value: '', type: false } );
    this.schedule.sqlParams.push( { name: 'ORCAMENTO_CODIGO_SEQUENCIA_ORCAMENTARIA', value: '0', type: false } );

    if ( this.dbSource.indexOf( 'oracle' ) === -1 ) {
      this.setDefaultValueDatasulProgress();
    }
  }

  private setDefaultValueDatasulProgress() {
    this.schedule.sqlParams.push( { name: 'MGADM', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGDIS', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGFIS', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGFRO', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGIND', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGINV', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGMFG', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGMNT', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGMRP', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGSCM', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MGUNI', value: 'EMS2CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MOVADM', value: 'EMS2MOV', type: false } );
    this.schedule.sqlParams.push( { name: 'MOVDIS', value: 'EMS2MOV', type: false } );
    this.schedule.sqlParams.push( { name: 'MOVFIS', value: 'EMS2MOV', type: false } );
    this.schedule.sqlParams.push( { name: 'MOVFRO', value: 'EMS2MOV', type: false } );
    this.schedule.sqlParams.push( { name: 'MOVIND', value: 'EMS2MOV', type: false } );
    this.schedule.sqlParams.push( { name: 'MOVMFG', value: 'EMS2MOV', type: false } );
    this.schedule.sqlParams.push( { name: 'MOVMNT', value: 'EMS2MOV', type: false } );
    this.schedule.sqlParams.push( { name: 'EMSBAS', value: 'EMS5CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'EMSFIN', value: 'EMS5CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'EMSUNI', value: 'EMS5CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'EMSVEN', value: 'EMS5CAD', type: false } );
    this.schedule.sqlParams.push( { name: 'MOVFIN', value: 'EMS5MOV', type: false } );
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

  setDbSource() {
    if ( this.schedule.projectId ) {
      this._projectService.getProjectDataBase( this.schedule.projectId ).subscribe( data => {
        this.dbSource = data.dataBase.jdbc_driver;
        this.getDataItems();
      });
    }

  }

  private getDataItems() {

    const typeProduct = this.getTypeProduct();
    const lyneProduct = this.getLineProduct();

    this.setDefaultValue( typeProduct, lyneProduct );

    if ( lyneProduct === 1 ) {
      if ( typeProduct === 'P' ) {
        this.setSQLParamsProtheus();
      } else if ( typeProduct === 'R' ) {
        this.setSQLParamsRM();
      } else if ( typeProduct === 'D' ) {
        this.setSQLParamsDatasul();
      }
    }

  }

  private setSQLParamsRM() {
    const sqlParamsList = this.schedule.sqlParams;

    // Obtem o índice do parâmetro
    const iStartDate = sqlParamsList.findIndex( k => k.name === 'EXTRACAO_PERIODO_DATA_INICIAL' );
    const iFinalDate = sqlParamsList.findIndex( k => k.name === 'EXTRACAO_PERIODO_DATA_FINAL' );

    // Altera os valores dos parâmetros conforme a Base de Dados selecionada
    if ( ( this.dbSource.indexOf( 'sqlserver' ) !== -1 ) || ( this.dbSource.indexOf( 'oracle' ) !== -1 ) ) {
      this.schedule.sqlParams[iStartDate].type = true;
      this.schedule.sqlParams[iFinalDate].type = true;
    }

    if ( this.dbSource.indexOf( 'sqlserver' ) !== -1 ) {
      this.schedule.sqlParams[iStartDate].value = 'CONVERT(VARCHAR,DATEADD(mm,DATEDIFF(mm,0,GETDATE()),0),112)';
      this.schedule.sqlParams[iFinalDate].value = 'CONVERT(VARCHAR,DATEADD(dd,-1,DATEADD(mm,DATEDIFF(mm,0,GETDATE())+ 1,0)),112)';
    } else if ( this.dbSource.indexOf( 'oracle' ) !== -1 ) {
      this.schedule.sqlParams[iStartDate].value = 'TO_CHAR(TRUNC(SYSDATE,\'MON\'),\'YYYYMMDD\')';
      this.schedule.sqlParams[iFinalDate].value = 'TO_CHAR(LAST_DAY(SYSDATE),\'YYYYMMDD\')';
    } else {
      this.schedule.sqlParams[iStartDate].value = undefined ;
      this.schedule.sqlParams[iFinalDate].value = undefined ;
    }
  }

  private setSQLParamsDatasul() {
  }

  private setSQLParamsProtheus() {
    const sqlParamsList = this.schedule.sqlParams;

    // Obtem o índice do parâmetro
    const iStartDate = sqlParamsList.findIndex( k => k.name === 'START_DATE' );
    const iFinalDate = sqlParamsList.findIndex( k => k.name === 'FINAL_DATE' );
    const iExtractDate = sqlParamsList.findIndex( k => k.name === 'EXTRACTION_DATE' );

    // Altera os valores dos parâmetros conforme a Base de Dados selecionada
    if ( ( this.dbSource.indexOf( 'sqlserver' ) !== -1 ) || ( this.dbSource.indexOf( 'oracle' ) !== -1 ) ) {
      this.schedule.sqlParams[iStartDate].type = true;
      this.schedule.sqlParams[iFinalDate].type = true;
      this.schedule.sqlParams[iExtractDate].type = true;
    }

    if ( this.dbSource.indexOf( 'sqlserver' ) !== -1 ) {
      this.schedule.sqlParams[iStartDate].value = 'CONVERT(VARCHAR,DATEADD(mm,DATEDIFF(mm,0,GETDATE()),0),112)';
      this.schedule.sqlParams[iFinalDate].value = 'CONVERT(VARCHAR,DATEADD(dd,-1,DATEADD(mm,DATEDIFF(mm,0,GETDATE())+ 1,0)),112)';
      this.schedule.sqlParams[iExtractDate].value = 'CONVERT(char(8), GetDate(),112)';
    } else if ( this.dbSource.indexOf( 'oracle' ) !== -1 ) {
      this.schedule.sqlParams[iStartDate].value = 'TO_CHAR(TRUNC(SYSDATE,\'MON\'),\'YYYYMMDD\')';
      this.schedule.sqlParams[iFinalDate].value = 'TO_CHAR(LAST_DAY(SYSDATE),\'YYYYMMDD\')';
      this.schedule.sqlParams[iExtractDate].value = 'TO_CHAR((SYSDATE),\'YYYYMMDD\')';
    } else {
      this.schedule.sqlParams[iStartDate].value = undefined ;
      this.schedule.sqlParams[iFinalDate].value = undefined ;
      this.schedule.sqlParams[iExtractDate].value = undefined ;
    }
  }

  showModalSqlParams() {
    this.modalSqlParams.open();
  }

}
