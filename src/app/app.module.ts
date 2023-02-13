import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

import { PoMenuModule } from '@po-ui/ng-components';
import { PoNotificationModule } from '@po-ui/ng-components';
import { PoTableModule } from '@po-ui/ng-components';
import { PoModule } from '@po-ui/ng-components';

import { ProjectModule } from './project/project.module';
import { ProjectAddModule } from './project-add/project-add.module';
import { DataBaseModule } from './data-base/data-base.module';
import { DataBaseAddModule } from './data-base-add/data-base-add.module';
import { JavaModule } from './java/java.module';
import { JavaAddModule } from './java-add/java-add.module';
import { LogModule } from './log/log.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ScheduleAddModule } from './schedule-add/schedule-add.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { MonitorModule } from './monitor/monitor.module';
import { QueryModule } from './query/query.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';

import 'hammerjs';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserAnimationsModule,
    PoModule,
    BrowserModule,
    AppRoutingModule,
    PoMenuModule,
    ProjectModule,
    ProjectAddModule,
    DataBaseModule,
    DataBaseAddModule,
    JavaModule,
    LogModule,
    ScheduleModule,
    ScheduleAddModule,
    ConfigurationModule,
    MonitorModule,
    QueryModule,
    SharedModule,
    PoNotificationModule,
    PoTableModule,
    JavaAddModule
  ],
  providers: [AppModule],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
