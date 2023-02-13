const path =  require( 'path' );
const program_name = 'Totvs-Agent.exe';

module.exports = {
  CNST_PROGRAM_NAME: program_name,
  CNST_PROGRAM_PATH: path.dirname(path.resolve('.', program_name))
};