import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoFieldModule } from '@po-ui/ng-components';
import { PoPageModule } from '@po-ui/ng-components';

import { ConfigurationService } from '../service/configuration.service';
import { ConfigurationComponent } from './configuration.component';

@NgModule({
    declarations: [
        ConfigurationComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        PoFieldModule,
        PoPageModule
    ],
    providers: [
        ConfigurationService
    ]
})
export class ConfigurationModule {}
