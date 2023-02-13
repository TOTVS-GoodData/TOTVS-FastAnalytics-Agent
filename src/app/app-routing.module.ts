import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProjectComponent } from './project/project.component';
import { ProjectAddComponent } from './project-add/project-add.component';
import { JavaComponent } from './java/java.component';
import { DataBaseComponent } from './data-base/data-base.component';
import { DataBaseAddComponent } from './data-base-add/data-base-add.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { ScheduleAddComponent } from './schedule-add/schedule-add.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import { MonitorComponent } from './monitor/monitor.component';
import { QueryComponent } from './query/query.component';
import { JavaAddComponent } from './java-add/java-add.component';

const routes: Routes = [
  { path: 'project', component: ProjectComponent },
  { path: 'project-add/:type', component: ProjectAddComponent },
  { path: 'project-add/:type/:id', component: ProjectAddComponent },
  { path: 'java', component: JavaComponent },
  { path: 'java-add', component: JavaAddComponent },
  { path: 'java-add/:id', component: JavaAddComponent },
  { path: 'data-base', component: DataBaseComponent },
  { path: 'data-base-add', component: DataBaseAddComponent },
  { path: 'data-base-add/:id', component: DataBaseAddComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'schedule-add', component: ScheduleAddComponent },
  { path: 'schedule-add/:id', component: ScheduleAddComponent },
  { path: 'configuration', component: ConfigurationComponent },
  { path: 'monitor', component: MonitorComponent },
  { path: 'query', component: QueryComponent }
//  { path: '', redirectTo: 'project', pathMatch: 'full'}
//  { path: '**', redirectTo: 'project', pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forRoot( routes, { useHash: true } ) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
