import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() color?: string;
  @Input() icon?: string;
}