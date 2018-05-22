import { Component, OnInit, Output, EventEmitter, Input, Injector, forwardRef } from '@angular/core';
import { PagedListingComponentBase, PagedRequestDto, PagedResponseDto } from '@shared';
import { Observable } from 'rxjs/Observable';
import { AbpResult, RoleClient, RoleListDto } from '@abp';
import { SimpleTableColumn } from '@delon/abc';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'sf-role-select',
    template: `
    <p>
        <input nz-input placeholder="请输入要查找的姓名" #search class="width-md mr-md" />
        <button nz-button nzType="primary" (click)="pager.search()"><i class="anticon anticon-search"></i> 查询</button>
    </p>
    <p *ngIf="selectedRoleNames && selectedRoleNames.length>0">
        已选择：<nz-tag *ngFor="let r of selectedRoleNames; let even=even;" [nzColor]="even?'#108ee9':''">{{r}}</nz-tag>
    </p>
    <simple-table #st 
        [data]="pager.data"
        [columns]="pager.columns"
        [pi]="pager.pageIndex"
        [ps]="pager.pageSize"
        [total]="pager.totalItems"
        (checkboxChange)="checkboxChange($event)"
        isPageIndexReset>
        <ng-template st-row="property" let-item>
          <span class="badge badge-success">{{item.isStatic ? '系统':''}}</span>
          <span class="badge badge-error">{{item.isDefault ? '默认':''}}</span>
        </ng-template>
    </simple-table>`,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => RoleSelectComponent),
        multi: true
    }]
})

export class RoleSelectComponent
    extends PagedListingComponentBase
    implements OnInit, ControlValueAccessor {

    selectedRoleNames: string[];

    public onModelChange: Function = () => { };
    public onModelTouched: Function = () => { };

    private _popChange = false;

    set selected(value: string[]) {
        if (!value) {
            this._clearCheck();
            return;
        }
        this._checkTableRows(row => {
            return value.indexOf(row.name) > -1;
        });
        this._popChange = false;
    }

    constructor(injector: Injector, private client: RoleClient) {
        super(injector);
    }

    ngOnInit() {
        this.pager.refresh();
    }

    checkboxChange(list: RoleListDto[]) {
        this.selectedRoleNames = list.map(x => x.displayName);
        if (!this._popChange) {
            this._popChange = true;
            return;
        }
        this.onModelChange(list.map(x => x.name));
    }

    // region pagination
    protected getTableData(req: PagedRequestDto): Observable<AbpResult<PagedResponseDto>> {
        return this.client.getRoles(undefined)
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
            { title: '#', index: 'id', type: 'checkbox', width: '30px' },
            { title: '角色', index: 'name' },
            { title: '名称', index: 'displayName' },
            { title: '属性', render: 'property', width: '50px' }
        ];
    }
    // endregion

    // region two-way binding

    writeValue(obj: any): void {
        this.selected = obj;
    }
    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }
    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }

    // endregion
}
