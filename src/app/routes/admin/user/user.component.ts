import { Component, OnInit, Injector, EventEmitter, ViewEncapsulation } from '@angular/core';
import { PagedListingComponentBase, PagedRequestDto, PagedResponseDto } from '@shared';
import { Observable } from 'rxjs/Observable';
import { AbpResult, UserClient, UserListDto, UserEditDto } from '@abp';
import { SimpleTableColumn } from '@delon/abc';
import { mergeMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { of } from 'rxjs/observable/of';

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
    selectedRoles: string[];

    constructor(injector: Injector, private client: UserClient, fb: FormBuilder) {
        super(injector);

        this.form = fb.group({
            name: [null, [Validators.required]],
            userName: [null, [Validators.required]],
            emailAddress: [null, [Validators.required]],
            phoneNumber: [null, [Validators.required]],
            password: [null, []],
            checkPassword: [null, [this.confirmationValidator]],
            shouldChangePasswordOnNextLogin: [null, []],
            isTwoFactorEnabled: [null, []],
            isLockoutEnabled: [null, []],
            setRandomPassword: [null, []]
        });
    }

    get selectedUserName() {
        return this.selectedUser && this.selectedUser.name || '未选择用户';
    }

    get selectedUserProfilePicUrl(): string {
        return this.selectedUser && this.selectedUser.profilePictureId;
    }

    ngOnInit() {
        this.reset();
        this.pager.refresh();
    }

    onSelectedChange(u: any) {
        this.selectedUser = u;
        this.client.getUserForEdit(this.selectedUser.id)
            .subscribe(res => {
                this.form.reset();
                for (const key in this.form.controls) {
                    if (res.result.user.hasOwnProperty(key)) {
                        this.form.controls[key].setValue(res.result.user[key]);
                    }
                }
                this.form.controls['setRandomPassword'].setValue(false);
                this.selectedRoles = res.result.roles;
                this.selectedOrganization = res.result.memberedOrganizationUnits;
            });
    }

    unlock() {
        this.requestAfterWarning('解锁用户',
            `是否解锁【${this.selectedUser.name}】？`,
            () => this.client.unlockUser(<any>{ id: this.selectedUser.id }));
    }

    active() {
        this.requestAfterWarning('激活用户',
            `是否激活【${this.selectedUser.name}】？`,
            () => this.client.active(<any>{ id: this.selectedUser.id })
                .pipe(mergeMap((res) => {
                    if (res.success) {
                        this.selectedUser.isActive = true;
                    }
                    return of(res);
                })));
    }

    delete() {
        this.requestAfterWarning('删除用户',
            `是否删除【${this.selectedUser.name}】？`,
            () => this.client.deleteUser(this.selectedUser.id));
    }

    reset() {
        this.selectedUser = undefined;
        this.selectedRoles = [];
        this.selectedOrganization = [];
    }

    confirmationValidator = (control: FormControl): { [s: string]: boolean } => {
        if (!control.value) {
            return { required: true };
        } else if (control.value !== this.form.controls.password.value) {
            return { confirm: true, error: true };
        }
    }

    _submitForm() {
        if (!this.form.dirty || this.form.invalid) {
            this.msgBox.error('请完成填写信息');
            return;
        }
        this.requestAfterWarning('保存', '是否保存当前信息？',
            () => {
                const formData = this.form.getRawValue();
                const user = new UserEditDto();
                user.init(formData);
                user.id = this.selectedUser && this.selectedUser.id;
                user.isActive = this.selectedUser.isActive;
                user.surname = this.selectedUser.surname || user.name.substr(0, 1);
                return this.client.createOrUpdateUser(<any>{
                    user: user,
                    assignedRoleNames: this.selectedRoles,
                    setRandomPassword: formData.setRandomPassword,
                    organizationUnits: this.selectedOrganization
                }).pipe(mergeMap(res => {
                    if (res.success) {
                        if (this.selectedUser) {
                            this.selectedUser.name = formData.name;
                            this.selectedUser.userName = formData.userName;
                            this.selectedUser.emailAddress = formData.emailAddress;
                        } else {
                            this.ngOnInit();
                        }
                    }
                    return of(res);
                }));
            });
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
