const fs = require( 'fs' );
const jsonFile = require( 'jsonfile' );
const jsonServer = require( 'json-server' );
const request = require( 'request' );
const server = jsonServer.create();
const globals =  require( './globals' );

let port = getJsonPort();

function getJsonPort() {
  let portFile;

  try {
    let jsonData = jsonFile.readFileSync( __dirname + '/server.json');
    portFile = jsonData.port;
  }
  catch( error ) {
    console.log( `Não foi possível carregar o arquivo de configurações do servidor Json: ${error}` );
  }

  return portFile;
}

function savePort( portSave ) {
  let result;
  try {
    let jsonPort = { "port" : portSave };
    jsonFile.writeFileSync( __dirname + '/server.json', jsonPort, { spaces: 2 } );
    result = true;
  }
  catch( error ) {
    console.log( error );
    result = false;
  }
  return result;
}

function getUrlObject() {
  let urls = {};
  urls.projects = [];
  urls.javaConfigurations = [];
  urls.dataBases = [];
  urls.schedules = [];
  urls.configurations = [];
  return urls;
} 

function getUrl() {
  let urls = getUrlObject();
  return JSON.stringify( urls );
}

function updateURL( fileName ) {

  return new Promise( function ( resolve, reject ) {

    fs.readFile( fileName, 'utf-8', function( error, data ) {
      if ( error ) {
        console.log( error );
        reject( true );
      } else {
        let updateDB = false;

        let db = {}
        db = JSON.parse( data );

        let urls = new Object();
        urls = getUrlObject();

        Object.keys( urls ).map( url => {
          if ( ! db.hasOwnProperty( url ) ) {
            db[url] = [];
            updateDB = true;
          }  
        });

        if ( updateDB ) {

          fs.writeFile( fileName, JSON.stringify( db ), 'utf-8', function( error ) {
            if ( error ) {
              console.log( `Erro ao atualizar URLs: ${error}` );
              reject( true );
            }
            else {
              console.log( 'URLs atualizadas!' )
              resolve( true );
            }
          });
        } else {
          resolve( true );
        }
      }  
    });

  });    
};

function startServer() {
  return new Promise( ( resolve, reject ) => {
    // Verifica se o server já está rodando ( devido o schedule )
    
    testServer( port ).then( 
      ( portUsed ) => {
        console.log( `startServer: Json Server rodando na porta ${portUsed}` );
        resolve( portUsed );
      }, 
      () => {
        findFreePort().then(
          ( portUsed ) => {
            if ( port !== portUsed ){
              savePort( portUsed );
            }
            resolve( portUsed );
          },
          () => {
            reject();
          });  
      });
  });  
}

function findFreePort() {
  
  return new Promise( ( resolve, reject ) => {
    runServer( port ).then( 
      ( portUsed ) => { resolve( portUsed ); },
      () => {
        runServer( '3000' ).then(
          ( portUsed ) => { resolve( portUsed ); }, 
          () => {
            runServer( '3001' ).then(
              ( portUsed ) => { resolve( portUsed ); }, 
              () => {
                runServer( '8000' ).then(
                  ( portUsed ) => { resolve( portUsed ); }, 
                  () => {
                    runServer( '8001' ).then(
                      ( portUsed ) => { resolve( portUsed ); }, 
                      () => {
                        runServer( '8088' ).then(
                          ( portUsed ) => { resolve( portUsed ); }, 
                          () => {
                            runServer( '8089' ).then(
                              ( portUsed ) => { resolve( portUsed ); }, 
                              ( ) => { reject(); });
                          });
                      });
                  });
              });
          });
      });  
    });
}

function testServer( testPort ) {

  return new Promise( ( resolve, reject ) => {
    request( {
        url: `http://localhost:${testPort}/configurations`,
        json: true
    }, function ( error, response, body ) {
        if  ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {
          resolve( testPort );
        } else {
          reject();
        }            
    });
  });
}

function runServer( serverPort ){
  return new Promise( ( resolve, reject ) => {

    const file = globals.CNST_PROGRAM_PATH + '/db.json';

    if ( fs.existsSync( file ) ) {

      if ( serverPort !== undefined ) {
        const router = jsonServer.router( file );
        const middlewares = jsonServer.defaults();
        
        server.use( middlewares );
        server.use( router );
  
        server.listen( serverPort, () => {
          console.log( `runServer: Json Server tentando iniciar na porta ${serverPort}` );
          testServer( serverPort ).then( 
            ( portUsed ) => {
              console.log( `runServer: Json Server iniciado na porta ${serverPort}` );
              resolve( portUsed );
            }, () => {
              console.log( `runServer: Json Server não conseguiu iniciar na porta ${serverPort}` );
              reject();
            });
        }).on( 'error', err => { 
          if ( err.code === 'EADDRINUSE' ) { 
            console.log( `runServer: Porta ${serverPort} ocupada` );
            reject();
          } else{ 
            console.log( 'Erro: ', err );
            reject();
          }
        });
      } else {
        reject();
      }
    } else {
      console.log( 'runServer: Houve um erro ao subir o Json Server: arquivo json não encontrado' );
      reject();
    }
  });
}

module.exports = {
  
  prepare(){
    return new Promise( function ( resolve, reject ) {
      const fileName = globals.CNST_PROGRAM_PATH + '/db.json';
      // não deve sobrescrever o arquivo já existente do cliente
      if ( ! ( fs.existsSync( fileName ) ) ) {
        let body = getUrl();
    
        fs.writeFile( fileName, body, ( err ) => {
          if ( err ) {
              console.log( 'Erro ao criar arquivo json' );
              console.log( err );
              reject( false );
          } else{
            console.log( 'Arquivo json criado' );
            resolve( true ); 
          }
        });
      } else {
          updateURL( fileName ).then( function ( res ) {
            if ( res ) {
              resolve( true ); 
            }  
          });
      }
    });  
  },

  run(){
    return new Promise( function ( resolve, reject ) {
      startServer().then(
        ( portUsed ) => {
          port = portUsed;
          resolve( port );
        },
        () => {
          port = '';
          reject( port );
        }  
      );    
    });
  },

  saveServerPort( portSave ) {
    return new Promise( function ( resolve, reject ) {
      if ( savePort( portSave ) ) {
        resolve();
      } else {
        reject();
      }
    });
    
  },

  getServerPort() {
    return port;
  }

}

