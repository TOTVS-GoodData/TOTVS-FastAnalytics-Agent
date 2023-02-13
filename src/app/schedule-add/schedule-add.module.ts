import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoGridModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';

import { ScheduleAddComponent } from '../schedule-add/schedule-add.component';
import { ProjectService } from '../service/project.service';

@NgModule({
    declarations: [
        ScheduleAddComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        PoGridModule,
        HttpClientModule,
        PoPageModule,
        PoFieldModule,
        PoModalModule
    ],
    providers: [ ProjectService ]
})
export class ScheduleAddModule {}
