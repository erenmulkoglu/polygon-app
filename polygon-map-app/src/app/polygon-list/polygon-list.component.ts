import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-polygon-list',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './polygon-list.component.html',
  styleUrls: ['./polygon-list.component.scss']
})
export class PolygonListComponent {
  @Input() polygons: any[] = [];
  @Output() deletePolygon = new EventEmitter<number>();

  onDelete(index: number) {
    this.deletePolygon.emit(index);
  }
}
