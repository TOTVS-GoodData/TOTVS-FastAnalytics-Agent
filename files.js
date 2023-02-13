const path = require( 'path' );
const childProcess = require( 'child_process' );
const fs = require( 'fs-extra' );
const shell = require( 'electron' ).shell;
const server =  require( './server' );
const functions =  require( './functions' );
const globals =  require( './globals' );
const jarPathFast = globals.CNST_PROGRAM_PATH + '/agent/TOTVS-FastAnalytics-Agent-1.7.0.jar';
const log_manual = fs.createWriteStream( globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/manual.log', { flags: 'a', encoding: 'utf8' } );
const log_export = fs.createWriteStream( globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/export.log', { flags: 'a', encoding: 'utf8' } );
const log_stdout = process.stdout;


console.log = function( data, agentExec, exportQry ) {
	if ( agentExec ) {
        if ( exportQry ) {
            log_export.write( `${data}` );
        } else {
            log_manual.write( `${data}` );
        }
		log_stdout.write( `${data}` );
	} else {
		log_manual.write( data + '\n' );
		log_stdout.write( data + '\n' );
	}	
};

function getLogContent( type ) {
    let logAgent = '';
    let logAgentPath = '';
    
    if ( type === 1 ) {
        logAgentPath = globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/manual.log';
    } else if ( type === 2 ){
        logAgentPath = globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/schedule.log';
    } else if ( type === 3 ){
        logAgentPath = globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/export.log';
    }    

    if ( fs.existsSync( logAgentPath ) ) {
        logAgent = fs.readFileSync( logAgentPath );
    }

    return logAgent;
}; 

function createLogManual() {
    const manualContent = getLogContent( 1 );
    const now = new Date();
    let fileCreated = false;

    try {
        const fileDate = functions.convertDate( now, false );

        fs.writeFileSync( globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/manual-${fileDate}.log', manualContent );
    
        fileCreated = true;
    } catch (error) {
        fileCreated = false;
        console.log( 'createLogManual:' + eror );
    }

    return fileCreated;
};

function loadQueries( queryPath, projectName, idproject, projectLoad ) {
    let itens = [];
    let project = ' ';
    let posHifen = 0;
    let projectId = '';
            
    if ( projectLoad != true ) {
        if ( projectName != undefined ) {
            if ( projectName.length > 0 ) {
                posHifen = projectName.indexOf(' - ');
                project = projectName.substr( posHifen + 3);
                projectId = projectName.substr( 0, posHifen);
            };
        };
    } else {
        project = projectName;
        projectId = idproject;
    };

    fs.readdirSync( queryPath).forEach(file => { 
        let fileItem = queryPath + '/' + file;
        let stats = fs.statSync( fileItem );

        if ( stats.isDirectory() ) {
            let temp;

            temp = loadQueries( fileItem, project, projectId, true);

            temp.forEach( result => {
                itens.push( result );
            })
            
        } else {
            if ( file.slice( -4 ).toLowerCase() === '.txt' ) {
                let files = {};

                files.projectName = project;
                files.projectId = projectId;
                files.dirPath = queryPath;
                files.fileName = file;
                if ( fileItem.indexOf('/dim/') > 0) {
                    files.type = 'Dimensão';
                } else {
                    files.type = 'Fato';
                }

                if ( fileItem.indexOf('/mensal/') > 0) {
                    files.recurrence = 'Mensal';
                } else {
                    files.recurrence = 'Período';
                }

                itens.push( files );

            }
        };
    
    });
    
    return itens;

};

function getQueryContent( queryPath ) {
    let fileContent = '';

    if ( fs.existsSync( queryPath ) ) {
        fileContent = fs.readFileSync( queryPath );
    }

    return fileContent;
}

module.exports = {
    exportQueries( projectId ) {
        let child;
        const port = server.getServerPort();
        child = childProcess.spawn( 'java', [ '-classpath', jarPathFast, 'com.gooddata.agent.jdbc.JdbcExport', projectId , port ] );

        child.stdout.on( 'data', ( data ) => {
            let str = String.fromCharCode.apply( null, data );
            console.log( str, true, true );
        });
        
        child.stderr.on( 'data', ( data ) => {
            let str = String.fromCharCode.apply( null, data );
            console.log( str, true, true );     
        });       
    }, 

    getQueryPath( projectId, projectTitle ) {

        let wordPathList = [ ':', '|','\\', '/', '*', '?', '"', '<', '>' ];

        for ( let index = 0; index < wordPathList.length; index++ ) {
            let forbiddenWord = wordPathList[index];
            projectTitle = projectTitle.replace( forbiddenWord, '' );
        }
        
        let queryPath = globals.CNST_PROGRAM_PATH + `/agent/query/${projectId} - ${projectTitle}/`;
        return queryPath;
    },

    deleteQueries( queryFile ) {
        let success = true;

        try {
            fs.remove( queryFile );
        } catch (error) {
            success = false;    
        }
        return success;
    },

    listQueries() {
        let queryPath = globals.CNST_PROGRAM_PATH + '/agent/query/';
        let queryFiles = {};
        
        if ( fs.existsSync( queryPath ) ) {
            queryFiles.projects = []
            queryFiles.projects.itens = {};

            var dirFiles = [];

            fs.readdirSync( queryPath).forEach(file => { 
                
                let fileItem = queryPath + file;
                let stats = fs.statSync( fileItem )
                        
                if ( stats.isDirectory() ) {
                    let aux = {};
                    let temp;

                    aux.projeto = file;
                    aux.files = [];

                    temp = loadQueries( fileItem, file);
        
                    temp.forEach( result => {
                        aux.files.push( result );
                    })

                    queryFiles.projects.push( aux );

                } 
            });

            if (dirFiles.length > 0) {
                let others = {}

                others.projeto = "";
                others.files = dirFiles; 
                queryFiles.projects.push(others);
            }
        };

        return queryFiles;
    },

    loadQuery( path ) {
        let queryContent = '';

        queryContent = getQueryContent( path ); 
        return queryContent;
    },

    saveQuery( path, query ){
        let fileCreated = false;

        try {
            fs.writeFileSync( path, query );
        
            fileCreated = true;
        } catch (error) {
            fileCreated = false;
            console.log( 'saveQuery:' + eror );
        }
    
        return fileCreated;
    
    },

    loadLog( type ) {
        let logAgent = '';

        logAgent = getLogContent( type ) ;

        return logAgent;
    },

    openLogAgent() {
        let logAgentPath = ( globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/');
        shell.openItem( path.join( logAgentPath, 'manual.log') );
    },

    checkFileSize() {
        fs.stat(globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/manual.log', function( err, stats ) {
            const size = stats[ 'size' ] ;
            
            if ( size > 1048576 ) {
                if (createLogManual()) {
                    fs.truncate(globals.CNST_PROGRAM_PATH + '/schedule/windows/logs/manual.log', 0 );
                };
            }
        });
    },
    
}
