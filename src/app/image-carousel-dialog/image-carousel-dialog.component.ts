import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { RotaryControlDirective } from '../rotary-control-system/rotary-control.directive';

@Component({
  selector: 'app-image-carousel-dialog',
  templateUrl: './image-carousel-dialog.component.html',
  styleUrls: ['./image-carousel-dialog.component.css']
})
export class ImageCarouselDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ImageCarouselDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { parent: RotaryControlDirective }
  ) {}

  closeDialog() {
    this.dialogRef.close();
  }
}
