import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationComponent } from './organization/organization.component';
import { RolesComponent } from './roles/roles.component';


const routes: Routes = [
    {
        path: '',
        children: [
            { path: 'organization', component: OrganizationComponent },
            { path: 'roles', component: RolesComponent }]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }

export const routedComponents = [
    OrganizationComponent,
    RolesComponent
];
