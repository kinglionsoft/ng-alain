import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { AdminRoutingModule, routedComponents } from './admin-routings.module';
import { RoleSelectComponent } from './roles/role-select.component';

@NgModule({
    imports: [SharedModule, AdminRoutingModule],
    exports: [],
    declarations: [...routedComponents, RoleSelectComponent],
    entryComponents: [RoleSelectComponent],
    providers: [],
})
export class AdminModule { }
