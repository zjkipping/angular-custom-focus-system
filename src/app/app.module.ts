import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { AppComponent } from './app.component';

import { ExpandingCardComponent } from './expanding-card/expanding-card.component';
import { ExpandingCardContentComponent } from './expanding-card/expanding-card-content.component';
import { ExpandingCardPreviewComponent } from './expanding-card/expanding-card-preview.component';

import { ImageCarouselDialogComponent } from './image-carousel-dialog/image-carousel-dialog.component';
import { TextPageDialogComponent } from './text-page-dialog/text-page-dialog.component';
import { FormPanelComponent } from './form-panel/form-panel.component';

import { RotaryControlDirective } from './rotary-control-system/rotary-control.directive';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatSelectModule
  ],
  declarations: [
    AppComponent,
    ExpandingCardComponent,
    ExpandingCardContentComponent,
    ExpandingCardPreviewComponent,
    ImageCarouselDialogComponent,
    TextPageDialogComponent,
    RotaryControlDirective,
    FormPanelComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
