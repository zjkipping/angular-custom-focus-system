import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expanding-card',
  templateUrl: './expanding-card.component.html',
  styleUrls: ['./expanding-card.component.scss'],
  animations: [
    trigger('emptyEnter', [transition(':enter', [])]),
    trigger('fadeOut', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ExpandingCardComponent {
  @Input() expanded = false;

  previewFadeOutDone = true;
  contentFadeOutDone = true;
}
