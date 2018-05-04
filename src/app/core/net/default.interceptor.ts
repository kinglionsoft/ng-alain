import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse,
         HttpSentEvent, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent,
       } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { mergeMap, catchError } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { DelonAuthConfig } from '@delon/auth';

/**
 * 默认HTTP拦截器，其注册细节见 `app.module.ts`
 */
@Injectable()
export class DefaultInterceptor implements HttpInterceptor {

    private _allow_anonymous_key: string;
    
    constructor(private injector: Injector) {
        this._allow_anonymous_key = injector.get(DelonAuthConfig).allow_anonymous_key;
    }

    get msg(): NzMessageService {
        return this.injector.get(NzMessageService);
    }

    private goTo(url: string) {
        setTimeout(() => this.injector.get(Router).navigateByUrl(url));
    }

    private handleData(event: HttpResponse<any> | HttpErrorResponse): Observable<any> {
        // 可能会因为 `throw` 导出无法执行 `_HttpClient` 的 `end()` 操作
        this.injector.get(_HttpClient).end();
        // 业务处理：一些通用操作
        switch (event.status) {
            case 200:
                // 业务层级错误处理
                if (event instanceof HttpResponse) {
                    const body: any = event.body;
                    if (body && !body.success) {
                        this.msg.error(body.error);
                        // 继续抛出错误中断后续所有 Pipe、subscribe 操作，因此：
                        // this.http.get('/').subscribe() 并不会触发
                        return ErrorObservable.throw(event);
                    } else {
                        // 重新修改 `body` 内容为 `response` 内容，对于绝大多数场景已经无须再关心业务状态码
                        return of(new HttpResponse(Object.assign(event, { body: body.response }))); 
                    }
                }
                break;
            case 401: // 未登录状态码
                this.goTo('/passport/login');
                break;
            case 403:
            case 404:
            case 500:
                this.goTo(`/${event.status}`);
                break;
            default:
                if (event instanceof HttpErrorResponse) {
                    console.warn('未可知错误，大部分是由于后端不支持CORS或无效配置引起', event);
                    this.msg.error(event.message);
                }
                break;
        }
        return of(event);
    }

    intercept(req: HttpRequest<any>, next: HttpHandler):
        Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {

        // 统一加上服务端前缀
        let url = req.url;
        if (!url.startsWith('https://') && !url.startsWith('http://') && !url.startsWith('/assets/')) {
            url = environment.SERVER_URL + url;
        }

         // allow_anonymous_key仅用于JWTInterceptor判断是否要添加token，实际请求前去掉请求参数中的allow_anonymous_key
        req.params && req.params.delete(this._allow_anonymous_key);
        const newReq = req.clone({
            url: url
        });
        return next.handle(newReq).pipe(
                    mergeMap((event: any) => {
                        // 允许统一对请求错误处理，这是因为一个请求若是业务上错误的情况下其HTTP请求的状态是200的情况下需要
                        if (event instanceof HttpResponse && event.status === 200)
                            return this.handleData(event);
                        // 若一切都正常，则后续操作
                        return of(event);
                    }),
                    catchError((err: HttpErrorResponse) => this.handleData(err))
                );
    }
}
