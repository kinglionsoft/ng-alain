import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationComponent } from './organization/organization.component';
import { RolesComponent } from './roles/roles.component';
import { UserComponent } from './user/user.component';


const routes: Routes = [
    {
        path: '',
        children: [
            { path: 'organization', component: OrganizationComponent },
            { path: 'role', component: RolesComponent },
            { path: 'user', component: UserComponent }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }

export const routedComponents = [
    OrganizationComponent,
    RolesComponent,
    UserComponent
];
