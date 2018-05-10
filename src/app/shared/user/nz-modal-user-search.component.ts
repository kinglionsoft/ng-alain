import { Component, EventEmitter } from '@angular/core';
import { SimpleTableColumn } from '@delon/abc';
import { UserClient, UserListDto } from '@abp';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'nz-modal-user-search-component',
    template: `
    <simple-table #st 
        [data]="data" 
        [total]="total" 
        [ps]="ps" 
        [pi]="pi"
        [columns]="columns"
        (change)="change"
        (radioChange)="radioChange"
        >
    </simple-table>
  `
})
export class NzModalUserSearchComponent {
    data = [];
    pi = 1;
    ps = 10;
    total = 0;
    columns: SimpleTableColumn[] = [
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
    value: UserListDto;
    change = new EventEmitter<any>();
    radioChange = new EventEmitter<any>();

    constructor(private client: UserClient) {
        this.change
            .subscribe((res) => {
                console.dir(res);
            });
        this.radioChange.subscribe(res => {
            console.log(res);
        });

        this.load();
    }

    private load() {
        this.client.getUsers('', '', null, '', this.ps, (this.pi - 1) * this.ps)
            .subscribe(res => {
                this.total = res.result.totalCount;
                this.data = res.result.items;
            });
    }
}
