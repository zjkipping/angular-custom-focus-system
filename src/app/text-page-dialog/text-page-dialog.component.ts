import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { RotaryControlSystemService } from '../rotary-control-system/rotary-control-system.service';
import { RotaryControlDirective } from '../rotary-control-system/rotary-control.directive';

@Component({
  selector: 'app-text-page-dialog',
  templateUrl: './text-page-dialog.component.html',
  styleUrls: ['./text-page-dialog.component.css']
})
export class TextPageDialogComponent implements OnDestroy {
  @ViewChild('content', { read: ElementRef }) contentContainer: ElementRef;

  private destroy = new Subject<void>();

  constructor(
    private rotaryControlSystem: RotaryControlSystemService,
    private dialogRef: MatDialogRef<TextPageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { parent: RotaryControlDirective }
  ) {
    // Overriding the default behavior of the traversal actions
    // This only works since there is only 1 item in the group
    // So, the traversal actions don't change focus
    this.rotaryControlSystem.focusPreviousAction
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.contentContainer.nativeElement.scrollTop -= 50;
      });

    this.rotaryControlSystem.focusNextAction
      .pipe(takeUntil(this.destroy))
      .subscribe(() => {
        this.contentContainer.nativeElement.scrollTop += 50;
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
  }
}
