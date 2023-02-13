import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoButtonModule } from '@po-ui/ng-components';

import { DataBaseService } from '../service/data-base.service';
import { DataBaseAddComponent } from './data-base-add.component';

@NgModule({
    declarations: [
        DataBaseAddComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        PoPageModule,
        PoFieldModule,
        PoButtonModule

    ],
    providers: [
        DataBaseService
    ],
    exports: [ DataBaseAddComponent
    ]
})
export class DataBaseAddModule {}
