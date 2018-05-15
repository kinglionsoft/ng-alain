import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NzFormatEmitEvent, NzTreeNode } from 'ng-zorro-antd';
import { OrganizationUnitDto, OrganizationUnitClient } from '@abp';

@Component({
    selector: 'sf-org-tree',
    template: `
    <p>
        <nz-input-group [nzSuffix]="suffixIcon">
            <input type="text" nz-input placeholder="搜索···" [(ngModel)]="searchValue">
        </nz-input-group>
        <ng-template #suffixIcon>
            <i class="anticon anticon-search"></i>
        </ng-template>
    </p>
    <nz-tree 
        [(ngModel)]="nodes" 
        [nzSearchValue]="searchValue" 
        (nzExpandChange)="mouseAction($event)" 
        nzShowLine="true"
        (nzClick)="mouseAction($event)" 
        nzDraggable="false">
        <ng-template #nzTreeTemplate let-node>
            <span>                    
                <i class="text-orange anticon" [ngClass]="{'anticon-folder-open': node.isExpanded, 'anticon-folder': !node.isExpanded}"></i>
                <span [ngClass]="{'text-primary': node.isSelected}"> {{node.title}}</span>
            </span>
      </ng-template>
    </nz-tree>`
})

export class OrganizationTreeComponent implements OnInit {

    nodes: NzTreeNode[] = [];

    @Output()
    eventCallback: EventEmitter<NzFormatEmitEvent> = new EventEmitter<NzFormatEmitEvent>();

    constructor(private client: OrganizationUnitClient) { }

    ngOnInit() {
        this.client.getOrganizationUnits()
            .subscribe(response => {
                if (response.success) {
                    this.makeTree(response.result.items, null, 0);
                }
            });
    }

    mouseAction(event: NzFormatEmitEvent): void {
        this.eventCallback.next(event);
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
        } else {
            let parent = node.parentNode;
            while (parent) {
                if (parent.origin.code === nextNodePcode) {
                    parent.addChildren([nextNode]);
                    break;
                }
                parent = parent.parentNode;
            }
                        
            if (!parent) { // no ancestor, but a root
                this.nodes.push(nextNode);
            }
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

    private removeNode(node: NzTreeNode) {
        const upperNodes = node.parentNode && node.parentNode.children || this.nodes;
        for (let index = 0; index < upperNodes.length; index++) {
            const element = upperNodes[index];
            if (element.key === node.key) {
                upperNodes.splice(index, 1);
            }
        }
    }
}