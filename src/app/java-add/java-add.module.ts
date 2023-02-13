import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoGridModule } from '@po-ui/ng-components';
import { PoModalModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';

import { JavaService } from '../service/java.service';
import { JavaModule } from '../java/java.module';
import { JavaAddComponent } from './java-add.component';

@NgModule({
    declarations: [
        JavaAddComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        PoGridModule,
        PoPageModule,
        HttpClientModule,
        PoModalModule,
        PoFieldModule,
        JavaModule
    ],
    providers: [
        JavaService
    ],
    exports: [
        JavaAddComponent
    ]
})
export class JavaAddModule {}
