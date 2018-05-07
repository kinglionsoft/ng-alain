import { Component, OnInit, Injector } from '@angular/core';
import { AppComponentBase } from '@shared';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd';

@Component({
    selector: 'page-organization',
    templateUrl: 'organization.component.html'
})

export class OrganizationComponent extends AppComponentBase implements OnInit {

    expandKeys = ['1001', '10001'];
    checkedKeys = ['100011', '1002'];
    selectedKeys = ['10001', '100011'];
    expandDefault = false;
    nodes = [
        new NzTreeNode({
            title: 'root1',
            key: '1001',
            children: [
                {
                    title: 'child1',
                    key: '10001',
                    children: [
                        {
                            title: 'child1.1',
                            key: '100011',
                            children: []
                        },
                        {
                            title: 'child1.2',
                            key: '100012',
                            children: [
                                {
                                    title: 'grandchild1.2.1',
                                    key: '1000121',
                                    isLeaf: true,
                                    disabled: true
                                },
                                {
                                    title: 'grandchild1.2.2',
                                    key: '1000122',
                                    isLeaf: true
                                }
                            ]
                        }
                    ]
                }
            ]
        }),
        new NzTreeNode({
            title: 'root2',
            key: '1002',
            children: [
                {
                    title: 'child2.1',
                    key: '10021',
                    children: [],
                    disableCheckbox: true
                },
                {
                    title: 'child2.2',
                    key: '10022',
                    children: [
                        {
                            title: 'grandchild2.2.1',
                            key: '100221',
                            isLeaf: true
                        }
                    ]
                }
            ]
        })
    ];

    mouseAction(name: string, event: NzFormatEmitEvent): void {
        console.log(name, event);
    }

    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit() { 
        console.log('ssdfasf');
    }
}