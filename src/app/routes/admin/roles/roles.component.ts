import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import { PagedListingComponentBase, PagedRequestDto, PagedResponseDto } from '@shared';
import { SimpleTableColumn, SimpleTableComponent } from '@delon/abc';
import { AbpResult, RoleClient, RoleListDto, PermissionDto } from '@abp';
import { Observable } from 'rxjs/Observable';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
    selector: 'page-roles',
    templateUrl: 'roles.component.html'
})

export class RolesComponent extends PagedListingComponentBase implements OnInit {

    searchPermisson: string;
    permissions: PermissionDto[] = [];
    selectedRole: RoleListDto;
    checkedPermissions: string[];
    form: FormGroup;
    @ViewChild('stRole') stRole: SimpleTableComponent;

    constructor(private injctor: Injector, private client: RoleClient, private fb: FormBuilder) {
        super(injctor);

        this.form = this.fb.group({
            name: [null, [Validators.required]],
            displayName: [null, [Validators.required]],
            isDefault: [null, []]
        });
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
        if (this.selectedRole && this.selectedRole.id === item.id) {
            return;
        }
        this.selectedRole = item;
        this.form.controls['name'].setValue(this.selectedRole.name);
        this.form.controls['displayName'].setValue(this.selectedRole.displayName);
        this.form.controls['isDefault'].setValue(this.selectedRole.isDefault);
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
            { title: '名称', index: 'displayName' },
            { title: '属性', render: 'property', width: '50px' },
            { title: '创建时间', index: 'creationTime', type: 'date' }
        ];
    }
    // endregion

    // region permission

    get selectedRoleName() {
        return this.selectedRole && this.selectedRole.displayName || '未选择角色';
    }

    create() {
        this.selectedRole = null;
        this.stRole.clearCheck();
        this.form.controls['name'].reset('');
        this.form.controls['displayName'].reset('');
        this.form.controls['isDefault'].reset('');
    }

    save() {
        if (this.form.invalid) {
            this.msgBox.warning('请完善必填信息');
            return;
        }
        const data: any = {
            id: this.selectedRole && this.selectedRole.id,
            name: this.form.controls['name'].value,
            displayName: this.form.controls['displayName'].value,
            isDefault: this.form.controls['isDefault'].value == true
        };

        this.warning('保存修改', '是否保存当前修改')
            .pipe(
                mergeMap(() => this.client.createOrUpdateRole(<any>{
                    grantedPermissionNames: this.checkedPermissions || [],
                    role: data
                }))
            )
            .subscribe(res => {
                if (!this.selectedRole) {
                    const role: RoleListDto = Object.assign({ creationTime: new Date(), id: res.result }, data);
                    this.pager.insert(role);
                } else {
                    this.selectedRole.name = data.name;
                    this.selectedRole.displayName = data.displayName;
                    this.selectedRole.isDefault = data.isDefault;
                }
                this.msgBox.success('保存成功');
            });
    }

    delete() {
        this.warning('删除角色', `是否删除角色-【${this.selectedRoleName}】`)
            .pipe(
                mergeMap(() => this.client.delete(this.selectedRole.id))
            )
            .subscribe(res => {
                this.pager.remove(role => role.id === this.selectedRole.id);
                this.selectedRole = null;
            });
    }
    // endregion
}
