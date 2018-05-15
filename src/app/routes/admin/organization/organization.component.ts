import { Component, OnInit, Injector } from '@angular/core';
import { AppComponentBase } from '@shared';
import { NzFormatEmitEvent, NzTreeNode, NzModalService } from 'ng-zorro-antd';
import { OrganizationUnitClient, ListResultDtoOfOrganizationUnitDto, OrganizationUnitDto, CreateOrganizationUnitInput, OrganizationUnitUserListDto, UsersToOrganizationUnitInput, UpdateOrganizationUnitInput } from '@abp';
import { runInThisContext } from 'vm';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'page-organization',
    templateUrl: 'organization.component.html',
    styles: [
        `
        .custom-filter-dropdown {
          padding: 8px;
          border-radius: 6px;
          background: #fff;
          box-shadow: 0 1px 6px rgba(0, 0, 0, .2);
        }
        .custom-filter-dropdown
        [nz-input] {
          width: 130px;
          margin-right: 8px;
        }
        .highlight {
          color: #f50;
        }
      `
    ]
})

export class OrganizationComponent extends AppComponentBase implements OnInit {

    private _selectedNode: NzTreeNode;

    userNameSearchValue = '';
    nodes: NzTreeNode[] = [];
    users: OrganizationUnitUserListDto[] = [];
    displayUsers = [...this.users];

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

    // region  OU Tree
    get selectedTitle(): string {
        return this.selectedNode && this.selectedNode.title || '未选择组织';
    }

    get selectedNode(): NzTreeNode {
        return this._selectedNode;
    }

    set selectedNode(node: NzTreeNode) {
        if (!node) {
            this._selectedNode = null;
            this.users = [];
            this.displayUsers = [];
            return;
        }
        if (this._selectedNode && this._selectedNode.key === node.key) {
            return;
        }
        this._selectedNode = node;
        this.getOrganizationUser();
    }

    mouseAction(name: string, event: NzFormatEmitEvent): void {
        console.log(name, event);
        if (name === 'expand') {

        }
    }

    onNodeClick(event: NzFormatEmitEvent) {
        this.selectedNode = event.node;
    }

    addOrganization(parent: NzTreeNode) {
        this.prompt('新增组织', '', '请输入组织名称')
            .subscribe((value) => {
                this.client.createOrganizationUnit(
                    <CreateOrganizationUnitInput>{
                        parentId: parent && parent.origin.id,
                        displayName: value
                    })
                    .subscribe(response => {
                        const child = this.makeNode(response.result);
                        if (!parent) { // 根组织
                            this.nodes.push(this.makeNode(response.result));
                        } else {
                            parent.addChildren([child]);
                        }
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

    private removeNode(node: NzTreeNode) {
        const upperNodes = node.parentNode && node.parentNode.children || this.nodes;
        for (let index = 0; index < upperNodes.length; index++) {
            const element = upperNodes[index];
            if (element.key === node.key) {
                upperNodes.splice(index, 1);
            }
        }
    }
    // endregion

    // region Organization

    search(): void {
        const filterFunc = (item) => {
            return item.name.indexOf(this.userNameSearchValue) !== -1;
        };
        this.displayUsers = this.users.filter(item => filterFunc(item));
    }

    addUser(): void {
        this.searchUser()
            .subscribe(res => {
                if (res && res.length > 0) {
                    this.client.addUsersToOrganizationUnit(<UsersToOrganizationUnitInput>{
                        organizationUnitId: this.selectedNode.origin.id,
                        userIds: res.map(x => x.id)
                    }).subscribe(response => {
                        if (response.success) {
                            this.getOrganizationUser();
                        }
                    });
                }
            });
    }

    deleteOrg(): void {
        if (!this.selectedNode) return;
        this.warning('删除组织', `是否删除【${this.selectedNode.title}】`)
            .subscribe(() => {
                this.client.deleteOrganizationUnit(this.selectedNode.origin.id)
                    .subscribe(res => {
                        if (res.success) {
                            this.removeNode(this.selectedNode);
                            this.selectedNode = null;
                        }
                    });
            });
    }

    removeUser(user: OrganizationUnitUserListDto, index: number): void {

        this.warning('移除用户', `是否将【${user.name}】从【${this.selectedNode.title}】中移除？`)
            .pipe(
                switchMap(() => this.client.removeUserFromOrganizationUnit(user.id, this.selectedNode.origin.id))
            )
            .subscribe(res => {
                if (res.success) {
                    setTimeout(() => {
                        this.displayUsers.splice(index, 1);
                        this.displayUsers = [...this.displayUsers];
                    }, 0);
                    for (let index = 0; index < this.users.length; index++) {
                        const element = this.users[index];
                        if (element.id === user.id) {
                            this.users.splice(index, 1);
                            break;
                        }
                    }
                }
            });
    }

    editOrg() {
        this.prompt('修改组织', this.selectedNode.title)
            .pipe(
                switchMap((value) => this.client.updateOrganizationUnit(<UpdateOrganizationUnitInput>{
                    id: this.selectedNode.origin.id,
                    displayName: value
                }))
            )
            .subscribe(res => {
                if (res.success) {
                    this.selectedNode.title = res.result.displayName;
                }
            });
    }

    private getOrganizationUser() {
        this.users = [];
        this.client.getOrganizationUnitUsers(this._selectedNode.origin.id, '', 999, 0)
            .subscribe(res => {
                this.users = res.result.items;
                this.displayUsers = [... this.users];
            });
    }

    // endregion
}
