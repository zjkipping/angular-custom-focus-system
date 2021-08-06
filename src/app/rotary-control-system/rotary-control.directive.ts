import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  Optional,
  Output,
  SkipSelf,
} from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { RotaryControlSystemService } from './rotary-control-system.service';
import { findInsertIndex, isInFocusPath } from './util';

@Directive({
  selector: '[appRotaryControl]',
  exportAs: 'appRotaryControl',
})
export class RotaryControlDirective implements AfterViewInit, OnDestroy {
  @HostBinding('class.rc-focused') isFocused = false;
  @HostBinding('class-rc-selected') isSelected = false;

  @Input('rcStartWith') startWith?: RotaryControlDirective;

  @Input('rcOrderingMode') orderingMode?: 'auto' | 'manual' = 'auto';

  @Input('rcIndex') set _index(val: string | number) {
    if (typeof val === 'string') {
      const parsed = Number(val);
      this.index = Number.isNaN(parsed) ? 0 : parsed;
    } else {
      this.index = val;
    }
  }
  index = 0;

  @Input('rcParent') _parent?: RotaryControlDirective;

  @Input('rcDisableTraversalExit') set _disableTraversalExit(val: string | boolean) {
    this.disableTraversalExit = typeof val === 'string' || val;
  }
  disableTraversalExit = false;

  @Input('rcAutoFocus') set _autofocus(val: string | boolean) {
    this.autofocus = typeof val === 'string' || val;
  }
  autofocus = false;

  @Input('rcDisableFocus') set _disableFocus(val: string | boolean) {
    this.disableFocus = typeof val === 'string' || val;
  }
  disableFocus = false;

  @Input('rcSelectHoldsFocus') set _selectHoldsFocus(val: string | boolean) {
    this.selectHoldsFocus = typeof val === 'string' || val;
  }
  selectHoldsFocus = false;

  @Output('rcPreviousAction') previousActionEvent = new EventEmitter();
  @Output('rcNextAction') nextActionEvent = new EventEmitter();
  @Output('rcEscapeAction') escapeActionEvent = new EventEmitter();
  @Output('rcSelect') selectEvent = new EventEmitter();
  @Output('rcDeselect') deselectEvent = new EventEmitter();

