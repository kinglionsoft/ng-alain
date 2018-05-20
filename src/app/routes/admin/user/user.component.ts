import { Component, OnInit, Injector, EventEmitter, ViewEncapsulation } from '@angular/core';
import { PagedListingComponentBase, PagedRequestDto, PagedResponseDto } from '@shared';
import { Observable } from 'rxjs/Observable';
import { AbpResult, UserClient, UserListDto } from '@abp';
import { SimpleTableColumn } from '@delon/abc';
import { mergeMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
    selector: 'page-admin-user',
    templateUrl: 'user.component.html',
    styleUrls: ['./user.component.less'],
    encapsulation: ViewEncapsulation.None,
})

export class UserComponent extends PagedListingComponentBase implements OnInit {

    selectedUser: UserListDto;
    searchValue = '';
    form: FormGroup;
    selectedOrganization: number[];
    checkedPermissions: string[];
    selectedRoles: string[];

    constructor(injector: Injector, private client: UserClient, fb: FormBuilder) {
        super(injector);

        this.form = fb.group({
            name: [null, [Validators.required]],
            userName: [null, [Validators.required]],
            emailAddress: [null, [Validators.required]],
            phoneNumber: [null, [Validators.required]],
            password: [null, [Validators.required]],
            checkPassword: [null, [Validators.required, this.confirmationValidator]],
            isActive: [null, [Validators.required]],
            shouldChangePasswordOnNextLogin: [null, [Validators.required]],
            isTwoFactorEnabled: [null, [Validators.required]],
            isLockoutEnabled: [null, [Validators.required]],
            setRandomPassword: [null, [Validators.required]]
        });
    }

    get selectedUserName() {
        return this.selectedUser && this.selectedUser.name || '未选择用户';
    }

    get selectedUserProfilePicUrl(): string {
        return this.selectedUser && this.selectedUser.profilePictureId;
    }

    ngOnInit() {
        this.pager.refresh();
    }

    onSelectedChange(u: any) {
        this.selectedUser = u;
        this.client.getUserForEdit(this.selectedUser.id)
            .subscribe(res => {
                for (const key in this.form.controls) {
                    if (res.result.user.hasOwnProperty(key)) {
                        this.form.controls[key].setValue(res.result.user[key]);
                    }
                }

            });
    }

    unlock() {
        this.doAfterWarning('解锁用户',
            `是否解锁【${this.selectedUser.name}】？`,
            () => this.client.unlockUser(<any>{ id: this.selectedUser.id }));
    }

    active() {
        this.doAfterWarning('激活用户',
            `是否激活【${this.selectedUser.name}】？`,
            () => this.client.active(<any>{ id: this.selectedUser.id }));
    }

    delete() {
        this.doAfterWarning('删除用户',
            `是否删除【${this.selectedUser.name}】？`,
            () => this.client.deleteUser(this.selectedUser.id));
    }

    confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return { required: true };
        } else if (control.value !== this.form.controls.password.value) {
            return { confirm: true, error: true };
        }
    }

    _submitForm() {

    }
    // region pagination

    protected getTableData(req: PagedRequestDto): Observable<AbpResult<any>> {
        return this.client.getUsers(this.searchValue, '', undefined, undefined, req.maxResultCount, req.skipCount);
    }
    protected generateColumns(): SimpleTableColumn[] {
        return [
            { title: '编号', index: 'id', type: 'radio' },
            { title: '用户名', index: 'userName' },
            { title: '姓名', index: 'name' },
            {
                title: '状态',
                index: 'isActive',
                type: 'yn',
                ynTruth: true,
                ynYes: '正常',
                ynNo: '未激活'
            }
        ];
    }

    // endregion
}
