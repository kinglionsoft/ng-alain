import { Injectable, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs/observable/zip';
import { concat } from 'rxjs/observable/concat';
import { catchError, mergeMap } from 'rxjs/operators';
import { MenuService, SettingsService, TitleService } from '@delon/theme';
import { ACLService } from '@delon/acl';
import { SessionClient, AbpResult, GetCurrentLoginInformationsOutput } from '@abp';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
    constructor(
        private menuService: MenuService,
        private settingService: SettingsService,
        private aclService: ACLService,
        private titleService: TitleService,
        private httpClient: HttpClient,
        private sessionClient: SessionClient,
        private injector: Injector) { }

    load(): Promise<any> {
        // only works with promises
        // https://github.com/angular/angular/issues/15088
        return new Promise((resolve, reject) => {
            zip(
                this.httpClient.get('/assets/abp-data.json'),
                this.sessionClient.getCurrentLoginInformations(),
                this.httpClient.get('/AbpUserConfiguration/GetAll')
            ).pipe(
                // 接收其他拦截器后产生的异常消息
                catchError(([appData, sessionData, abpConfig]) => {
                    resolve(null);
                    return [appData, sessionData, abpConfig];
                })
            ).subscribe(
                ([appData, sessionData, abpConfig]) => {
                    // setting language data
                    // this.translate.setTranslation(this.i18n.defaultLang, langData);
                    // this.translate.setDefaultLang(this.i18n.defaultLang);

                    // application data
                    const res: any = appData;
                    // 应用信息：包括站点名、描述、年份
                    this.settingService.setApp(res.app);

                    // 设置页面标题的后缀
                    this.titleService.suffix = res.app.name;

                    const session = sessionData as AbpResult<GetCurrentLoginInformationsOutput>;
                    if (!session.success || !abpConfig.success) {
                        console.error(`获取初始化数据失败`);
                        return;
                    }
                    if (session.result.user) {
                        // 初始化菜单
                        this.menuService.add(res.menu);
                        this.menuService.resume();
                        // 角色
                        const roles = Object.getOwnPropertyNames(abpConfig.result.auth.grantedPermissions).concat('__user');
                        this.aclService.setRole(roles);
                        // 
                        this.settingService.setUser({
                            name: session.result.user.name,
                            email: session.result.user.emailAddress,
                            id: session.result.user.id,
                            avatar: session.result.user.profilePictureId || './assets/img/avatar.jpg'
                        });
                    }
                    resolve(null);
                },
                () => { },
                () => {
                    resolve(null);
                });
        });
    }
}
