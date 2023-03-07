import { Observable } from 'rxjs';

export class Query {
  dirPath: string;
  fileName: string;
  type: string;
  recurrence: string;
  projectName: string;
  projectId: string;
  query: string;
}

export class DatabaseData {
  projects: Project[];
  dataBases: DataBase[];
  javaConfigurations: Java[];
  schedules: Schedule[];
  configurations: Configuration[];
}

export class GDProject {
  id: string;
  name: string;
  description: string;
  ob_processes: Observable<GDProcess[]>;
  processes: GDProcess[];
}

export class GDProcess {
  id: string;
  url: string;
  name: string;
  graphs: string[];
  type: string;
}

export class Project {
  id: string;
  modalidade: string;
  codigot: string;
  erp: string;
  modulo: string;
  origem: string;
  environment: string;
  gdc_username: string;
  gdc_password: string;
  dataBaseId: string;
  javaConfigurationId: string;
  filesystem_input_dir: string;
  filesystem_wildcard: string;
  gdc_upload_archive: string;
  gdc_archive_extension: string;
  gdc_query_folder: string;
  gdc_script_folder: string;
  gdc_etl_graph: string;
  gdc_etl_process_url: string;
  gdc_projectId: string;
  gdc_upload_url: string;
  gdc_prefix: string;
  gdc_tsa: boolean;
  gdc_unlock: boolean;
  contract: string;
  lineProduct: number;
  title: string;
  typeProduct: string;
  pathMyProperties: string;
  
  constructor() {
    this.id = null;
    this.modalidade = null;
    this.codigot = null;
    this.erp = null;
    this.modulo = null;
    this.origem = null;
    this.environment = null;
    this.gdc_username = null;
    this.gdc_password = null;
    this.gdc_projectId = null;
    this.gdc_upload_url = null;
    this.gdc_upload_archive = null;
    this.gdc_archive_extension = null;
  }
}

export class DataBase {
  id: string;
  name: string;
  jdbc_type: string;
  jdbc_username: string;
  jdbc_password: string;
  jdbc_driver: string;
  jdbc_driver_path: string;
  
  jdbc_url: string;
  jdbc_oracle_current_schema: string;
  constructor() {
    this.name = null;
    this.jdbc_username = null;
    this.jdbc_type = null;
    this.jdbc_password = null;
    this.jdbc_driver = null;
    this.jdbc_driver_path = null;
    this.jdbc_url = null;
  }
}

export class Parameter {
  value: string;
}

export class Java {
  id: string;
  name: string;
  params: Array<Parameter>;
  constructor() {
    this.name = null;
    this.params = null;
  }
}

export class ETLParameters {
  name: string;
  value: string;
}

export class SQLParameters {
  name: string;
  value: string;
  type: boolean;
}

export class Schedule {
  id: string;
  name: string;
  projectId: string;
  interval: number;
  lastExecution: string;
  startDateTime: string;
  sqlParams: Array<SQLParameters>;
  etlParams: Array<ETLParameters>;
  constructor() {
    this.name = null;
    this.projectId = null;
  }
}

export class Configuration {
  id: string;
  showQuery: boolean;
  intervalExecutionServer: number;
  serverPort: string;
  constructor() {
    this.showQuery = false;
  }
}