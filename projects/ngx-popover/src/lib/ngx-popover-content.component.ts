import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ChangeDetectorRef,
  OnDestroy,
  ViewChild,
  EventEmitter,
  HostListener,
  Renderer2,
  TemplateRef,
} from '@angular/core';

import { NgxPopoverDirective } from './ngx-popover.directive';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'popover-content',
  template: `
<ng-template #defaultTemplate let-item="item">{{ text }}</ng-template>
<div #popoverDiv class="popover {{ placementClass }}" [style.transform]="'translate3d(' + left + 'px, ' + top + 'px, 0px)'"
     [class.fade]="animation" style="will-change:transform;position:absolute;top:0px;left:0px;" role="tooltip">
    <div class="arrow" [ngStyle]="arrowStyle"></div>
    <h3 class="popover-header" [hidden]="!title">{{ title }}</h3>
    <div class="popover-body">
      <ng-container *ngTemplateOutlet="template || defaultTemplate; context: context"></ng-container>
    </div>
</div>
`,
})
export class NgxPopoverContentComponent implements AfterViewInit, OnDestroy {
  // -------------------------------------------------------------------------
  // Inputs / Outputs
  // -------------------------------------------------------------------------

  // @Input()
  // hostElement: HTMLElement;

  private _content: string | TemplateRef<ElementRef>;
  get content() {
    return this._content;
  }
  @Input()
  set content(value) {
    if (this._content === value) {
      return;
    }
    this._content = value;
    if (this._content instanceof TemplateRef) {
      this.template = this._content;
    } else {
      this.text = this._content as string;
    }
  }

  @Input()
  placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' | 'auto top' | 'auto bottom' | 'auto left' | 'auto right' = 'bottom';

  @Input()
  title: string;

  @Input()
  animation = true;

  @Input()
  closeOnClickOutside = false;

  @Input()
  closeOnMouseOutside = false;

  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------

  @ViewChild('popoverDiv')
  popoverDiv: ElementRef;

  popover: NgxPopoverDirective;
  onCloseFromOutside = new EventEmitter();
  top = -10000;
  left = -10000;
  arrowStyle: any = {};
  effectivePlacement: string;
  placementClass: string;
  text: string;
  template: TemplateRef<ElementRef>;
  context: { popover: NgxPopoverContentComponent };

  listenClickFunc: () => void;
  listenMouseFunc: () => void;

  // -------------------------------------------------------------------------
  // Anonymous
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Constructor
  // -------------------------------------------------------------------------

  constructor(protected element: ElementRef, protected cdr: ChangeDetectorRef, protected renderer: Renderer2) {
    this.context = { popover: this };
  }

  // -------------------------------------------------------------------------
  // Lifecycle callbacks
  // -------------------------------------------------------------------------

