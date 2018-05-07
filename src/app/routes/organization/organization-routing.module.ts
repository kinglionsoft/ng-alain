import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrganizationComponent } from './components/organization.component';

const routes: Routes = [
    {
        path: 'manage',
        children: [
            { path: '', component: OrganizationComponent }
        ]
    },
];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [ RouterModule ]
})
export class OrganizatioinRoutingModule { }

export const routedComponents = [OrganizationComponent];
