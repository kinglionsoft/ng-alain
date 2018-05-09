import { Component, OnInit, Injector } from '@angular/core';
import { AppComponentBase } from '@shared';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd';
import { OrganizationUnitClient, ListResultDtoOfOrganizationUnitDto, OrganizationUnitDto, CreateOrganizationUnitInput } from '@abp';
import { runInThisContext } from 'vm';

@Component({
    selector: 'page-organization',
    templateUrl: 'organization.component.html'
})

export class OrganizationComponent extends AppComponentBase implements OnInit {

    nodes = [];

    constructor(injector: Injector,
        private client: OrganizationUnitClient
    ) {
        super(injector);
    }

    ngOnInit() {
        this.client.getOrganizationUnits()
            .subscribe(response => {
                if (response.success) {
                    this.makeTree(response.result.items, null, 0);
                } else {
                    this.msgBox.error(response.error);
                }
            }, err => this.msgBox.error(err || '初始化组织机构失败'));
    }

    mouseAction(name: string, event: NzFormatEmitEvent): void {
        console.log(name, event);
        if (name === 'expand') {

        }
    }

    onNodeClick(event: NzFormatEmitEvent) {
        console.dir(event);
    }

    addRoot() {
        this.prompt('请输入组织名称')
            .then((value) => {
                if (!this.validate(value)) {
                    this.msgBox.error('仅支持中文、英文、数字');
                    return;
                }
                this.client.createOrganizationUnit(
                    <CreateOrganizationUnitInput>
                    {
                        parentId: null,
                        displayName: value
                    })
                    .subscribe(response => {
                        this.nodes.push(this.makeNode(response.result));
                    });
            });
    }

    private makeTree(organizations: OrganizationUnitDto[], node: NzTreeNode, next: number) {
        if (next >= organizations.length) return;
        const nextNode = this.makeNode(organizations[next]);
        const nextNodePcode = this.getParentCode(organizations[next].code);
        if (next === 0) {
            this.nodes.push(nextNode);
        } else if (nextNodePcode === '') {
            this.nodes.push(nextNode);
        } else if (nextNodePcode === node.origin.code) {

            node.addChildren([nextNode]);
        } else if (nextNodePcode === node.parentNode.origin.code) {
            node.parentNode.addChildren([nextNode]);
        }
        this.makeTree(organizations, nextNode, next + 1);
    }

    private makeNode(ou: OrganizationUnitDto): NzTreeNode {
        const node = new NzTreeNode({
            title: ou.displayName,
            key: ou.id.toString(),
            expanded: ou.parentId === null,
            children: [],
        });
        node.origin = ou;
        return node;
    }

    private getParentCode(code: string) {
        return code.substr(0, code.lastIndexOf('.'));
    }
}
