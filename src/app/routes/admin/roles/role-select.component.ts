import { Component, OnInit, Output, EventEmitter, Input, Injector } from '@angular/core';
import { PagedListingComponentBase, PagedRequestDto, PagedResponseDto } from '@shared';
import { Observable } from 'rxjs/Observable';
import { AbpResult, RoleClient, RoleListDto } from '@abp';
import { SimpleTableColumn } from '@delon/abc';
import { mergeMap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

@Component({
    selector: 'sf-role-select',
    template: `
    <p>
        <input nz-input placeholder="请输入要查找的姓名" #search class="width-md mr-md" />
        <button nz-button nzType="primary" (click)="pager.search()"><i class="anticon anticon-search"></i> 查询</button>
    </p>
    <p *ngIf="selectedRoleNames && selectedRoleNames.length>0">
        已选择：<nz-tag *ngFor="let r of selectedRoleNames; let even=even;" [class.even]="even">{{r}}</nz-tag>
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
    styles: [
        `nz-tag.even { color: red }`
    ]
})

export class RoleSelectComponent extends PagedListingComponentBase implements OnInit {

    selectedRoleNames: string[];

    @Input('selected')
    set selected(value: string[]) {
        if (!value) {
            this._clearCheck();
            return;
        }
        this._checkTableRows(row => {
            return value.indexOf(row.name) > -1;
        });
    }

    @Output('selected')
    selectedChange = new EventEmitter<string[]>();

    constructor(injector: Injector, private client: RoleClient) {
        super(injector);
    }

    ngOnInit() {
        this.pager.refresh();
    }

    checkboxChange(list: RoleListDto[]) {
        this.selectedRoleNames = list.map(x => x.displayName);
        this.selectedChange.next(list.map(x => x.name));
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
}
