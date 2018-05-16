import { Component, EventEmitter, Output, Input, ViewChild, OnInit } from '@angular/core';
import { NzFormatEmitEvent, NzTreeNode, NzTreeComponent } from 'ng-zorro-antd';
import { RoleClient } from '@abp';
import { element } from 'protractor';

@Component({
    selector: 'sf-permission-tree',
    template: `
    <p>
        <nz-input-group [nzSuffix]="suffixIcon">
            <input type="text" nz-input placeholder="搜索···" [(ngModel)]="searchValue">
        </nz-input-group>
        <ng-template #suffixIcon>
            <i class="anticon anticon-search"></i>
        </ng-template>
    </p>
    <nz-tree #permissionTree
        [(ngModel)]="nodes" 
        [nzSearchValue]="searchValue" 
        (nzCheckBoxChange)="mouseAction($event)" 
        nzShowLine="true"        
        nzMultiple="true"
        nzCheckable="true"
        nzCheckStrictly="true"
        nzDraggable="false">
        <ng-template #nzTreeTemplate let-node>
            <span>                    
                <i class="text-orange anticon" [ngClass]="{'anticon-folder-open': node.isExpanded, 'anticon-folder': !node.isExpanded}"></i>
                <span [ngClass]="{'text-primary': node.isSelected}"> {{node.title}}</span>
            </span>
      </ng-template>
    </nz-tree>`
})

export class PermissionTreeComponent implements OnInit {

    _role = 0;

    nodes: NzTreeNode[] = [];

    @Output()
    eventCallback: EventEmitter<NzFormatEmitEvent> = new EventEmitter<NzFormatEmitEvent>();

    /** Usage: (checkedNodes)="checkedPermissions=$event" */
    @Output('checkedNodes')
    checkedNodesChange = new EventEmitter<string[]>();

    @Input()
    set role(value: number) {
        if (!value || value < 0 || isNaN(value)) {
            this._role = 0;
            this.bindingGranted([]);
            return;
        }
        if (this._role === value) return;
        this._role = value;
        this.load();
    }

    get role() {
        return this._role;
    }

    @ViewChild('permissionTree') permissionTree: NzTreeComponent;

    constructor(private client: RoleClient) { }

    ngOnInit(): void {
        this.client.getAllPermissions()
            .subscribe(res => {
                this.makeTree(res.result.items, null, 0, null);
            });
    }

    load() {
        if (this._role <= 0) { // clear checked
            this.bindingGranted([]);
            return;
        }
        this.client.getRoleForEdit(this._role)
            .subscribe(res => {
                this.bindingGranted(res.result.grantedPermissionNames);
            });
    }

    mouseAction(event: NzFormatEmitEvent): void {
        this.checkedNodesChange.next(event.checkedKeys.map(x => x.key).sort()); // order
        this.eventCallback.next(event);
    }

    private bindingGranted(grantedPermissionNames: string[]) {
        if (!grantedPermissionNames) return;
        this.uncheck(Object.assign([], this.permissionTree.getCheckedNodeList()));

        for (const p of grantedPermissionNames) {
            this.bindingNodes(this.nodes, p);
        }
        this.checkedNodesChange.next(this.permissionTree.getCheckedNodeList().map(x => x.key).sort());
    }

    private uncheck(list: NzTreeNode[]) {
        list.forEach(element => {
            if (element.isChecked) {
                element.isChecked = false;
                this.checkNode(element);
            }
        });
    }

    private bindingNodes(nodeList: NzTreeNode[], permission: string): boolean {
        for (const n of nodeList) {
            if (n.key === permission) {
                n.isChecked = true;
                this.checkNode(n);
                return true;
            }

            if (n.children && n.children.length > 0) {
                if (this.bindingNodes(n.children, permission)) {
                    return true;
                }
            }
        }
        return false;
    }

    private checkNode(n: NzTreeNode) {
        this.permissionTree.nzTreeService.checkTreeNode(n);
        this.permissionTree.nzTreeService.setCheckedNodeList(n);
    }

    private makeTree(permisstons: any[], node: NzTreeNode, next: number, grantedPermissionNames: string[]) {
        if (next >= permisstons.length) return;
        const nextNode = this.makeNode(permisstons[next], grantedPermissionNames);
        const nextNodePcode = this.getParentCode(permisstons[next].name);
        if (next === 0 || nextNodePcode === '') { // root
            this.nodes.push(nextNode);
        } else if (nextNodePcode === node.key) { // child
            node.addChildren([nextNode]);
        } else { // child of one ancestor
            let parent = node.parentNode;
            while (parent) {
                if (parent.key === nextNodePcode) {
                    parent.addChildren([nextNode]);
                    break;
                }
                parent = parent.parentNode;
            }
            if (!parent) {// no ancestor, but a root
                this.nodes.push(nextNode);
            }
        }
        this.makeTree(permisstons, nextNode, next + 1, grantedPermissionNames);
    }

    private makeNode(ou: any, grantedPermissionNames: string[]): NzTreeNode {
        const node = new NzTreeNode({
            title: ou.displayName,
            key: ou.name,
            expanded: false,
            checked: grantedPermissionNames && grantedPermissionNames.some(x => x === ou.name),
            children: [],
        });
        node.origin = ou;
        return node;
    }
    private getParentCode(code: string) {
        return code.substr(0, code.lastIndexOf('.'));
    }
}
