import { Component, ViewChild, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';

import { Java } from '../utilities/interfaces';
import { JavaService } from '../service/java.service';

@Component({
  selector: 'app-java-add',
  templateUrl: './java-add.component.html',
  styleUrls: ['./java-add.component.css']
})
export class JavaAddComponent implements OnInit {

  @Input() modal: boolean;
  @Output() closeModal = new EventEmitter<string>();

  @ViewChild( 'javaParams', { read: ElementRef } ) javaParams: any;

  public java: Java = new Java();
  public columnsParams: Array<any> =  this.getColumns();
  public javaConfigurations: Array<Java>;
  public operation: string;

  constructor( private router: Router, private activatedRoute: ActivatedRoute,
    private _javaService: JavaService, private _thfNotification: PoNotificationService ) {

      this.java.params = [];
      this.activatedRoute.params.subscribe( params => {
        const idJava = params[ 'id' ];

        if ( idJava ) {
          this.operation = 'Alterar Configuração Java';
          this._javaService.getJavaConfiguration( idJava )
              .subscribe( ( java ) => {
                  this.editJava( java );
                  }, erro => console.log( erro ) );
        } else {
          this.insertJava();
        }
      });
  }

  insertJava() {
    this.operation = 'Cadastrar Configuração Java';
  }

  editJava( java: Java ) {
    this.java = java;
 }

  ngOnInit() {
    this.getJavaConfigurations();
  }

  getColumns(): Array<any> {
    return [ { column: 'value', label: 'Parâmetro', width: 260, required: true, editable: true } ];
  }

  backJavaList( ) {
    if ( this.modal ) {
      this.closeModal.emit();
    } else {
      this.router.navigate( [ '/java' ] );
    }
  }

  private getJavaConfigurations() {
    this._javaService.getJavaConfigurations().subscribe( javas => {
        this.javaConfigurations = javas as Java[];
    });
  }

  focusParams() {
    this.javaParams.nativeElement.click();
  }

  saveJavaConfiguration( ) {
    if ( this.javaValid() ) {
      this._javaService.saveJavaConfiguration( this.java )
      .subscribe( () => {
        this.backJavaList();
      }, error => {
        console.error( error );
        this.backJavaList();
      } );
    }
  }

  private javaValid() {
    let isValid = true;

    if ( this.hasEmptyParams() ) {
      const thfNotification: PoNotification = {
        message: 'Informar os parâmetros da configuração!', orientation: PoToasterOrientation.Top };
      this._thfNotification.error( thfNotification );
      isValid = false;
    } else if ( ( this.java.name === undefined ) || ( this.java.name === '' ) ) {
      const thfNotification: PoNotification = {
        message: 'Preencher nome da configuração!', orientation: PoToasterOrientation.Top };
      this._thfNotification.error( thfNotification );
      isValid = false;
    }
    return isValid;
  }

  private hasEmptyParams() {
    let emptyValue = false;

    this.focusParams();

    // Testa se nûÈo hûÀ parûÂmetros cadastrados
    emptyValue = ( this.java.params.length === 0 );

    // Testa se os parûÂmetros estûÈo preenchidos
    if ( ! emptyValue ) {
      for ( let i = 0; i < this.java.params.length; i ++ ) {
        if ( ( this.java.params[i].value === undefined ) || ( this.java.params[i].value.trim() === '' ) ) {
          emptyValue = true;
          break;
        }
      }
    }
    return emptyValue;
  }

}
