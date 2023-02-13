@ECHO OFF

SET SERVICENAME="Totvs Agent Analytics"
SET NSSM="%CD%\schedule\windows\nssm.exe"

ECHO INSTALLING SERVICE %SERVICENAME%

%NSSM% stop %SERVICENAME%
%NSSM% remove %SERVICENAME% confirm
%NSSM% install %SERVICENAME% %SERVICENAME%
%NSSM% set %SERVICENAME% Application scheduleWindows-win.exe
%NSSM% set %SERVICENAME% Description "Totvs Agent Analytics"
%NSSM% set %SERVICENAME% Start SERVICE_AUTO_START
%NSSM% set %SERVICENAME% AppStopMethodSkip 0
%NSSM% set %SERVICENAME% AppStopMethodConsole 0
%NSSM% set %SERVICENAME% AppStopMethodWindow 0
%NSSM% set %SERVICENAME% AppStopMethodThreads 0
%NSSM% set %SERVICENAME% AppThrottle 0
%NSSM% set %SERVICENAME% AppExit Default Ignore
%NSSM% set %SERVICENAME% AppStdout %CD%\schedule\windows\logs\schedule.log
%NSSM% set %SERVICENAME% AppStderr %CD%\schedule\windows\logs\schedule.log
%NSSM% set %SERVICENAME% AppRestartDelay 0
%NSSM% set %SERVICENAME% AppStdoutCreationDisposition 4
%NSSM% set %SERVICENAME% AppStderrCreationDisposition 4
%NSSM% set %SERVICENAME% AppRotateFiles 1
%NSSM% set %SERVICENAME% AppRotateOnline 1
%NSSM% set %SERVICENAME% AppRotateSeconds 0
%NSSM% set %SERVICENAME% AppRotateBytes 1048576
%NSSM% start %SERVICENAME%