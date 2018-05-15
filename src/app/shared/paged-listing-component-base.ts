/* tslint:disable */
import { AppComponentBase } from './app-component-base';
import { Injector, OnInit } from '@angular/core';
import { SimpleTableColumn } from '@delon/abc';
import { Observable } from 'rxjs/Observable';
import { AbpResult } from '@abp';

export class PagedResponseDto {
    items: any[];
    totalCount: number;
}

export class PagedRequestDto {
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
        const req = new PagedRequestDto();
        req.maxResultCount = this.pageSize;
        req.skipCount = (page - 1) * this.pageSize;

        this.dataAccessor(req)
            .subscribe((response) => {
                this.showPaging(response.result, page);
            });
    }
}

/**
 * tempate:
  <simple-table
   [data]="pager.data"
   [columns]="pager.columns"
   [pi]="pager.pageIndex"
   [ps]="pager.pageSize"
   [total]="pager.totalItems">
  </simple-table>
 */
export abstract class PagedListingComponentBase extends AppComponentBase {

    pager: SimpleTablePager;

    constructor(injector: Injector) {
        super(injector);
        this.pager = new SimpleTablePager(
            this.generateColumns(),
            req => this.getTableData(req));
    }

    protected abstract getTableData(req: PagedRequestDto): Observable<AbpResult<PagedResponseDto>>;

    protected abstract generateColumns(): SimpleTableColumn[];
}
