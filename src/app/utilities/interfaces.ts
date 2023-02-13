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

export class Project {
  id: string;
  title: string;
  contract: string;
  gdc_etl_graph: string;
  gdc_etl_process_url: string;
  gdc_username: string;
  gdc_password: string;
  gdc_projectId: string;
  gdc_upload_url: string;
  gdc_upload_archive: string;
  gdc_prefix: string;
  gdc_query_folder: string;
  gdc_tsa: boolean;
  gdc_unlock: boolean;
  filesystem_input_dir: string;
  filesystem_wildcard: string;
  javaConfigurationId: string;
  lineProduct: number;
  pathMyProperties: string;
  dataBaseId: string;
  typeProduct: string;
  gdc_script_folder: string;
  constructor() {
    this.lineProduct = null;
    this.dataBaseId = null;
    this.typeProduct = null;
  }
}

export class DataBase {
  id: string;
  name: string;
  jdbc_username: string;
  jdbc_password: string;
  jdbc_driver: string;
  jdbc_driver_path: string;
  jdbc_url: string;
  jdbc_oracle_current_schema: string;
  constructor() {
    this.name = null;
    this.jdbc_username = null;
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