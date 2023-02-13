import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electronyzer';
import { Monitor } from '../monitor/monitor';

@Injectable()
export class MonitorService {

    constructor( private _electronService: ElectronService ) {}

    getMonitorLog() {

        const executions: Array<Monitor> = [];
        const logType = [ 1, 2, 3 ]; // 1 - Manual, 2 - Schedule, 3 - Export

        let logManual = '';
        let logSchedule = '';
        let logExport = '';

        if ( this._electronService.isElectronApp ) {
            logManual = this._electronService.ipcRenderer.sendSync( 'loadLog', 1 );
            logSchedule = this._electronService.ipcRenderer.sendSync( 'loadLog', 2 );
            logExport = this._electronService.ipcRenderer.sendSync( 'loadLog', 3 );
        }

        logType.forEach( function ( type ) {

            let logLine = new Monitor();
            let lines = [];

            if ( type === 1 ) {
                lines = logManual.toString().split( '[{' );
            } else if ( type === 2 ) {
                lines = logSchedule.toString().split( '[{' );
            } else if ( type === 3 ) {
                lines = logExport.toString().split( '[{' );
            }

            let idExecutionRx: any;
            let idExecution = '';

            lines.sort();
            lines.forEach( function ( line ) {

                if ( line.startsWith( '"idExecution":' ) ) {

                    const finalLine = line.indexOf( '}]' );
                    line = line.substr( 0, finalLine );

                    idExecutionRx = line.match( /(\"idExecution":".*?\")/ );

                    idExecution = idExecutionRx[1];
                    idExecution = idExecution.replace( /"/g, '' );
                    idExecution = idExecution.replace( /idExecution:/g, '' );

                    if ( idExecution !== logLine.idExecution ) {

                        if ( logLine.idExecution !== undefined ) {
                            if ( ( logLine.status === undefined ) && ( type === 1 ) ) {
                                logLine.action.push( 'po-icon po-icon-close' );
                             }
                            if ( ( logLine.project !== undefined )  && ( logLine.start !== undefined ) ) {
                                executions.push( logLine );
                            }

                        }

                        logLine = new Monitor();
                        logLine.idExecution = idExecution;
                        logLine.serverLocal = [];
                        logLine.serverGoodData = [];

                        logLine.typeExecution = ( type === 1 ? 'Manual' :  type === 2 ? 'Schedule' : 'Export' );
                    }

                    let text = line.replace( /(\r\n|\n|\r)/gm, '' );
                    text = `{${text.replace( /\\/gm, '' )}}`;

                    try {
                        const obj = JSON.parse( text );

                        obj.timeStamp = obj.timeStamp.substr( 0, 16 );

                        if ( obj.server === 'Local' ) {
                            if ( obj.message.indexOf( 'Projeto: ' ) > -1 ) {
                                logLine.project = obj.message.replace( 'Projeto: ', '' );
                            } else if ( obj.message.indexOf( 'Início do processo do agent' ) > -1 ) {
                                logLine.start = obj.timeStamp;
                            } else if ( obj.message.indexOf( 'Fim do processo do agent' ) > -1 ) {
                                logLine.finish = obj.timeStamp;
                            } else if ( obj.message.indexOf( 'Tempo de execução total:' ) > -1 ) {
                                logLine.duration = obj.message.replace( 'Tempo de execução total: ', '' ).trim();
                            } else if ( obj.message.indexOf( 'Status de execu' ) > -1 ) {
                                logLine.status = obj.message.replace( 'Status de execução: ', '' ).trim();
                            } else {
                                logLine.serverLocal.push( obj );
                            }
                        } else if ( obj.server === 'GoodData' ) {
                            if ( obj.message.indexOf( 'Log de execu' ) > -1 ) {
                                logLine.logExecution = obj.message.replace( 'Log de execução: URL: ', '' );
                            } else if  ( obj.message.indexOf( 'Status de execu' ) > -1 ) {
                                logLine.status = obj.message.replace( 'Status de execução: ', '' ).trim();
                            } else {
                                logLine.serverGoodData.push( obj );
                            }
                        }
                    } catch ( error ) {
                        console.log( 'Erro ao tentar parser =>' + error );
                        console.log( text );
                    }
                }
            });

            if ( logLine.idExecution !== undefined ) {
                if ( ( logLine.status === undefined ) && ( type === 1 ) ) {
                   logLine.action.push( 'po-icon po-icon-close' );
                }
                if ( ( logLine.project !== undefined )  && ( logLine.start !== undefined ) ) {
                    executions.push( logLine );
                }
            }

        });

        // Ordena as execuções a serem apresentadas, de forma decrescente
        executions.sort( this.sortFunction);
        return executions;

    }

    sortFunction(a, b) {
        return (b.idExecution - a.idExecution);
    }
}
