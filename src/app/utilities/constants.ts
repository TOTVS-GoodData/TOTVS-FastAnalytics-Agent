export const CNST_UPLOAD_URL = 'https://secure-di.gooddata.com/';
export const CNST_DOMAIN = 'analytics.totvs.com.br';

export const CNST_EXTENSION = [
   { label: 'Windows (.zip)', value: '.zip' }
  ,{ label: 'Linux (.gz)', value: '.gz' }
  ,{ label: 'Linux Tarball (.tar.gz)', value: '.tar.gz' }
];

export const CNST_ORIGEM = [
   { label: 'Local', value: 'Local' }
  ,{ label: 'Cloud (TOTVS)', value: 'Cloud TOTVS' }
  ,{ label: 'Cloud (Smart ERP)', value: 'Cloud Smart ERP' }
  ,{ label: 'Cloud (Outros)', value: 'Cloud Outros' }
];

export const CNST_ERP = [
  {
     ERP: 'Protheus'
    ,Modulos: [
       { label: 'Backoffice', value: 'BO' }
      ,{ label: 'RH', value: 'RH' }
      ,{ label: 'TMS', value: 'TMS' }
      ,{ label: 'GFE', value: 'GFE' }
      ,{ label: 'PLS', value: 'PLS' }
      ,{ label: 'WMS', value: 'WMS' }
      ,{ label: 'Gestão de Serviços', value: 'SERV' }
      ,{ label: 'Jurídico', value: 'JUR' }
    ]
  },
  {
     ERP: 'Datasul'
    ,Modulos: [
       { label: 'Backoffice', value: 'BO' }
      ,{ label: 'RH', value: 'RH' }
      ,{ label: 'WMS', value: 'WMS' }
      ,{ label: 'GPS', value: 'GPS' }
    ]
  },
  {
     ERP: 'RM'
    ,Modulos: [
       { label: 'Backoffice', value: 'BO' }
      ,{ label: 'RH', value: 'RH' }
      ,{ label: 'C&P (TIN)', value: 'CEP TIN' }
      ,{ label: 'C&P (TOP)', value: 'CEP TOP' }
      ,{ label: 'Saúde', value: 'SAUDE' }
      ,{ label: 'Educacional', value: 'EDU' }
    ]
  }
];

export const CNST_MODALIDADE_CONTRATACAO = [
   { label: 'FAST Analytics (Modalidade FAST)', value: 'FAST_1' }
  ,{ label: 'FAST Analytics (Modalidade Plataforma)', value: 'FAST_2' }
  ,{ label: 'SMART Analytics', value: 'SMART' }
  ,{ label: 'Plataforma GoodData', value: 'PLATAFORMA' }
  ,{ label: 'CRM Analytics', value: 'CRM' }
  ,{ label: 'Demonstração', value: 'DEMO' }
];