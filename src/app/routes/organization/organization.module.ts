import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { OrganizatioinRoutingModule, routedComponents } from './organization-routing.module';

@NgModule({
    imports: [SharedModule, OrganizatioinRoutingModule],
    exports: [],
    declarations: [...routedComponents],
    providers: [],
})
export class OrganizationModule { }
