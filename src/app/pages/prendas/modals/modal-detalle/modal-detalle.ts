import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {PrendaService} from '../../../../services/prenda-service';
import {PrendaDetalleDTO} from '../../../../model/PrendaDetalleDTO';
import {InventarioHistorialDTO} from '../../../../model/InventarioHistorialDTO';
import {DatePipe, DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {MetricaVentaDTO} from '../../../../model/MetricaVentaDTO';
import {MetricaService} from '../../../../services/metrica-service';
import {ResumenLoteDTO} from '../../../../model/ResumenLoteDTO';

@Component({
  selector: 'app-modal-detalle',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './modal-detalle.html',
  styleUrl: './modal-detalle.css',
})
export class ModalDetalle implements OnChanges {

  @Output() closeDetalle = new EventEmitter<void>();
  @Output() abrirMetricas = new EventEmitter<number>();

  @Input() idPrenda: number | null = null;
  @Input() codigoPrenda: string | null = null;
  metricaVenta: MetricaVentaDTO | null = null;

  private prendaService = inject(PrendaService);
  private metricaService = inject(MetricaService);

  detalle: PrendaDetalleDTO | null = null;
  inventarios: InventarioHistorialDTO[] = [];
  resumen: ResumenLoteDTO | null = null;

  loading = false;
  closing = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idPrenda'] && this.idPrenda) {
      this.cargarDetalle();
    }
  }

  cargarDetalle(): void {

    if (!this.idPrenda) return;

    this.loading = true;

    this.prendaService.obtenerDetallePrenda(this.idPrenda).subscribe({
      next: (resp) => {
        this.detalle = resp;
        this.inventarios = resp.inventarios || [];
        this.resumen = resp.resumen;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

  }

  cerrarDetalle(): void {
    this.closing = true;
    setTimeout(() => {
      this.closeDetalle.emit();
    }, 250);
  }

  mostrarDrawer = false;
  closingDrawer = false;

  abrirDrawer(): void {
    this.mostrarDrawer = true;
    this.closingDrawer = false;
    this.cargarMetricaVenta();
  }

  cerrarDrawer(): void {
    this.closingDrawer = true;
    setTimeout(() => {
      this.mostrarDrawer = false;
      this.closingDrawer = false;
    }, 250);
  }
  cargarMetricaVenta(): void {
    if (!this.idPrenda) return;
    this.metricaService.obtenerMetricaPorPrenda(this.idPrenda).subscribe({
      next: (resp) => {
        this.metricaVenta = resp;
      },
      error: (err) => {
        console.error('Error al obtener las métricas de la prenda', err);
        this.metricaVenta = null;
      }
    });
  }
}
