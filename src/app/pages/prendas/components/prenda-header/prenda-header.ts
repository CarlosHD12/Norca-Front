import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-prenda-header',
  imports: [
  ],
  templateUrl: './prenda-header.html',
  styleUrl: './prenda-header.css',
})
export class PrendaHeader {
  @Output()
  nuevaPrenda = new EventEmitter<void>();

  abrirModalPrenda() {
    this.nuevaPrenda.emit();
  }
}
