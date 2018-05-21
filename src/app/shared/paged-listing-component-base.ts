/* tslint:disable */
import { AppComponentBase } from './app-component-base';
import { Injector, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { SimpleTableColumn, SimpleTableComponent, SimpleTableData } from '@delon/abc';
import { Observable } from 'rxjs/Observable';
import { AbpResult } from '@abp';
import { mergeMap } from 'rxjs/operators';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { of } from 'rxjs/observable/of';

export interface PagedResponseDto {
    items: any[];
    totalCount: number;
}

export interface PagedRequestDto {
    skipCount: number;
    maxResultCount: number;
}

export class SimpleTablePager {
    pageSize = 10;
    pageIndex = 1;
    totalPages = 1;
    totalItems = 0;
    data = [];

    constructor(
        public columns: SimpleTableColumn[],
        private dataAccessor: (req: PagedRequestDto) => Observable<AbpResult<PagedResponseDto>>) {
    }

    refresh(): void {
        this.goToPage(this.pageIndex);
    }

    private showPaging(result: PagedResponseDto, pageNumber: number): void {
        this.totalPages = ((result.totalCount - (result.totalCount % this.pageSize)) / this.pageSize) + 1;
        this.data = result.items;
        this.totalItems = result.totalCount;
        this.pageIndex = pageNumber;
    }

    goToPage(page: number): void {
        const req = {
            maxResultCount: this.pageSize,
            skipCount: (page - 1) * this.pageSize
        };

        this.dataAccessor(req)
            .subscribe((response) => {
                this.showPaging(response.result, page);
            });
    }

    /** remove the first row which matches the filter */
    remove(filter: (rowData: any) => boolean) {
        for (let index = 0; index < this.data.length; index++) {
            const element = this.data[index];
            if (filter(element)) {
                this.data.splice(index, 1);
                this.data = [...this.data];
                break;
            }
        }
    }

    insert(row: any, index = 0) {
        this.data.splice(index, 0, row);
        this.data = [...this.data];
    }
}

/**
 * tempate:
  <simple-table #st
   [data]="pager.data"
   [columns]="pager.columns"
   [pi]="pager.pageIndex"
   [ps]="pager.pageSize"
   [total]="pager.totalItems">
  </simple-table>
 */
export abstract class PagedListingComponentBase extends AppComponentBase {

    pager: SimpleTablePager;

    @ViewChildren(SimpleTableComponent)
    _simpleTables: QueryList<SimpleTableComponent>;

    // get simpleTable(): SimpleTableComponent {
    //     return this._simpleTables.first;
    // }
    @ViewChild('st')
    simpleTable: SimpleTableComponent;

    constructor(injector: Injector) {
        super(injector);
        this.pager = new SimpleTablePager(
            this.generateColumns(),
            req => this.getTableData(req)
                .pipe(
                    mergeMap((res) => {
                        if (!res.result.hasOwnProperty('totalCount') || !res.result.hasOwnProperty('items')) {
                            console.error('请手动将分页请求结果转换为PagedResponseDto');
                            return ErrorObservable.throw('请手动将分页请求结果转换为PagedResponseDto');
                        }
                        return of(res);
                    })));
    }

    protected abstract getTableData(req: PagedRequestDto): Observable<AbpResult<any>>;

    protected abstract generateColumns(): SimpleTableColumn[];

    protected _clearCheck() {
        this.simpleTable.clearCheck();
    }

    protected _checkTableRows(filter: (row: SimpleTableData) => boolean, clearFirst = true) {
        if (clearFirst) {
            this.simpleTable.clearCheck();
        }
        for (const row of this.simpleTable._data) {
            if (filter(row)) {
                this.simpleTable._checkSelection(row, true);
            }
        }
    }
}
