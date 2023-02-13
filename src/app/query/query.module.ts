import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoTableModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoLoadingModule } from '@po-ui/ng-components';

import { QueryComponent } from './query.component';
import { QueryService} from '../service/query.service';
import { ProjectService } from '../service/project.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [
        QueryComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        SharedModule,
        PoPageModule,
        PoTableModule,
        PoModalModule,
        PoFieldModule,
        PoLoadingModule
    ],
    providers: [
        QueryService,
        ProjectService
    ]
})
export class QueryModule {}
