import { Injectable } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';
import { Abp, abp } from '../abp';
import * as moment from 'moment';

@Injectable()
export class UtilsService {

    constructor (
        private cookie: CookieService
    ) {

    }

    getCookieValue(key: string): string {
        return this.cookie.get(key);
    }

    setCookieValue(key: string, value: string, expireDate?: Date, path?: string): void {
        this.cookie.set(key, value, expireDate, path);
    }

    deleteCookie(key: string, path?: string): void {
        this.cookie.delete(key, path);
    }

    initAbpGlobal(result){
        Abp.multiTenancy.setGlobal(result.multiTenancy);
        Abp.session.setGlobal(result.session);
        Abp.localization.setGlobal(result.localization);
        Abp.features.setGlobal(result.features);
        Abp.setting.setGlobal(result.setting);

        Abp.clock.setGloabl(result.clock);
        Abp.timing.setGloabl(result.timing);

        Abp.clock.provider = this.getCurrentClockProvider(result.clock.provider);

        moment.locale(Abp.localization.currentCulture.name);

        if (Abp.clock.provider.supportsMultipleTimezone) {
            const mt: any = moment;
            mt.tz.setDefault(Abp.timing.timeZoneInfo.iana.timeZoneId);
        }
    }

    
    private getCurrentClockProvider(currentProviderName: string): abp.timing.IClockProvider {
        if (currentProviderName === "unspecifiedClockProvider") {
            return Abp.timing.unspecifiedClockProvider;
        }

        if (currentProviderName === "utcClockProvider") {
            return Abp.timing.utcClockProvider;
        }

        return Abp.timing.localClockProvider;
    }
}
