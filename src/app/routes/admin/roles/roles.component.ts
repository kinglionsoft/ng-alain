import { Component, OnInit, Injector } from '@angular/core';
import { PagedListingComponentBase, PagedRequestDto, PagedResponseDto } from '@shared';
import { SimpleTableColumn } from '@delon/abc';
import { AbpResult, RoleClient, RoleListDto, PermissionDto } from '@abp';
import { Observable } from 'rxjs/Observable';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Component({
    selector: 'page-roles',
    templateUrl: 'roles.component.html'
})

export class RolesComponent extends PagedListingComponentBase implements OnInit {

    searchPermisson: string;
    permissions: PermissionDto[] = [];
    selectedRole: RoleListDto;

    constructor(private injctor: Injector, private client: RoleClient) {
        super(injctor);
    }

    ngOnInit() {
        this.getRoles();
        this.client.getAllPermissions()
            .subscribe(res => {
                this.showPermissionOption(res.result.items);
            });
    }

    // region roles

    getRoles() {
        this.pager.refresh();
    }

    radioChange(item: RoleListDto) {

    }

    private showPermissionOption(data: PermissionDto[]) {
        this.permissions = data.map(x => {
            const parts = x.name.split('.');
            x.displayName = parts.map((a, i) => i < (parts.length - 1) ? '----' : a).join('');
            return x;
        });
    }

    // endregion

    // region pagination
    protected getTableData(req: PagedRequestDto): Observable<AbpResult<PagedResponseDto>> {
        return this.client.getRoles(this.searchPermisson)
            .pipe(
                mergeMap(res => {
                    return of(<AbpResult<PagedResponseDto>>{
                        success: res.success,
                        result: {
                            items: res.result.items,
                            totalCount: res.result.items.length
                        }
                    });
                })
            );
    }
    protected generateColumns(): SimpleTableColumn[] {
        return [
            { title: '#', index: 'id', type: 'radio', width: '30px' },
            { title: '角色', index: 'name' },
            { title: '属性', render: 'property', width: '50px' },
            { title: '创建时间', index: 'creationTime', type: 'date' }
        ];
    }
    // endregion

    // region permission

    get selectedRoleName() {
        return this.selectedRole && this.selectedRole.displayName || '未选择角色';
    }

    editRole() {

    }

    setDefault() {

    }

    deleteRole() {
        this.client.delete(this.selectedRole.id)
            .subscribe(res => {
                this.getRoles();
            });
    }
    // endregion
}
