import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { PoButtonModule } from '@po-ui/ng-components';
import { PoPageModule } from '@po-ui/ng-components';
import { PoLoadingModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoNotificationModule } from '@po-ui/ng-components';
import { PoListViewModule } from '@po-ui/ng-components';
import { PoInfoModule } from '@po-ui/ng-components';

import { ProjectComponent } from '../project/project.component';
import { ProjectService } from '../service/project.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [
        ProjectComponent
    ],
    imports: [
        CommonModule,
      PoButtonModule,
      BrowserAnimationsModule,
        FormsModule,
      PoInfoModule,
        PoPageModule,
        PoListViewModule,
        PoLoadingModule,
        PoModalModule,
        PoFieldModule,
        HttpClientModule,
        SharedModule,
        PoNotificationModule
    ],
    providers: [ ProjectService ]
})
export class ProjectModule {}
