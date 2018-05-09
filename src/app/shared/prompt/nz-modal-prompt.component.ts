import { Component } from '@angular/core';

@Component({
    selector: 'nz-modal-prompt-component',
    template: `
    <input nz-input placeholder="{{placeholder}}" [(ngModel)]="value">
  `
})
export class NzModalPromptComponent {
    value = '';
    constructor() {
    }
}
