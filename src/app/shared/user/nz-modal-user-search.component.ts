import { Component, EventEmitter } from '@angular/core';
import { SimpleTableColumn, SimpleTableData } from '@delon/abc';
import { UserClient, UserListDto } from '@abp';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'nz-modal-user-search-component',
    template: `
    <p>
        <input nz-input placeholder="请输入要查找的姓名" [(ngModel)]="searchValue" style="max-width: 200px; margin-right: 20px" />
        <button nz-button nzType="primary" (click)="load()"><i class="anticon anticon-search"></i> 查询</button>
    </p>
    <simple-table #st 
        [data]="data" 
        [total]="total" 
        [ps]="ps" 
        [pi]="pi"
        [columns]="columns"
        (checkboxChange)="checkboxChange($event)"
        >
    </simple-table>
  `
})
export class NzModalUserSearchComponent {
    data = [];
    pi = 1;
    ps = 10;
    total = 0;
    searchValue = '';
    columns: SimpleTableColumn[] = [
        { title: '编号', index: 'id', type: 'checkbox' },
        { title: '姓名', index: 'name' },
        { title: '部门', index: 'department' },
        {
            title: '状态',
            index: 'isActive',
            type: 'yn',
            ynTruth: true,
            ynYes: '正常',
            ynNo: '未激活'
        }
    ];
    value: UserListDto[];

    constructor(private client: UserClient) {      
    }

    load() {
        this.client.getUsers(this.searchValue, '', undefined, '', this.ps, (this.pi - 1) * this.ps)
            .subscribe(res => {
                this.total = res.result.totalCount;
                this.data = res.result.items;
            });
    }

    checkboxChange(list: any[]) {
        this.value = list;
    }
}
