import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { PoPageModule } from '@po-ui/ng-components';
import { PoFieldModule } from '@po-ui/ng-components';
import { PoInfoModule } from '@po-ui/ng-components';
import { PoButtonModule } from '@po-ui/ng-components';

import { ProjectAddComponent } from '../project-add/project-add.component';
import { DataBaseService } from '../service/data-base.service';
import { JavaService } from '../service/java.service';
import { UserService } from '../service/user.service';
import { ProjectService } from '../service/project.service';

import { DataBaseAddModule } from '../data-base-add/data-base-add.module';
import { JavaModule } from '../java/java.module';
import { ModalModule } from '../modal/modal.module';
import { JavaAddModule } from '../java-add/java-add.module';

@NgModule({
    declarations: [
        ProjectAddComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        DataBaseAddModule,
        ModalModule,
        JavaModule,
        PoPageModule,
        PoFieldModule,
        PoInfoModule,
        PoButtonModule,
        JavaAddModule
    ],
    providers: [ DataBaseService, JavaService, UserService, ProjectService ]
})
export class ProjectAddModule {}
