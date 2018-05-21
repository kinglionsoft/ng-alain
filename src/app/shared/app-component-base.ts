import { Observable } from 'rxjs/Observable';
import { Injector } from '@angular/core';
import { Observer } from 'rxjs/Observer';
import { AbpSettingService, LogService, UserListDto, AbpResult } from '@abp';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';

import { ModalHelper } from '@delon/theme';
import { NzModalPromptComponent } from './prompt/nz-modal-prompt.component';
import { NzModalUserSearchComponent } from './user/nz-modal-user-search.component';
import { mergeMap } from 'rxjs/operators';

export abstract class AppComponentBase {

    constructor(protected injector: Injector) { }

    get msgBox(): NzMessageService {
        return this.injector.get(NzMessageService);
    }

    get abpSetting(): AbpSettingService {
        return this.injector.get(AbpSettingService);
    }

    get logger(): LogService {
        return this.injector.get(LogService);
    }

    get modalHelper(): ModalHelper {
        return this.injector.get(ModalHelper);
    }

    prompt(title?: string, value?: string, placeholder?: string): Observable<string> {
        return Observable.create((observer: Observer<string>) => {
            const subject = this.injector.get(NzModalService).create({
                nzTitle: title || '请输入',
                nzContent: NzModalPromptComponent,
                nzComponentParams: {
                    placeholder: placeholder || '请输入',
                },
                nzOnOk: (componentInstance) => {
                    if (this.validate(componentInstance.value)) {
                        observer.next(componentInstance.value);
                    } else {
                        this.msgBox.error('仅支持中文、英文、数字、-、_');
                    }
                },
                nzOnCancel: () => { }
            });
            subject.open();
            const afterClose$ = subject.afterClose.subscribe((res: any) => {
                observer.complete();
                afterClose$.unsubscribe();
            });
        });
    }

    warning(title: string, content: string): Observable<any> {
        return Observable.create((observer: Observer<any>) => {
            const subject = this.injector.get(NzModalService)
                .warning({
                    nzTitle: title,
                    nzContent: content,
                    nzCancelText: '取消',
                    nzOnCancel: () => {
                    },
                    nzOkText: '确定',
                    nzOnOk: () => observer.next('ok')
                });
            subject.open();
            const afterClose$ = subject.afterClose.subscribe((res: any) => {
                observer.complete();
                afterClose$.unsubscribe();
            });
        });
    }

    requestAfterWarning(title: string, content: string, onOk: () => Observable<AbpResult<any>>, success = '操作成功') {
        this.warning(title, content)
            .pipe(
                mergeMap(() => onOk())
            ).subscribe(response => {
                if (response.success) {
                    this.msgBox.success(success);
                }
            });
    }

    validate(value: string): boolean {
        return /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/.test(value);
    }

    searchUser(): Observable<UserListDto[]> {
        return Observable.create((observer: Observer<UserListDto[]>) => {
            const subject = this.injector.get(NzModalService).create({
                nzTitle: '选择用户',
                nzContent: NzModalUserSearchComponent,
                nzOnOk: (componentInstance) => {
                    if (componentInstance.value) {
                        observer.next(componentInstance.value);
                    } else {
                        observer.complete();
                    }
                },
                nzOnCancel: () => { }
            });
            subject.open();
            const afterClose$ = subject.afterClose.subscribe((res: any) => {
                observer.complete();
                afterClose$.unsubscribe();
            });
        });
    }
}
