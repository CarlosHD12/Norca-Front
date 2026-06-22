import {Component, EventEmitter, inject, Input, OnChanges, Output} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {PrendaService} from '../../../../services/prenda-service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-modal-desactivar',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './modal-desactivar.html',
  styleUrl: './modal-desactivar.css',
})
export class ModalDesactivar {
  @Output() closeDesactivar = new EventEmitter<void>();
  @Output() accionExitosa = new EventEmitter<void>();

  @Input() idPrenda: number | null = null;

  @Input() estadoPrenda: string = '';

  @Input() codigoPrenda: string | null = null;

  closing = false;
  cargando = false;

  private prendaService = inject(PrendaService);

  get esInhabilitada(): boolean {
    return this.estadoPrenda === 'INHABILITADA';
  }

  confirmarAccion(): void {

    if (!this.idPrenda || this.cargando) return;

    this.cargando = true;

    const request = this.esInhabilitada
      ? this.prendaService.activarPrenda(this.idPrenda)
      : this.prendaService.inhabilitarPrenda(this.idPrenda);

    request.subscribe({
      next: () => {
        this.accionExitosa.emit();
        this.cerrarDesactivar();
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  cerrarDesactivar(): void {
    this.closing = true;

    setTimeout(() => {
      this.closeDesactivar.emit();
    }, 250);
  }
}
