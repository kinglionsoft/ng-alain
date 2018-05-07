import { Injector } from '@angular/core';
import { AbpSettingService, LogService } from '@abp';
import { NzMessageService } from 'ng-zorro-antd';


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
}