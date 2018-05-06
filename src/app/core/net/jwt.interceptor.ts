import { JWTInterceptor, DelonAuthConfig, DA_SERVICE_TOKEN, JWTTokenModel } from '@delon/auth';
import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';

@Injectable()
export class AbpJWTInterceptor extends JWTInterceptor {

    constructor(injector: Injector) {
        super(injector);
    }

    isAuth(options: DelonAuthConfig): boolean {
        this.model = this.injector.get(DA_SERVICE_TOKEN).get(JWTTokenModel);
        if (!this.model) {
            this.model = { token: '_na_' };
        }
        return true; // 本地不检查token是否有效
    }
}