  ngAfterViewInit(): void {
    if (this.closeOnClickOutside) {
      this.listenClickFunc = this.renderer.listen('document', 'mousedown', (event: any) => this.onDocumentMouseDown(event));
    }
    if (this.closeOnMouseOutside) {
      this.listenMouseFunc = this.renderer.listen('document', 'mouseover', (event: any) => this.onDocumentMouseDown(event));
    }
    this.show();
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.listenClickFunc) {
      this.listenClickFunc();
    }
    if (this.listenMouseFunc) {
      this.listenMouseFunc();
    }
  }

  // -------------------------------------------------------------------------
  // Public Methods
  // -------------------------------------------------------------------------

  /**
   * Closes dropdown if user clicks outside of this directive.
   */
  onDocumentMouseDown(event: any) {
    const element = this.element.nativeElement;
    if (!element || !this.popover) {
      return;
    }
    if (element.contains(event.target) || this.popover.getElement().contains(event.target)) {
      return;
    }
    this.hide();
    this.onCloseFromOutside.emit(undefined);
  }

  show(): void {
    if (!this.popover || !this.popover.getElement()) {
      return;
    }
    const p = this.positionElements(this.popover.getElement(), this.popoverDiv.nativeElement, this.placement);
    this.top = p.top;
    this.left = p.left;
  }

  hide(): void {
    this.top = -10000;
    this.left = -10000;
    if (this.popover && this.popover.getElement()) {
      this.popover.onHide();
    }
  }

  hideFromPopover() {
    this.top = -10000;
    this.left = -10000;
  }

  @HostListener('window:resize')
  onResize() {
    this.show();
  }

  // -------------------------------------------------------------------------
  // Protected Methods
  // -------------------------------------------------------------------------

  protected positionElements(
    hostEl: HTMLElement,
    targetEl: HTMLElement,
    positionStr: string,
    appendToBody: boolean = false,
  ): { top: number; left: number } {
    const positionStrParts = positionStr.split('-');
    let pos0 = positionStrParts[0];
    const pos1 = positionStrParts[1] || 'center';
    const hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);
    const targetElWidth = targetEl.offsetWidth;
    const targetElHeight = targetEl.offsetHeight;

    this.effectivePlacement = pos0 = this.getEffectivePlacement(pos0, hostEl, targetEl);
    this.placementClass = this.popoverPositionClassConverter(this.effectivePlacement);

    if (['top', 'bottom'].includes(this.effectivePlacement)) {
      this.arrowStyle = { left: `calc(${(targetElWidth - 16) / 2}px - 0.3rem)` };
    } else if (['left', 'right'].includes(this.effectivePlacement)) {
      this.arrowStyle = { top: `calc(${(targetElHeight - 16) / 2}px - 0.3rem)` };
    } else {
      this.arrowStyle = '';
    }

    const shiftWidth: any = {
      center: function(): number {
        return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
      },
      left: function(): number {
        return hostElPos.left;
      },
      right: function(): number {
        return hostElPos.left + hostElPos.width;
      },
    };

    const shiftHeight: any = {
      center: function(): number {
        return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
      },
      top: function(): number {
        return hostElPos.top;
      },
      bottom: function(): number {
        return hostElPos.top + hostElPos.height;
      },
    };

    let targetElPos: { top: number; left: number };
    switch (pos0) {
      case 'right':
        targetElPos = {
          top: shiftHeight[pos1](),
          left: shiftWidth[pos0](),
        };
        break;

      case 'left':
        targetElPos = {
          top: shiftHeight[pos1](),
          left: hostElPos.left - targetElWidth - 8,
        };
        break;

      case 'bottom':
        targetElPos = {
          top: shiftHeight[pos0](),
          left: shiftWidth[pos1](),
        };
        break;

      default:
        targetElPos = {
          top: hostElPos.top - targetElHeight,
          left: shiftWidth[pos1](),
        };
        break;
    }

    return targetElPos;
  }

  protected position(nativeEl: HTMLElement): { width: number; height: number; top: number; left: number } {
    let offsetParentBCR = { top: 0, left: 0 };
    const elBCR = this.offset(nativeEl);
    const offsetParentEl = this.parentOffsetEl(nativeEl);
    if (offsetParentEl !== window.document) {
      offsetParentBCR = this.offset(offsetParentEl);
      offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
      offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
    }

    const boundingClientRect = nativeEl.getBoundingClientRect();
    return {
      width: boundingClientRect.width || nativeEl.offsetWidth,
      height: boundingClientRect.height || nativeEl.offsetHeight,
      top: elBCR.top - offsetParentBCR.top,
      left: elBCR.left - offsetParentBCR.left,
    };
  }

  protected offset(nativeEl: any): { width: number; height: number; top: number; left: number } {
    const boundingClientRect = nativeEl.getBoundingClientRect();
    return {
      width: boundingClientRect.width || nativeEl.offsetWidth,
      height: boundingClientRect.height || nativeEl.offsetHeight,
      top: boundingClientRect.top + (window.pageYOffset || window.document.documentElement.scrollTop),
      left: boundingClientRect.left + (window.pageXOffset || window.document.documentElement.scrollLeft),
    };
  }

  protected getStyle(nativeEl: HTMLElement, cssProp: string): string {
    if ((nativeEl as any).currentStyle) {
      // IE
      return (nativeEl as any).currentStyle[cssProp];
    }
    if (window.getComputedStyle) {
      return (window.getComputedStyle as any)(nativeEl)[cssProp];
    }
    // finally try and get inline style
    return (nativeEl.style as any)[cssProp];
  }

  protected isStaticPositioned(nativeEl: HTMLElement): boolean {
    return (this.getStyle(nativeEl, 'position') || 'static') === 'static';
  }

  protected parentOffsetEl(nativeEl: HTMLElement): any {
    let offsetParent: any = nativeEl.offsetParent || window.document;
    while (offsetParent && offsetParent !== window.document && this.isStaticPositioned(offsetParent)) {
      offsetParent = offsetParent.offsetParent;
    }
    return offsetParent || window.document;
  }

  protected getEffectivePlacement(placement: string, hostElement: HTMLElement, targetElement: HTMLElement): string {
    const placementParts = placement.split(' ');
    if (placementParts[0] !== 'auto') {
      return placement;
    }

    const hostElBoundingRect = hostElement.getBoundingClientRect();

    const desiredPlacement = placementParts[1] || 'bottom';

    if (desiredPlacement === 'top' && hostElBoundingRect.top - targetElement.offsetHeight < 0) {
      return 'bottom';
    }
    if (desiredPlacement === 'bottom' && hostElBoundingRect.bottom + targetElement.offsetHeight > window.innerHeight) {
      return 'top';
    }
    if (desiredPlacement === 'left' && hostElBoundingRect.left - targetElement.offsetWidth < 0) {
      return 'right';
    }
    if (desiredPlacement === 'right' && hostElBoundingRect.right + targetElement.offsetWidth > window.innerWidth) {
      return 'left';
    }

    return desiredPlacement;
  }

  protected popoverPositionClassConverter(pos: string) {
    return `bs-popover-${pos}`;
  }
}
