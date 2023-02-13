@ECHO OFF

SET SERVICENAME="Totvs Agent Analytics"
SET NSSM="%CD%\schedule\windows\nssm.exe"

ECHO STOPPING SERVICE %SERVICENAME%

%NSSM% stop %SERVICENAME%