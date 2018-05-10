import { concat } from 'rxjs/observable/concat';
import { inject } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Injector } from '@angular/core';
import { AbpSettingService, LogService } from '@abp';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { NzModalPromptComponent } from './prompt/nz-modal-prompt.component';
import { ModalHelper } from '@delon/theme';

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

    prompt(title?: string, value?: string, placeholder?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const modal = this.injector.get(NzModalService).create({
                nzTitle: title || '请输入',
                nzContent: NzModalPromptComponent,
                nzComponentParams: {
                    placeholder: placeholder || '请输入',
                },
                nzOnOk: (componentInstance) => {
                    if (this.validate(componentInstance.value)) {
                        resolve(componentInstance.value);
                    } else {
                        reject();
                        this.msgBox.error('仅支持中文、英文、数字、-、_');
                    }
                },
                nzOnCancel: () => reject()
            });
        });
    }

    confirm(title: string, content: string) {
        // return this.modalHelper.open(null, null, 'sm', {  nzTitle: title,
        //     nzContent: content,
        //  });
        return this.modalHelper.static(null, null, 'sm', {
            nzTitle: title,
            nzContent: content,
            nzFooter: [{
                label: '确定', 
                type: 'primary',
                onClick: ()=>{
                    this.injector.get(NzModalRef).close();
                }
            }, {
                label: '取消', type: 'default'
            }
            ]
        });
    }

    validate(value: string): boolean {
        return /^[\u4E00-\u9FA5A-Za-z0-9_-]+$/.test(value);
    }
}
