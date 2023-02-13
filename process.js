const path = require( 'path' );
const childProcess = require( 'child_process' );
const fs = require( 'fs-extra' );
const request = require( 'request' );
const server =  require( './server' );
const functions =  require( './functions' );
const files =  require( './files' );
const globals =  require( './globals' );

const jarPathFast = globals.CNST_PROGRAM_PATH + '/agent/TOTVS-FastAnalytics-Agent-1.7.0.jar';
const jarPathSmart = globals.CNST_PROGRAM_PATH + '/agent/gdc-agent-totvs-3.2.2.jar';

module.exports = {
    getJdbcPath() {
        let jdbcPath = globals.CNST_PROGRAM_PATH + '/agent/jdbc/';
        return jdbcPath;
    },

    runAgent( scheduleId, javaId, lineProduct ) {
        const port = server.getServerPort();
        const jarPath = ( ( lineProduct === 1 ) ? jarPathFast : jarPathSmart );
        

        files.checkFileSize();

        this.getJavaParamsByProject( javaId, port ).then( ( params ) => {

            this.getConfiguration( port ).then( ( config ) => {
                let sweepTime = new Date ();
                console.log( `[{Executando TOTVS Agent Analytics...${sweepTime}}]` );
                let child;
    
                params.push( '-jar' );
                params.push( jarPath );
                params.push( scheduleId );
                params.push( port );
                params.push( config.showQuery );
                
                child = childProcess.spawn( 'java', params );

                child.stdout.on( 'data', ( data ) => {
                    let str = String.fromCharCode.apply( null, data );
                    console.log( str, true );
                } );
                
                child.stderr.on( 'data', ( data ) => {
                    let str = String.fromCharCode.apply( null, data );
                    console.log( str, true );
                } );       
    
            }, ( err ) => { console.log( err, true ) } );

        }, ( err ) => { console.log( err, true ) } );
    },

    getJavaParamsByProject( javaId, port ) {
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
                        console.log( `getJavaParamsByProject => ${error}` );
                        reject();
                    }            
                } );   
            } else {
                resolve( javaParams );
            }
        } );
    },

    getConfiguration( port ) {
        let config = {};
        return new Promise( ( resolve, reject ) => {
            request( {
                url: `http://localhost:${port}/configurations`,
                json: true
            }, function ( error, response, body ) {
                if  ( ( response !== undefined ) && ( response.statusCode === 200 ) ) {
                    config.intervalExecutionServer = ( body.intervalExecutionServer > 0 ? body.intervalExecutionServer : 1 ) * 60000;
                    if ( body[0] === undefined ) {
                        config.showQuery = false;    
                    } else {
                        config.showQuery = body[0].showQuery;
                    }    
                    resolve( config );
                } else {
                    console.log( `getConfiguration => ${error}` );
                    reject();
                }            
            } );   
        } );
    },

    testDataBaseConnection( driverPath, driver, url, username, password ) {
        let jarPath = '';
        
        if ( fs.existsSync( jarPathFast ) ) {
            jarPath = jarPathFast;
        } else {
            jarPath = jarPathSmart;
        }
        let child = childProcess.spawnSync( 'java', [ '-classpath', jarPath, 'com.gooddata.agent.util.TestDataBaseConnection', driverPath, driver, url, username, password ] );
        return ( child.status === 0 );
    },

    checkToken( token ) {
        let child = childProcess.spawnSync( 'java', [ '-classpath', jarPathFast, 'com.gooddata.agent.util.CheckToken', token ] );
        return ( child.status === 0 );
    },

    getStatusService() {
        return new Promise( ( resolve ) => {
            let status = 'Não Iniciado';
            childProcess.exec( 'sc query "Totvs Agent Analytics" | find "RUNNING"', function( err, stdout ) {
                if ( stdout.indexOf( 'RUNNING') !== -1 ){
                    status = 'Em Execução';
                }
                resolve( status );
            });
        });
    },

    setStatusExecution( idExecutionCancel, status ) {
        try {
            const d = new Date();
            const cancelDate = functions.convertDate( d, true );
            const execution = `[{"idExecution":"${idExecutionCancel}","server":"Local", "timeStamp":"${cancelDate}", "message":"Status de execução: ${status}"}]\n`;
            console.log( execution, true );
            return true;
        } catch ( error ) {
            console.log( 'setStatusExecution => ' + error );
            return false;
        }
    }

}
