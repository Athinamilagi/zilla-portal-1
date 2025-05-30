import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css'],
  standalone: true,
  imports: [RouterModule]
})
export class TileComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() color: string = '';
  @Input() route: string = '';
  @Input() count: number = 0;
}