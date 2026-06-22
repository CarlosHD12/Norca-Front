import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-modal-movimiento',
    imports: [

    ],
  templateUrl: './modal-movimiento.html',
  styleUrl: './modal-movimiento.css',
})
export class ModalMovimiento {
  closing = false;
  @Output() closeMovimiento = new EventEmitter<void>();

  @Output() abrirMovimiento = new EventEmitter<number>();

  @Input() idPrenda: number | null = null;

  @Input() codigoPrenda: string | null = null;
}
