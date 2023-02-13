'use strict';
const path = require( 'path' );
const request = require( 'request' );
const jsonFile = require( 'jsonfile' );
const fs = require('fs');
const childProcess = require( 'child_process' );
const jsonServer = require( 'json-server' );
const fileDB = path.join( path.dirname( process.execPath ), '../..', 'db.json' );
const jarPathFast = path.join( path.dirname( process.execPath ), '../..', 'agent/agent-analytics-1.6.1.jar' );
const jarPathSmart = path.join( path.dirname( process.execPath ), '../..', 'agent/gdc-agent-totvs-3.2.2.jar' );
const port = getJsonPort();

function getJsonPort() {
    let port;

    try {
      let filePort = path.join( path.dirname( process.execPath ), '../..', 'server.json' );
      let jsonData = jsonFile.readFileSync( filePort );
      port = jsonData.port;
    }
    catch( error ) {
      console.log( `Não foi possível carregar o arquivo de configurações do servidor Json: ${error}` );
    }
  
    return port;
};

function serverRun() {

    if ( fs.existsSync( fileDB ) ) {
        
        const server = jsonServer.create();
        const router = jsonServer.router( fileDB );
        const middlewares = jsonServer.defaults();
        
        server.use( middlewares );
        server.use( router );
    
        server.listen( port, () => {
            console.log( `Json Server reiniciado na porta ${port}` );
        }).on( 'error', err => { 
            if ( err.code === 'EADDRINUSE' ) { 
                console.log( `Json Server rodando na porta ${port}` );
            } else{ 
                console.log( 'Erro ao reiniciar o Json Server: ', err );
            }
        });

    } else {
        console.log( 'Houve um erro ao subir o Json Server: arquivo json não encontrado' );
    }
};

function diff_minutes( dt2, dt1 ){
  if ( dt2 === '' || dt1 === '') {
    return 0;
  } else {
    let diff = ( dt2.getTime() - dt1.getTime() ) / 1000;
    diff /= 60;
    return Math.abs( Math.round( diff ) );
  }  
};

function getProject( projectId ) {
    let project = [];
    return new Promise( ( resolve, reject ) => {
        request( {
            url: `http://localhost:${port}/projects/${projectId}`,
            json: true
        }, function ( error, response, body ) {
            if  ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {
                project = body;
                resolve( project );
            } else {
                console.log( `Houve um erro ao buscar o projeto ${projectId}` );
                reject();
            }            
        } );   
    } );
};

function getJavaParams( javaId ) {
    let javaParams = [];
    return new Promise( ( resolve, reject ) => {
        if ( ( javaId !== null ) && ( javaId !== undefined ) && ( javaId !== '' ) ) {
            request( {
                url: `http://localhost:${port}/javaConfigurations/${javaId}`,
                json: true
            }, function ( error, response, body ) {
                if  ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {
                    for ( let parameter of body.params ) {
                        javaParams.push( parameter.value );
                    }
                    resolve( javaParams );
                } else {
                    console.log( `Houve um erro ao buscar a configuração Java ${javaId}` );
                    reject();
                }            
            } );   
        } else {
            resolve( javaParams );
        }
    } );
};

function getConfiguration() {
    
    let config = {};

    return new Promise( ( resolve, reject ) => {
        request( {
            url: `http://localhost:${port}/configurations`,
            json: true
        }, function ( error, response, body ) {
            if  ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {
                if ( body[0] === undefined ) {
                    config.showQuery = false;
                    config.intervalExecutionServer = 1 * 60000;
                } else {
                    config.intervalExecutionServer = body[0].intervalExecutionServer * 60000;
                    config.showQuery = body[0].showQuery;
                }    
                resolve( config );
            } else {
                console.log( `Houve um erro ao buscar as configurações do serviço` );
                reject( error );
            }            
        } );   
    } );
};

function timeToExecute( schedule, sweepTime ) {

    let isTime = false;
    
    if ( ( schedule.startDateTime !== undefined ) && ( schedule.startDateTime !== '' ) ) {

        let startDate = new Date( schedule.startDateTime );

        if ( ( startDate <= sweepTime ) && ( ( schedule.interval !== undefined ) && ( schedule.interval !== '' ) ) ) {

            let lastExecution =  ( ( schedule.lastExecution == undefined ) || ( schedule.lastExecution == '' ) ) ? '' : new Date ( schedule.lastExecution );

            if ( ( ( lastExecution == '' ) && ( sweepTime.getHours() == startDate.getHours() ) ) || // se for a primeira execução e se esta na hora marcada para o projeto
                 ( ( lastExecution !== '' ) && ( diff_minutes( sweepTime, lastExecution ) >= schedule.interval ) && // se não for a primeira execução e passou do intervalo de execução
                   ( ( ( schedule.interval == 1440 ) && ( sweepTime.getHours() == startDate.getHours() ) ) || ( schedule.interval !== 1440 ) ) ) ) { // verifica se o projeto e de 24h para executar somente na hora determinada
                isTime = true;
            }
        }
    }

    return isTime;       
}

function executeProject( scheduleId, javaId, lineProduct, showQuery ) {

    getJavaParams( javaId ).then( ( params ) => {

            let jarPath = ( ( lineProduct === 1 ) ? jarPathFast : jarPathSmart );
            let child;
            
            params.push( '-jar' );
            params.push( jarPath );
            params.push( scheduleId );
            params.push( port );
            params.push( showQuery );

            child = childProcess.spawn( 'java', params );
            
            child.stdout.on( 'data', ( data ) => {
                let str = String.fromCharCode.apply( null, data );
                console.log( str );
            } );
            
            child.stderr.on( 'data', ( data ) => {
                let str = String.fromCharCode.apply( null, data );
                console.log( str );     
            } );
        }, 
        ( err ) => { console.log( err ) } 
    );

}

console.log( `Serviço TOTVS Agent Analytics iniciado na porta ${port} ...` );

getConfiguration().then( (config ) => {

    const milliseconds = config.intervalExecutionServer;

    setInterval( function() {
    
        let sweepTime = new Date ();
        let schedules = [];
    
        console.log( `Executando Serviço TOTVS Agent Analytics...${sweepTime}` );

        // Pega todos os projetos 
        request( {
            url: `http://localhost:${port}/schedules`,
            json: true
        }, function ( error, response, body ) {

            if ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {

                schedules = body;
    
                for ( let schedule of schedules ) {
    
                    if ( timeToExecute( schedule, sweepTime ) ) {

                        // Atualiza o horário da última execução do agendamento
                        schedule.lastExecution = new Date ();

                        console.log( `[{Executando o agendamento ${schedule.id} - ${schedule.name} às ${schedule.lastExecution}}]` );
                        
                        request( {
                            url: `http://localhost:${port}/schedules/${schedule.id}`,
                            method: 'PUT',
                            headers: { 'Content-type': 'application/json' },
                            body: schedule,
                            json: true
                        }, function ( error, response ) {
        
                            if  ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {
                                
                                getProject( schedule.projectId ).then( ( project ) => {
                                    executeProject( schedule.id, project.javaConfigurationId, project.lineProduct, config.showQuery )
                                });
    
                            } else {
                                console.log( 'Não foi possível acessar o agendamento' );
                            }
                        } );
                    }
                }
            
            } else {
                console.log( 'Json Server será reiniciado em instantes ...' );
                serverRun();
            }
        });
    
    }, milliseconds );    
    
},( err ) => { console.error( err ) } );

