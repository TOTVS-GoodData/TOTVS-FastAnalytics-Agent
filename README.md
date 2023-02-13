# Primeiros passos
1. Instalar o nodejs
2. Executar o comando `npm install` para baixar os componentes
3. Instalar o componente PKG: `npm install -g pkg`
4. Instalar electron-packager: `npm install electron-packager -g`

# PKG
Para gerar os scripts de schedule como exe, utilizar o componente PKG (`https://www.npmjs.com/package/pkg`)
Entrar na pasta `..\schedule\windows` e empacotar o arquivo com o comando `pkg scheduleWindows.js`
Apagar os demais executáveis gerados, deixar somente o equivalente a plataforma, por exemplo, na pasta windows deixar somente o gerado para windows 

# Executar o projeto
Para rodar o projeto executar o comando: `npm start`

# Gerar exe do projeto\
1. Gerar os scripts de schedule como exe (PKG)
2. Para gerar somente em Windows: `npm run package-win`
3. `SOMENTE` após gerar o exe fazer build de produção no projeto totvs-agent-app. Pegar a pasta dist gerada e copiar para a pasta resources\app no diretório do exe 

# Para distribuir o Totvs Agent
1. Recortar a `pasta agent` (com o .jar), a `pasta schedule` e colar no mesmo diretório onde o exe foi gerado
2. Excluir os arquivos de log da pasta schedule\logs caso eles existam, mas `NÃO EXCLUIR` a pasta log
3. Excluir todas as dlls desnecessárias ( todas que iniciam com `api-ms-win`)
4. Apagar o arquivo db.json se tiver sido gerado na sua pasta,  pois `NUNCA` enviamos o arquivo db.json ( verificar pasta resources\app ) 
5. Apagar o arquivo server.json se tiver sido gerado na sua pasta,  pois `NUNCA` enviamos o arquivo server.json ( verificar pasta resources\app ) 

# Assinatura
1. Instalar o Signtool.exe (`http://www.microsoft.com/en-us/download/details.aspx?id=6510`)
2. Possuir o certificado digital da Totvs instalado na maquina
3. Acessar via prompt o caminho onde o sigtool foi instalado (ex. `C:\Program Files\Microsoft Platform SDK\Bin`)
4. Executar o comando `signtool signwizard`
5. Na janela do wizard selecione o executavel do `totvs agent` e o `schedule windows`
6. Aguarde cerca de 2min caso ocorra erro de arquivo não encontrado ou somente leitura
7. Selecione o certificado, informe a senha e por fim conclua o procedimento.
