import { Component, ViewChild, OnInit } from '@angular/core';

import { PoModalComponent } from '@po-ui/ng-components';
import { PoTableColumn, PoTableAction } from '@po-ui/ng-components';
import { PoModalAction } from '@po-ui/ng-components';
import { ElectronService } from 'ngx-electronyzer';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

import { MonitorService } from '../service/monitor.service';
import { Monitor } from './monitor';
import { MonitorMessage } from './monitor.message';

@Component({
    selector: 'app-monitor',
    templateUrl: './monitor.component.html',
    styleUrls: ['./monitor.component.css']
})

export class MonitorComponent implements OnInit {

  @ViewChild('modalExecution') modalExecution: PoModalComponent;
  @ViewChild('modalCancel') modalCancel: PoModalComponent;

  public details: Monitor;
  public columnsExecutions: Array<PoTableColumn> = this.getColumnsExecutions();
  public dataExecutions: Array<Monitor>;
  public columnsDetails: Array<PoTableColumn> = this.getColumnsDetails();
  public localDetails: Array<MonitorMessage>;
  public goodDataDetails: Array<MonitorMessage>;
  public showModalMonitor = false;
  public interval: any;

  private idExecutionCancel: string;

  actionExecutions: Array<PoTableAction> = [
    { action: this.showdetails.bind(this), icon: 'po-icon-info', label: 'Detalhes' }
  ];

  closeModalCancel: PoModalAction = {
    action: () => {
      this.modalCancel.close();
    },
    label: 'Cancelar'
  };

  confirmModalCancel: PoModalAction = {
    action: () => {
      this.setStatusExecution( this.idExecutionCancel, 'C' );
    },
    label: 'Confirmar'
  };

  constructor( public _monitorService: MonitorService,
               private _electronService: ElectronService,
               private thfNotification: PoNotificationService ) {
  }

  ngOnInit() {
    this.dataExecutions = this._monitorService.getMonitorLog();

    this.interval = setInterval( () => {
      this.dataExecutions = [];
      this.dataExecutions = this._monitorService.getMonitorLog();
    }, 60000 * 5 );
  }

  showdetails( execution: Monitor ) {
    this.details = execution;
    this.localDetails = this.getLocalDetails();
    this.goodDataDetails = this.getGoodDataDetails();
    this.modalExecution.open();
  }

  getColumnsExecutions(): Array<PoTableColumn> {
    return [
      { property: 'status', type: 'subtitle', width: '5%', subtitles: [
        { value: 'OK', color: 'success', label: 'Finalizado', content: ''},
        { value: undefined, color: 'warning', label: 'Em execução', content: ''},
        { value: 'ERROR', color: 'danger', label: 'Erro' , content: ''},
        { value: 'C', color: 'color-12', label: 'Cancelado' , content: ''}
      ]},
      { property: 'project', label: 'Projeto' , width: '150px' },
      { property: 'start', label: 'Início', width: '150px' },
      { property: 'finish', label: 'Fim', width: '150px' },
      { property: 'duration', label: 'Tempo de Execução', width: '150px' },
      { property: 'typeExecution', label: 'Tipo', width: '50px' },
      { property: 'action', label: ' ', type: 'icon', action: this.cancelExecution.bind( this ) }
    ];
  }

  cancelExecution( execution: Monitor ) {
    this.idExecutionCancel = execution.idExecution;
    this.modalCancel.open();
  }

  getColumnsDetails(): Array<PoTableColumn> {
    return [
      { property: 'level', label: 'Tipo', width: '120px' },
      { property: 'timeStamp', label: 'Horário', width: '180px' },
      { property: 'file', label: 'Arquivo', width: '240px' },
      { property: 'line', label: 'Linha', width: '100px'  },
      { property: 'message', label: 'Mensagem', width: '700px' }
    ];
  }

  getLocalDetails(): Array<MonitorMessage> {
    return this.details.serverLocal ;
  }

  getGoodDataDetails(): Array<MonitorMessage> {
    return this.details.serverGoodData ;
  }

  setStatusExecution( idExecutionCancel: string, status: string ) {
    const changeStatus = this._electronService.ipcRenderer.sendSync( 'setStatusExecution', idExecutionCancel, status );
    this.modalCancel.close();

    if ( changeStatus )  {
      this.dataExecutions = [];
      this.dataExecutions = this._monitorService.getMonitorLog();
    } else {
      const thfNotification: PoNotification = {
        message: 'Houve um erro ao tentar cancelar o status da execução',
        orientation: PoToasterOrientation.Top
      };
      this.thfNotification.error( thfNotification );
    }
  }

}
