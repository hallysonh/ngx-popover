import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxPopoverDirective } from './ngx-popover.directive';
import { NgxPopoverContentComponent } from './ngx-popover-content.component';

@NgModule({
  imports: [CommonModule],
  declarations: [NgxPopoverDirective, NgxPopoverContentComponent],
  exports: [NgxPopoverDirective, NgxPopoverContentComponent],
  entryComponents: [NgxPopoverContentComponent],
})
export class NgxPopoverModule {}
