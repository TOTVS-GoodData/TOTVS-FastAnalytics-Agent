import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';

import { DataBaseService } from '../service/data-base.service';
import { DataBaseComponent } from './data-base.component';

@NgModule({
    declarations: [
        DataBaseComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        PoPageModule,
        PoModalModule
    ],
    providers: [
        DataBaseService
    ]
})
export class DataBaseModule {}
