const os = require( 'os' );
const path = require( 'path' );
const globals =  require( './globals' );

module.exports = {
    
    start(){
        if ( os.platform() === 'win32' ) {
            return this.executeOnWindows( 'start' );
        } else if ( os.platform() === 'linux' ) {
            this.executeOnLinux( 'start' );
        }
    },

    stop(){
        if ( os.platform() === 'win32' ) {
            return this.executeOnWindows( 'stop' );
        } else if ( os.platform() === 'linux' ) {
            this.executeOnLinux( 'stop' );   
        }
    },

    uninstall(){
        if ( os.platform() === 'win32' ) {
            return this.executeOnWindows( 'remove' );
        } else if ( os.platform() === 'linux' ) {
            this.executeOnLinux( 'remove' );   
        }
    },

    executeOnWindows( operation ) {
        let batFilePath = `${globals.CNST_PROGRAM_PATH}\\schedule\\windows\\${operation}.bat`;
        batFilePath = batFilePath.split( ' ' ).join( '^ ' );
        
        const childProcess = require( 'child_process' );
        const child = childProcess.spawnSync( 'cmd.exe', ['/c', batFilePath ] );
        return ( child.status === 0 );
        
    },

    executeOnLinux(){
    }

}
  