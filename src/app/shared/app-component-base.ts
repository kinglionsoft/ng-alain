import { Injector } from '@angular/core';
import { AbpSettingService, LogService } from '@abp';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { NzModalPromptComponent } from './prompt/nz-modal-prompt.component';

export abstract class AppComponentBase {

    constructor(private injector: Injector) { }

    get msgBox(): NzMessageService {
        return this.injector.get(NzMessageService);
    }

    get abpSetting(): AbpSettingService {
        return this.injector.get(AbpSettingService);
    }

    get logger(): LogService {
        return this.injector.get(LogService);
    }

    get modal(): NzModalService {
        return this.injector.get(NzModalService);
    }

    prompt(title?: string, placeholder?: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const modal = this.modal.create({
                nzTitle: title || '请输入',
                nzContent: NzModalPromptComponent,
                nzComponentParams: {
                    placeholder: placeholder || '请输入',
                },
                nzOnOk: (componentInstance) => resolve(componentInstance.value),
                nzOnCancel: () => reject()
            });
        });
    }

    validate(value: string): boolean {
        return /^[\u4E00-\u9FA5A-Za-z0-9_]+$/.test(value);
    }
}
