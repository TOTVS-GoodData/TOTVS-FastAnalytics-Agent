import { Component, OnInit, ViewChild } from '@angular/core';

import { Router } from '@angular/router';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';
import { PoModalAction, PoModalComponent } from '@po-ui/ng-components';

import { DataBase } from '../utilities/interfaces';
import { DataBaseService } from '../service/data-base.service';

@Component({
  selector: 'app-data-base',
  templateUrl: './data-base.component.html',
  styleUrls: ['./data-base.component.css']
})

export class DataBaseComponent implements OnInit {

  @ViewChild(PoModalComponent) modal: PoModalComponent;

  public dataBaseList: DataBase[];
  public dataBaseToDelete: string;

  // Array para eventos editar/excluir/exportar/excutar.
  eventsObject: Array<any> = [ { label: 'Editar',  function: 'editDataBase', url: 'data-base-add' },
                               { label: 'Excluir', function: 'delete' } ];

  // Array para adicionar novo projeto.
  actions: Array<{}> = [
    { label: 'Novo', icon: 'po-icon po-icon-plus', url: 'data-base-add' }
  ];

  constructor(  private _dataBaseService: DataBaseService,
                private _router: Router,
                private _thfNotification: PoNotificationService ) {
    this.dataBaseList = [];
  }

  close: PoModalAction = {
    action: () => {
      this.modal.close();
    },
    label: 'Cancelar'
  };

  confirm: PoModalAction = {
    action: () => {
      this.deleteDataBase( this.dataBaseToDelete );
    },
    label: 'Confirmar'
  };

  ngOnInit () {
    this.getDataBaseList();
  }

  getDataBaseList() {
    this._dataBaseService.getDataBaseList().subscribe( dataBases => {
        this.dataBaseList = dataBases;
    });
  }

  editDataBase( index: string ) {
    this._router.navigate( [ '/data-base-add', index ] );
  }

  delete( index: string ) {
    this.dataBaseToDelete = index;
    this.modal.open();
  }

  deleteDataBase( idDataBase: string ) {
    this._dataBaseService.projectsByDataBase( idDataBase )
      .subscribe( ( res ) => {
        if ( res.length === 0 ) {
          this._dataBaseService.deleteDataBase( idDataBase )
          .subscribe( () => {
            this.modal.close();
            this.getDataBaseList();
          }, error => {
            console.error( error );
            this.modal.close();
          } );
        } else {
          const thfNotification: PoNotification = {
            message: 'Não foi possível excluir, pois existem projetos vinculados ao Banco de Dados',
            orientation: PoToasterOrientation.Top };
          this._thfNotification.error( thfNotification );
          this.modal.close();
        }
        this.modal.close();
      }, error => {
        console.error( error );
        this.modal.close();
      } );
  }

}
