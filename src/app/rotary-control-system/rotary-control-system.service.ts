import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { filter, share, shareReplay } from 'rxjs/operators';

import { RotaryControlDirective } from './rotary-control.directive';

@Injectable({
  providedIn: 'root'
})
export class RotaryControlSystemService {
  private _currentFocus = new BehaviorSubject<
    RotaryControlDirective | undefined
  >(undefined);
  currentFocus: Observable<RotaryControlDirective> = this._currentFocus.pipe(
    filter((focus): focus is RotaryControlDirective => !!focus),
    shareReplay({ refCount: true, bufferSize: 1 })
  );
  private _accessabilityDisabled = new BehaviorSubject<boolean>(false);
  accessabilityDisabled = this._accessabilityDisabled.pipe(
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  private _focusPreviousAction = new Subject<RotaryControlDirective>();
  private _focusNextAction = new Subject<RotaryControlDirective>();
  private _selectAction = new Subject<RotaryControlDirective>();
  private _escapeAction = new Subject<RotaryControlDirective>();
  focusPreviousAction: Observable<
    RotaryControlDirective
  > = this._focusPreviousAction.pipe(share());
  focusNextAction: Observable<
    RotaryControlDirective
  > = this._focusNextAction.pipe(share());
  selectAction: Observable<RotaryControlDirective> = this._selectAction.pipe(
    share()
  );
  escapeAction: Observable<RotaryControlDirective> = this._escapeAction.pipe(
    share()
  );

  get isAccessabilityDisabled() {
    return this._accessabilityDisabled.value;
  }

  focusPrevious() {
    const currentFocusValue = this._currentFocus.value;
    if (currentFocusValue) {
      this._focusPreviousAction.next(currentFocusValue);
    }
  }

  focusNext() {
    const currentFocusValue = this._currentFocus.value;
    if (currentFocusValue) {
      this._focusNextAction.next(currentFocusValue);
    }
  }

  select() {
    const currentFocusValue = this._currentFocus.value;
    if (currentFocusValue) {
      this._selectAction.next(currentFocusValue);
    }
  }

  escape() {
    const currentFocusValue = this._currentFocus.value;
    if (currentFocusValue) {
      this._escapeAction.next(currentFocusValue);
    }
  }

  setFocus(entity: RotaryControlDirective) {
    this._currentFocus.next(entity);
  }

  getCurrentFocus() {
    return this._currentFocus.value;
  }

  disableAccessability() {
    this._accessabilityDisabled.next(true);
  }

  enableAccessability() {
    this._accessabilityDisabled.next(false);
  }
}
