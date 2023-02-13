import { Component, OnInit, ViewChild } from '@angular/core';

import { Router } from '@angular/router';

import { ElectronService } from 'ngx-electronyzer';
import { PoButtonGroupItem } from '@po-ui/ng-components';
import { PoModalAction, PoModalComponent } from '@po-ui/ng-components';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

import { ScheduleService } from '../service/schedule.service';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  @ViewChild(PoModalComponent) modal: PoModalComponent;

  public scheduleList: any[];
  public scheduleToDelete: string;
  public modalTitle: string;
  public statusService: string;

  private isRemovingService: boolean;

  // Array para eventos editar/excluir/exportar/excutar.
  eventsObject: Array<any> = [ { label: 'Editar',  function: 'editSchedule', url: 'data-base-add' },
                               { label: 'Excluir', function: 'deleteSchedule' },
                               { label: 'Executar Agent', function: 'runAgent' }];

  actions: Array<{}> = [
    { label: 'Novo', icon: 'po-icon po-icon-plus', url: 'schedule-add' }
  ];

  agentAction: Array<PoButtonGroupItem> = [
    { label: 'Iniciar Serviço', action: this.agentStart },
    { label: 'Remover Serviço', action: this.removeService }
  ];

  constructor( private _scheduleService: ScheduleService, private _router: Router,
               private _thfNotification: PoNotificationService,
               private _electronService: ElectronService ) {

    this.scheduleList = [];
  }

  close: PoModalAction = {
    action: () => {
      this.modal.close();
    },
    label: 'Cancelar'
  };

  confirm: PoModalAction = {
    action: () => {
      if ( this.isRemovingService ) {
        this.agentUninstall();
      } else {
        this.delete();
      }
    },
    label: 'Confirmar'
  };

  ngOnInit() {
    this.getScheduleList();
    this.getStatusService();
  }

  getScheduleList(): any {
    this._scheduleService.getScheduleProjectList().subscribe( schedule => {
      this.scheduleList = schedule;
    });
  }

  editSchedule( index: string ) {
    this._router.navigate( [ '/schedule-add', index ] );
  }

  deleteSchedule( index: string ) {
    this.scheduleToDelete = index;
    this.isRemovingService = false;
    this.modalTitle = 'Deseja realmente excluir o agendamento?';
    this.modal.open();
  }

  delete() {
    this._scheduleService.deleteSchedule( this.scheduleToDelete )
    .subscribe( ( ) => {
      this.getScheduleList();
      this.modal.close();
    }, ( error ) => {
      console.log( error );
      this.modal.close();
    });
  }

  agentStart() {
    if ( this._electronService.isElectronApp ) {
      const startAgent = this._electronService.ipcRenderer.sendSync( 'startAgent' );

      if ( startAgent ) {
        const thfNotification: PoNotification = { message: 'Serviço do Agent iniciado!', orientation: PoToasterOrientation.Top };
        this._thfNotification.success( thfNotification );
      } else {
        const thfNotification: PoNotification = { message: 'Serviço do Agent não iniciado!', orientation: PoToasterOrientation.Top };
        this._thfNotification.error( thfNotification );
      }
      this.getStatusService();
    }
  }

  removeService() {
    this.isRemovingService = true;
    this.modalTitle = 'Deseja realmente remover o serviço do Agent?';
    this.modal.open();
  }

  agentUninstall() {
    if ( this._electronService.isElectronApp ) {
      const uninstallAgent = this._electronService.ipcRenderer.sendSync( 'uninstallAgent' );

      if ( uninstallAgent ) {
        const thfNotification: PoNotification = { message: 'Serviço do Agent removido!', orientation: PoToasterOrientation.Top };
        this._thfNotification.warning( thfNotification );
        this.modal.close();
      } else {
        const thfNotification: PoNotification = { message: 'Não foi possível remover o Serviço!', orientation: PoToasterOrientation.Top };
        this._thfNotification.error( thfNotification );
      }
      this.getStatusService();
    }
  }

  runAgent( scheduleId: string ) {

    if ( this._electronService.isElectronApp ) {
      this._scheduleService.projectBySchedule( scheduleId )
        .subscribe( ( res ) => {
          const project = res;
          if ( this._electronService.ipcRenderer
            .sendSync( 'runAgent', scheduleId, project.project.javaConfigurationId, project.project.lineProduct ) ) {

            const thfNotification: PoNotification = {
              message: 'Projeto em execução...mais detalhes acessar o menu Monitor',
              orientation: PoToasterOrientation.Top
            };
            this._thfNotification.success( thfNotification );

          } else {

            const thfNotification: PoNotification = {
              message: 'Houve um erro ao executar o projeto',
              orientation: PoToasterOrientation.Top
            };
            this._thfNotification.error( thfNotification );
          }
        } );
    }
  }

  getStatusService() {
    if ( this._electronService.isElectronApp ) {
      this.statusService = this._electronService.ipcRenderer.sendSync( 'getStatusService' );
    }
  }

}
