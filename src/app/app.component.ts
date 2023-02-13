import { Component, OnInit } from '@angular/core';
import { ProjectService } from './service/project.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'app';

  menus = [
    { label: 'Projetos', link: './project', icon: 'po-icon-chart-columns' },
    { label: 'Banco de Dados', link: './data-base', icon: 'po-icon-database' },
    { label: 'Java', link: './java', icon: 'po-icon-parameters' },
    { label: 'Agendamento', link: './schedule', icon: 'po-icon-clock' },
    { label: 'Query', link: './query', icon: 'po-icon-filter' },
    { label: 'Monitor', link: './monitor', icon: 'po-icon-device-desktop' },
    { label: 'Configurações', link: './configuration', icon: 'po-icon-settings' },
  ];

  constructor(private _projectService: ProjectService) {
  }

  ngOnInit(): void {
    this._projectService.initService().then(() => {
    });
  }
}
