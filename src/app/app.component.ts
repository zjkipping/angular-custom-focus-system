import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ImageCarouselDialogComponent } from './image-carousel-dialog/image-carousel-dialog.component';
import { RotaryControlSystemService } from './rotary-control-system/rotary-control-system.service';
import { RotaryControlDirective } from './rotary-control-system/rotary-control.directive';
import { TextPageDialogComponent } from './text-page-dialog/text-page-dialog.component';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // mocking out focus system events that would come from an API
  @HostListener('window:keyup', ['$event'])
  keyUpEvent(event: KeyboardEvent) {
    if (event.code === 'Period') {
      this.rotaryControlSystem.focusNext();
    } else if (event.code === 'Comma') {
      this.rotaryControlSystem.focusPrevious();
    } else if (event.code === 'Space') {
      this.rotaryControlSystem.select();
    } else if (event.code === 'Slash') {
      this.rotaryControlSystem.escape();
    }
  }

  // dummy variables for swapping selection on the "checkbox" like elements
  isCard1Item1Selected = false;
  isCard1Item2Selected = false;
  // ----

  selectOptions = [
    { value: 'blue', display: 'Blue' },
    { value: 'green', display: 'Green' },
    { value: 'red', display: 'Red' },
    { value: 'yellow', display: 'Yellow' },
    { value: 'purple', display: 'Purple' }
  ];

  constructor(
    private rotaryControlSystem: RotaryControlSystemService,
    private dialog: MatDialog
  ) {
    // this.rotaryControlSystem.disableAccessability();
  }

  openImageCarouselDialog() {
    // this parent could be supplied through a @ViewChild in this component's TS as well
    const restoreFocus = this.rotaryControlSystem.getCurrentFocus();
    this.dialog
      .open(ImageCarouselDialogComponent, {
        data: { parent: restoreFocus }
      })
      .afterClosed()
      .subscribe(() => {
        this.rotaryControlSystem.setFocus(restoreFocus);
      });
  }

  openTextPageDialog() {
    const restoreFocus = this.rotaryControlSystem.getCurrentFocus();
    this.dialog
      .open(TextPageDialogComponent, {
        data: { parent: restoreFocus }
      })
      .afterClosed()
      .subscribe(() => {
        this.rotaryControlSystem.setFocus(restoreFocus);
      });
  }

  // mat-select option overlay is weird ...
  selectOpenChanged(open: boolean, rcControl: RotaryControlDirective) {
    if (!open) {
      setTimeout(() => {
        rcControl.focusSelf();
      }, 50);
    }
  }
}
