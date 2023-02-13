import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PoNotificationService } from '@po-ui/ng-components';
import { PoNotification, PoToasterOrientation } from '@po-ui/ng-components';
import { PoSelectOption } from '@po-ui/ng-components';
import { ElectronService } from 'ngx-electronyzer';

import { DataBase } from '../utilities/interfaces';
import { DataBaseService } from '../service/data-base.service';

@Component({
  selector: 'app-data-base-add',
  templateUrl: './data-base-add.component.html',
  styleUrls: ['./data-base-add.component.css']
})
export class DataBaseAddComponent {

  @Input() modal: boolean;
  @Output() closeModal = new EventEmitter<string>();

  public dataBase: DataBase = new DataBase();
  public operation: string;

  public dbSource = '';

  public readonly jdbcSources: Array<PoSelectOption> = [
    { label: 'SQL Server', value: 'SQL Server'},
    { label: 'Oracle', value: 'Oracle'},
    { label: 'Outros', value: 'Outros' }
  ];

  constructor( private _dataBaseService: DataBaseService, private router: Router,
    private activatedRoute: ActivatedRoute, private thfNotification: PoNotificationService,
    private _electronService: ElectronService  ) {

    this.activatedRoute.params.subscribe( params => {
      const idDataBase = params[ 'id' ];

      if ( idDataBase ) {
        this.operation = 'Alterar Banco de Dados';
        this._dataBaseService.getDataBase( idDataBase )
            .subscribe( ( dataBase ) => {
                  this.editDataBase( dataBase );
                }, erro => console.log( erro ) );
      } else {
        this.insertDataBase();
      }
    });
  }

  insertDataBase() {
    this.operation = 'Cadastrar Banco de Dados';
  }

  editDataBase( dataBase: DataBase ) {
    this.dataBase = dataBase;
    this.dataBase.jdbc_password = this._electronService.ipcRenderer.sendSync( 'decrypt', this.dataBase.jdbc_password );
    this.setjdbcSource();
  }

  enableJDBCOptions( db: string ) {
    const jdbcPath = this._electronService.ipcRenderer.sendSync( 'getJdbcPath' );

    this.dbSource = db;

    if ( this.dbSource === 'SQL Server' ) {
      this.dataBase.jdbc_driver = 'com.microsoft.sqlserver.jdbc.SQLServerDriver';
      this.dataBase.jdbc_oracle_current_schema = '';
      this.dataBase.jdbc_driver_path = jdbcPath.concat( 'sqljdbc4.jar' );
      this.dataBase.jdbc_url = 'jdbc:sqlserver://LOCALHOST;DatabaseName=DATABASE';
    }

    if ( this.dbSource === 'Oracle' ) {
      this.dataBase.jdbc_driver = 'oracle.jdbc.driver.OracleDriver';
      this.dataBase.jdbc_driver_path = jdbcPath.concat( 'ojdbc7.jar' );
      this.dataBase.jdbc_url = 'jdbc:oracle:thin:@LOCALHOST:1521:SID';
    }

    if ( this.dbSource === 'Outros' ) {
      this.dataBase.jdbc_driver = '';
      this.dataBase.jdbc_driver_path = '';
      this.dataBase.jdbc_oracle_current_schema = '';
      this.dataBase.jdbc_url = '';
    }

  }

  setjdbcSource( ) {
    if ( this.dataBase.jdbc_driver === 'com.microsoft.sqlserver.jdbc.SQLServerDriver' ) {
      this.dbSource = 'SQL Server';

    } else if ( this.dataBase.jdbc_driver === 'oracle.jdbc.driver.OracleDriver' ) {
      this.dbSource = 'Oracle';
    } else {
      this.dbSource = 'Outros';
    }
  }

  backDataBaseList( ) {
    if ( this.modal ) {
      this.closeModal.emit();
    } else {
      this.router.navigate( [ '/data-base' ] );
    }
  }

  saveDataBase( event ) {

    event.preventDefault( );

    if ( this.validDataBase() ) {
      this.dataBase.jdbc_password = this._electronService.ipcRenderer.sendSync( 'encrypt', this.dataBase.jdbc_password );
      this._dataBaseService
          .saveDataBase( this.dataBase )
          .subscribe( () => {
            this.backDataBaseList();
          }, error => {
            console.log( error );
          } );
    }
  }

  validDataBase( ) {
    let valid = true;

    if ( ( this.dataBase.jdbc_driver_path === undefined ) || ( this.dataBase.jdbc_driver_path === '' ) ||
         ( this.dataBase.jdbc_driver === undefined ) || ( this.dataBase.jdbc_driver === '' ) ||
         ( this.dataBase.jdbc_url === undefined ) || ( this.dataBase.jdbc_url === '' ) ||
         ( this.dataBase.jdbc_username === undefined ) || ( this.dataBase.jdbc_username === '' ) ||
         ( this.dataBase.jdbc_password === undefined ) || ( this.dataBase.jdbc_password === '' ) ) {
      const thfNotification: PoNotification = { message: 'Preencher todos os campos de conexão!', orientation: PoToasterOrientation.Top };
      this.thfNotification.error( thfNotification );
      valid = false;
    }

    return valid;
  }

  testDataBaseConnection() {
    if ( this.validDataBase() ) {
      let isSuccessful = false;

      isSuccessful = this._electronService.ipcRenderer.sendSync( 'testDataBaseConnection',
                      this.dataBase.jdbc_driver_path, this.dataBase.jdbc_driver, this.dataBase.jdbc_url,
                      this.dataBase.jdbc_username, this.dataBase.jdbc_password );
      if ( isSuccessful ) {
        const thfNotification: PoNotification = { message: 'Conexão efetuada com sucesso!', orientation: PoToasterOrientation.Top };
        this.thfNotification.success( thfNotification );
      } else {
        const thfNotification: PoNotification = { message: 'Fallha ao conectar!', orientation: PoToasterOrientation.Top };
        this.thfNotification.error( thfNotification );
      }
    }
  }

}
