const { app, BrowserWindow, ipcMain } = require( 'electron' )
const server =  require( './server' );
const agent =  require( './execute' );
const path =  require( 'path' );
const functions =  require( './functions' );
const files =  require( './files' );
const process =  require( './process' );
let win;

function createWindow () {
 
  // Cria uma janela de navegação.
  win = new BrowserWindow( {
    backgroundColor: '#FFFFFF',
    icon: __dirname + '/dist/totvs-agent-app/analytics.ico',
    show: false
  });

  // Carrega a página principal do sistema que foi 
  // gerada na distribuição no processo de build
  win.loadURL( `file://${__dirname}/dist/totvs-agent-app/index.html` );

  // Exibe as ferramentas de desenvolvedor na janela 
  // win.toggleDevTools();
  
  win.maximize();
  win.once( 'ready-to-show', () => {
    win.show();
    win.focus();
  });

  // Evento acionado ao fechar a janela
  win.on( 'closed', function () {
    win = null;
  });

  // Bloqueia a navegação em links externos
  win.webContents.on( 'will-navigate', event => {
    event.preventDefault();
  });

  // ipcMain é o processo principal
  // Evento acionado ao iniciar a aplicação, deve sempre retornar valor
  ipcMain.on( 'startServer', ( event ) => {
    server.prepare().then( function ( res ) {
      if ( res ) {
        server.run().then(
          ( port ) => {
            event.returnValue = port;
          },
          ( port ) => {
            event.returnValue = port;
          }
        );
      } else {
        event.returnValue = '';
      }
    });
  });

  ipcMain.on( 'getServerPort', ( event ) => {
    event.returnValue = server.getServerPort();
  });

  ipcMain.on( 'saveServerPort', ( event, port ) => {
    server.saveServerPort( port ).then(
      () => { 
        event.returnValue = true; 
      }, () => { 
        event.returnValue =  false 
      });
  });  

  ipcMain.on( 'startAgent', ( event ) => {
    event.returnValue = agent.start();
  });
  
  ipcMain.on( 'stopAgent', ( event ) => {
    let stop = agent.stop();
    if ( stop ) {
      server.run();  
    }
    event.returnValue = stop;
  });  

  ipcMain.on( 'uninstallAgent', ( event ) => {
    let uninstall = agent.uninstall();
    if ( uninstall ) {
      server.run();  
    }
    event.returnValue = uninstall;
  });    

  ipcMain.on( 'getJdbcPath', ( event ) => {
    event.returnValue = process.getJdbcPath();
  });

  ipcMain.on( 'exportQueries', ( event, projectId ) => {
    files.exportQueries( projectId );
    event.returnValue = true;
  });

  ipcMain.on( 'deleteQueries', ( event, queryFolder ) => {
    files.deleteQueries( queryFolder );
    event.returnValue = true;
  });

  ipcMain.on( 'getQueryPath', ( event, projectId, projectTitle ) => {
    event.returnValue = files.getQueryPath( projectId, projectTitle );
  });

  ipcMain.on( 'listQueries', ( event ) => {
    event.returnValue = files.listQueries( );
  });

  ipcMain.on( 'loadQuery', ( event, path ) => {
    event.returnValue = files.loadQuery( path );
  });

  ipcMain.on( 'saveQuery', ( event, path, query ) => {
    event.returnValue = files.saveQuery( path, query );
  });

  ipcMain.on( 'deleteQuery', ( event, queryFile ) => {
    event.returnValue = files.deleteQueries( queryFile );
  });
  
  ipcMain.on( 'loadLog', ( event, type ) => {
    event.returnValue = files.loadLog( type );
  });

  ipcMain.on( 'openLogAgent', ( event ) => {
    event.returnValue = files.openLogAgent();
    event.returnValue = true;
  });

  ipcMain.on( 'runAgent', ( event, scheduleId, javaId, lineProduct ) => {
    process.runAgent( scheduleId, javaId, lineProduct );
    event.returnValue = true;
  });

  ipcMain.on( 'encrypt', ( event, text ) => {
    event.returnValue = functions.encrypt( text );
  });

  ipcMain.on( 'decrypt', ( event, text ) => {
    event.returnValue = functions.decrypt( text );
  });

  ipcMain.on( 'testDataBaseConnection', ( event, driverPath, driver, url, username, password ) => {
    event.returnValue = process.testDataBaseConnection( driverPath, driver, url, username, password );
  });

  ipcMain.on( 'checkToken', ( event, token ) => {
    event.returnValue = process.checkToken( token );
  });

  ipcMain.on( 'getStatusService', ( event ) => {
    process.getStatusService().then(
      ( status ) => { 
        event.returnValue = status;
      });    
  });

  ipcMain.on( 'setStatusExecution', ( event, idExecutionCancel, status ) => {
    event.returnValue = process.setStatusExecution( idExecutionCancel, status );
  });

}

app.on( 'ready', createWindow )

app.on( 'window-all-closed', function () {

  // On macOS specific close process
  if ( process.platform !== 'darwin' ) {
    app.quit()
  }
});

app.on( 'activate', function () {
  // macOS specific close process
  if ( win === null ) {
    createWindow()
  }
});