  @HostListener('focus', ['$event'])
  onFocus(_event: FocusEvent) {
    if (
      !this.rotaryControlSystem.isAccessabilityDisabled &&
      !this.disableFocus &&
      !this.isFocused &&
      !this.isSelected &&
      this.parent
    ) {
      this.focusSelf();
    }
  }

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.rotaryControlSystem.isAccessabilityDisabled) {
      event.stopPropagation();
      if (this.children.length > 0 && !this.isSelected) {
        this.focusStartingPosition();
      } else if (this.isFocused && this.selectHoldsFocus) {
        this.isSelected = true;
        this.selectEvent.emit();
      } else if (!this.isFocused) {
        this.el.nativeElement.click();
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.rotaryControlSystem.isAccessabilityDisabled && this.isFocused) {
      if (event.code === 'Enter' || event.code === 'Space') {
        if (this.children.length > 0 && !this.isSelected) {
          this.focusStartingPosition();
        } else if (this.selectHoldsFocus) {
          this.isSelected = true;
          this.selectEvent.emit();
        } else {
          this.el.nativeElement.click();
        }
      } else if (event.code === 'Escape') {
        if (this.selectHoldsFocus && this.isSelected) {
          this.isSelected = false;
          this.deselectEvent.emit();
        } else {
          this.escape();
        }
      }
    }
  }

  private children: RotaryControlDirective[] = [];
  private destroy = new Subject<void>();

  constructor(
    public el: ElementRef<HTMLElement>,
    private cdr: ChangeDetectorRef,
    private rotaryControlSystem: RotaryControlSystemService,
    @Optional() @SkipSelf() public parent?: RotaryControlDirective,
  ) {}

  ngAfterViewInit() {
    if (this._parent) {
      this.parent = this._parent;
    }

    if (!this.parent) {
      // If there is no parent group assume this a "root" of a "tree"
      // Which means this group needs to be selected & it's starting position focused
      this.focusStartingPosition();
    } else {
      this.parent.registerChild(this);
    }

    if (this.disableFocus || !this.parent || this.rotaryControlSystem.isAccessabilityDisabled) {
      // having a tabIndex of undefined or -1 means the HTML browser can still sort of "focus" the element
      // so we delete it if it exists just to be safe
      this.el.nativeElement.tabIndex = -1;
    } else {
      this.el.nativeElement.tabIndex = 0;
    }

    this.rotaryControlSystem.currentFocus
      .pipe(takeUntil(this.destroy))
      .subscribe((entity: RotaryControlDirective) => {
        const oldIsSelected = this.isSelected;
        this.isFocused = false;
        this.isSelected = false;
        this.el.nativeElement.blur();

        if (entity === this) {
          this.isFocused = true;
          this.el.nativeElement.focus({ preventScroll: true });

          // this could potentially be slightly improved by looking for the overflowing parent
          // in the dom hierarchy & checking to see if the element the directive is attached
          // to is actually hidden in the overflowing parent before running scrollIntoView
          this.el.nativeElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        } else if (isInFocusPath(entity, this)) {
          this.isSelected = true;
        }

        if (oldIsSelected !== this.isSelected) {
          if (this.isSelected) {
            this.selectEvent.emit();
          } else {
            this.deselectEvent.emit();
          }
        }
        this.cdr.detectChanges();
      });

    // Responding to a select action
    this.rotaryControlSystem.selectAction
      .pipe(
        filter((entity: RotaryControlDirective) => entity === this),
        takeUntil(this.destroy),
      )
      .subscribe(() => {
        if (this.children.length > 0) {
          // moving the focus to inside this group
          this.focusStartingPosition();
        } else if (this.selectHoldsFocus) {
          this.isSelected = true;
          this.selectEvent.emit();
        } else {
          this.el.nativeElement.click();
        }
      });

    // Responding to an escape action
    this.rotaryControlSystem.escapeAction
      .pipe(
        filter((entity: RotaryControlDirective) => entity === this),
        takeUntil(this.destroy),
      )
      .subscribe(() => {
        if (this.selectHoldsFocus && this.isSelected) {
          this.isSelected = false;
          this.deselectEvent.emit();
        } else {
          this.escape();
        }
      });

    // responding to a focus previous entity action
    this.rotaryControlSystem.focusPreviousAction
      .pipe(takeUntil(this.destroy))
      .subscribe((currentFocus: RotaryControlDirective) => {
        if (currentFocus === this && this.selectHoldsFocus && this.isSelected) {
          this.previousActionEvent.emit();
        } else if (
          currentFocus.parent === this &&
          !currentFocus.selectHoldsFocus &&
          !currentFocus.isSelected
        ) {
          this.focusPreviousChild(currentFocus);
        }
      });

    // responding to a focus next entity action
    this.rotaryControlSystem.focusNextAction
      .pipe(takeUntil(this.destroy))
      .subscribe((currentFocus: RotaryControlDirective) => {
        if (currentFocus === this && this.selectHoldsFocus && this.isSelected) {
          this.nextActionEvent.emit();
        } else if (
          currentFocus.parent === this &&
          !currentFocus.selectHoldsFocus &&
          !currentFocus.isSelected
        ) {
          this.focusNextChild(currentFocus);
        }
      });

    // responding to the accessability settings changing
    this.rotaryControlSystem.accessabilityDisabled
      .pipe(takeUntil(this.destroy))
      .subscribe((accessabilityDisabled) => {
        if (this.disableFocus || !this.parent || accessabilityDisabled) {
          this.el.nativeElement.tabIndex = -1;
        } else {
          this.el.nativeElement.tabIndex = 0;
        }
      });

    if (this.autofocus) {
      this.focusSelf();
    }
  }

  focusStartingPosition() {
    const newFocus = this.startWith ?? this.children[0];
    const autoFocus = this.children.find((child) => child.autofocus);
    if (autoFocus) {
      this.rotaryControlSystem.setFocus(autoFocus);
    } else if (newFocus) {
      this.rotaryControlSystem.setFocus(newFocus);
    } else {
      throw new Error('Failed child focus lookup in focus starting action');
    }
  }

  focusPreviousChild(currentFocus: RotaryControlDirective) {
    const index = this.children.findIndex((child) => child === currentFocus);
    if (index !== -1) {
      if (index !== 0) {
        // focus the previous child
        this.rotaryControlSystem.setFocus(this.children[index - 1]);
      } else if (this.parent && !this.disableTraversalExit) {
        // normal case exit position for when moving backwards from the start of a group
        this.escapeChildren();
      } else {
        // fall back exit position, which currently doesn't change anything
        this.rotaryControlSystem.setFocus(currentFocus);
      }
    } else {
      throw new Error('Failed child focus lookup in focus previous action');
    }
  }

  // This method & the above method could probably be refactored to 1 method?
  focusNextChild(currentFocus: RotaryControlDirective) {
    const index = this.children.findIndex((child) => child === currentFocus);
    if (index !== -1) {
      if (index + 1 !== this.children.length) {
        // focus the next child
        this.rotaryControlSystem.setFocus(this.children[index + 1]);
      } else if (this.parent && !this.disableTraversalExit) {
        this.escapeChildren();
      } else {
        // fall back exit position when dealing with the "root" group; currently doesn't change anything
        this.rotaryControlSystem.setFocus(currentFocus);
      }
    } else {
      throw new Error('Failed child focus lookup in focus next action');
    }
  }

  focusSelf() {
    this.rotaryControlSystem.setFocus(this);
  }

  escapeChildren() {
    // always need to check if this is the root before "escaping"
    if (this.parent) {
      this.focusSelf();
      this.escapeActionEvent.emit();
    }
  }

  escape() {
    // always need to check if this is the root before "escaping"
    if (this.parent) {
      this.parent.escapeChildren();
      this.escapeActionEvent.emit();
    }
  }

  registerChild(entity: RotaryControlDirective) {
    const index =
      this.orderingMode === 'auto'
        ? this.findInsertIndexByRotaryControlDomOrder(entity)
        : this.findInsertIndexByRotaryControlIndex(entity);
    const newChildren = [...this.children];
    newChildren.splice(index + 1, 0, entity);
    this.children = newChildren;
  }

  unRegisterChild(entity: RotaryControlDirective) {
    const index = this.children.findIndex((child) => child === entity);
    if (index !== -1) {
      const newChildren = [...this.children];
      newChildren.splice(index, 1);
      this.children = newChildren;
    } else {
      throw new Error('Failed to find entity to unregister from children list');
    }
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    if (this.parent) {
      this.parent.unRegisterChild(this);
    }
  }

  private findInsertIndexByRotaryControlIndex(entity: RotaryControlDirective) {
    return findInsertIndex(entity, this.children, rotaryControlIndexComparer);
  }

  private findInsertIndexByRotaryControlDomOrder(entity: RotaryControlDirective) {
    return findInsertIndex(entity, this.children, rotaryControlDomOrderComparer);
  }
}

export function rotaryControlIndexComparer(a: RotaryControlDirective, b: RotaryControlDirective) {
  const aIndex = a.index ?? 0;
  const bIndex = b.index ?? 0;
  if (aIndex < bIndex) {
    return -1;
  } else if (aIndex > bIndex) {
    return 1;
  } else {
    // push item to the back
    return 1;
  }
}

export function rotaryControlDomOrderComparer(
  a: RotaryControlDirective,
  b: RotaryControlDirective,
) {
  if (
    b.el.nativeElement.compareDocumentPosition(a.el.nativeElement) &
    Node.DOCUMENT_POSITION_FOLLOWING
  ) {
    return 1;
  } else if (
    b.el.nativeElement.compareDocumentPosition(a.el.nativeElement) &
    Node.DOCUMENT_POSITION_PRECEDING
  ) {
    return -1;
  } else {
    // shouldn't be hit
    return 0;
  }
}
