import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';

import { AdminRoutingModule, routedComponents } from './admin-routings.module';

@NgModule({
    imports: [SharedModule, AdminRoutingModule],
    exports: [],
    declarations: [...routedComponents],
    providers: [],
})
export class AdminModule { }
