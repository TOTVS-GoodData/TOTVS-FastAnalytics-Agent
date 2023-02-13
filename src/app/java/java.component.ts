import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { PoModalAction, PoModalComponent } from '@po-ui/ng-components';
import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

import { Java } from '../utilities/interfaces';
import { JavaService } from '../service/java.service';

@Component({
  selector: 'app-java',
  templateUrl: './java.component.html',
  styleUrls: ['./java.component.css']
})

export class JavaComponent implements OnInit {

  @ViewChild(PoModalComponent) modal: PoModalComponent;

  public java: Java = new Java();
  public javaConfigurations: Java[];
  private javaDelete: string;

  eventsObject: Array<any> = [ { label: 'Editar',  function: 'editJava', url: 'java-add' },
                               { label: 'Excluir', function: 'delete' } ];

  actions: Array<{}> = [
    { label: 'Nova', icon: 'po-icon po-icon-plus', url: 'java-add' }
  ];

  close: PoModalAction = {
    action: () => {
      this.modal.close();
    },
    label: 'Cancelar'
  };

  confirm: PoModalAction = {
    action: () => {
      this.deleteJava( this.javaDelete );
    },
    label: 'Confirmar'
  };

  constructor( private _javaService: JavaService,
    private _router: Router,
    private _thfNotification: PoNotificationService ) {
      this.java.params = [];
  }

  ngOnInit() {
    this.getJavaConfigurations();
  }

  private getJavaConfigurations() {
    this._javaService.getJavaConfigurations().subscribe( javas => {
        this.javaConfigurations = javas as Java[];
    });
  }

  editJava( index: string ) {
   this._router.navigate( [ '/java-add', index ] );
  }

  delete( index: string ) {
    this.javaDelete = index;
    this.modal.open();
  }

  deleteJava( index: string ) {
    this._javaService.projectsByJava( index )
      .subscribe( ( res ) => {
        if ( this.canDelete( res, index ) ) {
          this._javaService.deleteJavaConfiguration( index )
          .subscribe( () => {
            this.modal.close();
            this.getJavaConfigurations();
          }, error => {
            console.error( error );
            this.modal.close();
          } );
        } else {
          const thfNotification: PoNotification = {
            message: 'Não foi possível excluir, pois existem projetos vinculados na configuração', orientation: PoToasterOrientation.Top };
          this._thfNotification.error( thfNotification );
          this.modal.close();
        }
        this.modal.close();
      }, error => {
        console.error( error );
        this.modal.close();
      } );
  }

  private canDelete( projects: any, javaId: string ) {
    let okDelete = true;

    for ( let i = 0; i < projects.length; i ++ ) {
      if ( projects[i].javaConfigurationId === javaId ) {
        okDelete = false;
      }
    }

    return okDelete;
  }
}
