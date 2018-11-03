import {
  Directive,
  HostListener,
  ComponentRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  Input,
  OnChanges,
  SimpleChange,
  Output,
  EventEmitter,
  TemplateRef,
  ElementRef,
} from '@angular/core';

import { NgxPopoverContentComponent } from './ngx-popover-content.component';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[popover]',
  exportAs: 'popover',
})
export class NgxPopoverDirective implements OnChanges {
  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  protected PopoverComponent = NgxPopoverContentComponent;
  protected popover: ComponentRef<NgxPopoverContentComponent>;
  protected visible: boolean;

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(protected viewContainerRef: ViewContainerRef, protected resolver: ComponentFactoryResolver) {}

  // -------------------------------------------------------------------------
  // Inputs / Outputs
  // -------------------------------------------------------------------------

  @Input('popover')
  content: string | TemplateRef<ElementRef>;

  @Input()
  popoverDisabled: boolean;

  @Input()
  popoverAnimation: boolean;

  @Input()
  popoverPlacement: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'auto top' | 'auto bottom' | 'auto left' | 'auto right';

  @Input()
  popoverTitle: string;

  @Input()
  popoverOnHover = false;

  @Input()
  popoverCloseOnClickOutside: boolean;

  @Input()
  popoverCloseOnMouseOutside: boolean;

  @Input()
  popoverDismissTimeout = 0;

  @Output()
  shown = new EventEmitter<NgxPopoverDirective>();

  @Output()
  hidden = new EventEmitter<NgxPopoverDirective>();

  // -------------------------------------------------------------------------
  // Event listeners
  // -------------------------------------------------------------------------

  @HostListener('click')
  showOrHideOnClick(): void {
    if (this.popoverOnHover) {
      return;
    }
    if (this.popoverDisabled) {
      return;
    }
    this.onToggle();
  }

  @HostListener('focusin')
  @HostListener('mouseenter')
  showOnHover(): void {
    if (!this.popoverOnHover) {
      return;
    }
    if (this.popoverDisabled) {
      return;
    }
    this.onShow();
  }

  @HostListener('focusout')
  @HostListener('mouseleave')
  hideOnHover(): void {
    if (this.popoverCloseOnMouseOutside) {
      return;
    } // don't do anything since not we control this
    if (!this.popoverOnHover) {
      return;
    }
    if (this.popoverDisabled) {
      return;
    }
    this.onHide();
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes['popoverDisabled']) {
      if (changes['popoverDisabled'].currentValue) {
        this.onHide();
      }
    }
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  onToggle() {
    if (!this.visible) {
      this.onShow();
    } else {
      this.onHide();
    }
  }

  onShow() {
    if (this.visible) {
      return;
    }

    this.visible = true;
    const factory = this.resolver.resolveComponentFactory(this.PopoverComponent);
    this.popover = this.viewContainerRef.createComponent(factory);
    const popover = this.popover.instance as NgxPopoverContentComponent;
    popover.popover = this;
    popover.content = this.content;

    if (this.popoverPlacement !== undefined) {
      popover.placement = this.popoverPlacement;
    }
    if (this.popoverAnimation !== undefined) {
      popover.animation = this.popoverAnimation;
    }
    if (this.popoverTitle !== undefined) {
      popover.title = this.popoverTitle;
    }
    if (this.popoverCloseOnClickOutside !== undefined) {
      popover.closeOnClickOutside = this.popoverCloseOnClickOutside;
    }
    if (this.popoverCloseOnMouseOutside !== undefined) {
      popover.closeOnMouseOutside = this.popoverCloseOnMouseOutside;
    }

    popover.onCloseFromOutside.subscribe(() => this.onHide());
    // if dismissTimeout option is set, then this popover will be dismissed in dismissTimeout time
    if (this.popoverDismissTimeout > 0) {
      setTimeout(() => this.onHide(), this.popoverDismissTimeout);
    }

    this.shown.emit(this);
  }

  onHide() {
    if (!this.visible) {
      return;
    }

    this.visible = false;
    if (this.popover) {
      this.popover.destroy();
    }

    this.hidden.emit(this);
  }

  getElement() {
    return this.viewContainerRef.element.nativeElement;
  }
}
