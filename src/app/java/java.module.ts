import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';

import { JavaService } from '../service/java.service';
import { JavaComponent } from './java.component';

@NgModule({
    declarations: [
        JavaComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        PoPageModule,
        HttpClientModule,
        PoModalModule,
        PoFieldModule
    ],
    providers: [
        JavaService
    ],
    exports: [
        JavaComponent
    ]
})
export class JavaModule {}
