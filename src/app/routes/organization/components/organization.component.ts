import { Component, OnInit, Injector } from '@angular/core';
import { AppComponentBase } from '@shared';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd';
import { OrganizationUnitClient, ListResultDtoOfOrganizationUnitDto, OrganizationUnitDto } from '@abp';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
    selector: 'page-organization',
    templateUrl: 'organization.component.html'
})

export class OrganizationComponent extends AppComponentBase implements OnInit {

    expandDefault = false;
    nodes = [];
    organizations: OrganizationUnitDto[] = [];

    constructor(injector: Injector,
        private client: OrganizationUnitClient
    ) {
        super(injector);
    }

    ngOnInit() {
        this.client.getOrganizationUnits()
            .subscribe(response => {
                if (response.success) {
                    this.organizations = response.result.items;
                    this.makeTree(response.result.items);
                } else {
                    this.msgBox.error(response.error);
                }
            }, err => this.msgBox.error(err || '初始化组织机构失败'));
    }

    mouseAction(name: string, event: NzFormatEmitEvent): void {
        if (name === 'expand') {
            this.loadChildren(event.node);
        }
    }

    onNodeClick(event: NzFormatEmitEvent) {
        console.dir(event);
    }

    private makeTree(organizations: OrganizationUnitDto[]) {
        this.nodes = [];
        for (const ou of organizations) {
            if (ou.parentId === null) {
                const node = this.makeNode(ou);
                this.loadChildren(node);
                this.nodes.push(node);
            }
        }
    }

    private loadChildren(node: NzTreeNode) {
        if (node.children.length > 0) {
            return;
        }
        const children = [];
        for (const ou of this.organizations) {
            if (this.isChild(node.origin.code, ou.code)) {
                children.push(this.makeNode(ou));
            }
        }
        if (children.length > 0) {
            node.addChildren(children);
        }
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

    private isChild(parentCode: string, childCode: string): boolean {
        return parentCode === childCode.substr(0, childCode.lastIndexOf('.'));
    }
}
