@ECHO OFF

SET SERVICENAME="Totvs Agent Analytics"
SET NSSM="%CD%\schedule\windows\nssm.exe"

ECHO REMOVING SERVICE %SERVICENAME%

%NSSM% stop %SERVICENAME%
%NSSM% remove %SERVICENAME% confirm
