import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PrendaQuickDetailDTO} from '../../model/PrendaQuickDetalleDTO';
import {DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-right-sidebar',
  imports: [
    DatePipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.css',
})
export class RightSidebar {

  @Input()
  isOpen = false;

  @Input()
  detail: PrendaQuickDetailDTO | null = null;

  @Output()
  close = new EventEmitter<void>();

  closeSidebar(): void {
    this.close.emit();
  }

  get stockPercentage(): number {

    const fifo = this.detail?.loteFIFO;

    if (!fifo) {
      return 0;
    }

    return fifo.cantidadInicial > 0
      ? (fifo.stockActual / fifo.cantidadInicial) * 100
      : 0;
  }
}
