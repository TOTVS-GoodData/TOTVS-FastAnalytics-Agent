import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';
import { PoButtonGroupModule } from '@po-ui/ng-components';

import { ScheduleComponent } from '../schedule/schedule.component';
import { ScheduleService } from '../service/schedule.service';

@NgModule({
    declarations: [
        ScheduleComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        PoPageModule,
        PoModalModule,
        PoButtonGroupModule
    ],
    providers: [ ScheduleService ]
})
export class ScheduleModule {}
