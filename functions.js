const rc4 = require( 'arc4' );

module.exports = {
    encrypt( text ) {
        let cipher = rc4( 'arc4', 'rasgolkiebploisl' );
        text = cipher.encodeString( text );
        return text;
    },

    decrypt( text ) {
        let cipher = rc4( 'arc4', 'rasgolkiebploisl' );
        text = cipher.decodeString( text );
        return text;
    },

    convertDate( dateTime, special ) {
        function pad( s ) { return ( s < 10 ) ? '0' + s : s; }
        const d = new Date( dateTime );
      
        if ( special ) {
            return [ pad( d.getDate() ), pad( d.getMonth() + 1 ), d.getFullYear() ].join( '/' ) + ' ' + [ pad( d.getHours() ), pad( d.getMinutes() ) ].join( ':' );
        } else {
            return [ d.getFullYear() , pad( d.getMonth() + 1 ), pad( d.getDate() ) ].join( '' ) + 'T' + [ pad( d.getHours() ) , pad( d.getMinutes() ), pad ( d.getSeconds() ) ].join( '' );
        }
    }
}
