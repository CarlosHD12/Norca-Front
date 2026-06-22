import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {LoteHistorialResponseDTO} from '../../../../model/LoteHistorialResponseDTO';
import {LoteService} from '../../../../services/lote-service';
import {HistorialPrendaResponseDTO} from '../../../../model/HistorialPrendaResponseDTO';
import {DatePipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {MetricaLoteDTO} from '../../../../model/MetricaLoteDTO';

@Component({
  selector: 'app-modal-historial',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './modal-historial.html',
  styleUrl: './modal-historial.css',
})
export class ModalHistorial implements OnChanges {

  @Output() closeHistorial = new EventEmitter<void>();

  @Input() idPrenda: number | null = null;

  private loteService = inject(LoteService);

  historial: HistorialPrendaResponseDTO | null = null;

  metricasLote: MetricaLoteDTO | null = null;
  loadingMetricas = false;
  loading = false;
  closing = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idPrenda'] && this.idPrenda) {
      this.cargarHistorial();
    }
  }

  loteSeleccionado: LoteHistorialResponseDTO | null = null;

  seleccionarLote(lote: LoteHistorialResponseDTO): void {

    if (this.loteSeleccionado?.idLote === lote.idLote) {
      this.loteSeleccionado = null;
      this.metricasLote = null;
      return;
    }

    this.loteSeleccionado = lote;

    this.cargarMetricasLote(lote.idLote);
  }

  cargarMetricasLote(idLote: number): void {

    this.loadingMetricas = true;

    this.loteService.obtenerMetricasLote(idLote)
      .subscribe({
        next: (resp) => {
          this.metricasLote = resp;
          this.loadingMetricas = false;
        },
        error: (err) => {
          console.error(err);
          this.metricasLote = null;
          this.loadingMetricas = false;
        }
      });
  }

  esLoteSeleccionado(idLote: number): boolean {
    return this.loteSeleccionado?.idLote === idLote;
  }

  cargarHistorial(): void {

    if (!this.idPrenda) return;

    this.loading = true;

    this.loteService.listarHistorialLotes(this.idPrenda)
      .subscribe({
        next: (resp) => {
          this.historial = resp;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error al cargar historial', err);
          this.loading = false;
        }
      });
  }

  cerrarHistorial(): void {
    this.closing = true;

    setTimeout(() => {
      this.closeHistorial.emit();
    }, 250);
  }
}
