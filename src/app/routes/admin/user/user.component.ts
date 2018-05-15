import { Component, OnInit, Injector, EventEmitter } from '@angular/core';
import { AppComponentBase } from '@shared';
import { NzFormatEmitEvent } from 'ng-zorro-antd';

@Component({
    selector: 'page-admin-user',
    templateUrl: 'user.component.html'
})

export class UserComponent extends AppComponentBase implements OnInit {
    
    selectedUser: any;
    
    constructor(injector: Injector) {
        super(injector);
    }

    get selectedUserName() {
        return this.selectedUser && this.selectedUser.name || '未选择用户';
    }

    ngOnInit() { 
    }

    onOrgCallback(event: NzFormatEmitEvent){
        console.log(event);
        if(event.eventName === 'click') {

        }
    }
}
