import { NgModule  , Injector} from '@angular/core';
import { HttpModule, JsonpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { CookieService } from 'ngx-cookie-service';
import { LogService } from './log/log.service';
import { UtilsService } from './utils/utils.service';
import { AbpSessionService } from './session/abp-session.service';
import { AbpMultiTenancyService } from './multi-tenancy/abp-multi-tenancy.service';

import { FeatureCheckerService } from './features/feature-checker.service';
import { AbpSettingService } from './settings/setting.service';


@NgModule({
    imports: [
        HttpModule,
        JsonpModule
    ],

    declarations: [
    ],
    providers: [
        LogService,
        UtilsService,
        AbpSessionService,
        AbpMultiTenancyService,
        FeatureCheckerService,
        CookieService
    ]
})
export class AbpModule {

}
