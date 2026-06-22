import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {LoteService} from '../../../../services/lote-service';
import {CurrencyPipe, DatePipe, DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {TallaService} from '../../../../services/talla-service';
import {TallaResponseDTO} from '../../../../model/TallaResponseDTO';

@Component({
  selector: 'app-modal-lote',
  imports: [
    ReactiveFormsModule,
    NgIf,
    DecimalPipe,
    NgForOf,
    CurrencyPipe,
    NgClass,
    DatePipe
  ],
  templateUrl: './modal-lote.html',
  styleUrl: './modal-lote.css',
})
export class ModalLote implements OnInit {

  @Input() idPrenda: number | null = null;

  @Input() codigoPrenda: string | null = null;

  @Output() closeLote = new EventEmitter<void>();

  @Output() saved = new EventEmitter<void>();

  submitted = false;
  tallas: TallaResponseDTO[] = [];
  form!: FormGroup;
  mostrarModalTallas = false;
  cerrandoModalTallas = false;
  indiceTallaSeleccionada = -1;

  constructor(
    private fb: FormBuilder,
    private loteService: LoteService,
    private tallaService: TallaService
  ) {
  }

  fechaActual = '';

  ngOnInit(): void {

    this.fechaActual = new Date().toLocaleString(
      'es-PE',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    );

    this.form = this.fb.group({
      cantidadInicial: [null, Validators.required],
      precioCompraTotal: [null, Validators.required],
      precioVenta: [null, Validators.required],
      inventarios:this.fb.array([])
    });

    this.cargarTallas();

    this.form.get('cantidadInicial')?.valueChanges.subscribe(() => {
      this.limpiarInventarios();
    });

  }
  get inventarios(): FormArray {
    return this.form.get('inventarios') as FormArray;
  }

  limpiarFormulario(): void {
    this.form.patchValue({
      cantidadInicial: null,
      precioCompraTotal: null,
      precioVenta: null
    });
    this.limpiarInventarios();
    this.submitted = false;
  }

  agregarTalla(): void {
    this.inventarios.push(
      this.fb.group({
        tallaId:[null,Validators.required],
        stock:[null,[Validators.required,Validators.min(1)]]
      })
    );
  }

  eliminarTalla(index:number): void {
    this.inventarios.removeAt(index);
  }

  get totalAsignado(): number {
    return this.inventarios.controls.reduce(
      (acc,item)=>acc + Number(item.get('stock')?.value || 0),
      0
    );
  }

  get costoUnitario(): number {
    const cantidad = Number(this.form.get('cantidadInicial')?.value || 0);
    const compra = Number(this.form.get('precioCompraTotal')?.value || 0);
    return cantidad ? compra / cantidad : 0;
  }

  get gananciaUnidad(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    return Number(
      this.form.get('precioVenta')?.value
    ) - this.costoUnitario;

  }

  get ingresoTotal(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    return Number(
      this.form.get('precioVenta')?.value
    ) * Number(
      this.form.get('cantidadInicial')?.value
    );

  }

  get gananciaTotal(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    return this.ingresoTotal - Number(
      this.form.get('precioCompraTotal')?.value
    );

  }

  registrar(): void {

    this.submitted = false;

    setTimeout(() => {

      this.submitted = true;
      this.form.markAllAsTouched();

      if (this.idPrenda === null) {
        return;
      }

      if (this.form.invalid) {
        return;
      }

      if (this.stockPendiente !== 0) {
        return;
      }

      const payload = {
        prendaId: this.idPrenda,
        cantidadInicial: this.form.value.cantidadInicial,
        precioCompraTotal: this.form.value.precioCompraTotal,
        precioVenta: this.form.value.precioVenta,
        inventarios: this.form.value.inventarios
      };

      this.loteService.registrarLote(payload).subscribe({
        next: () => {
          this.saved.emit();
          this.closeLote.emit();
        }
      });

    });

  }

  cerrarLote(limpiar = true): void {
    this.closing = true;
    setTimeout(() => {
      this.closeLote.emit();
    }, 250);
  }

  closing = false;

  protected readonly Math = Math;

  cargarTallas(): void {

    this.tallaService
      .listarTallas()
      .subscribe({
        next: (response) => {
          this.tallas = response.filter(
            talla => talla.activo
          );
        }
      });

  }

  abrirModalTallas(index: number): void {
    this.indiceTallaSeleccionada = index;
    this.mostrarModalTallas = true;
  }

  cerrarModalTallas(): void {
    this.mostrarModalTallas = false;

    setTimeout(() => {
      this.indiceTallaSeleccionada = -1;
    }, 220);
  }

  seleccionarTalla(talla: TallaResponseDTO): void {

    const controlTalla = this.inventarios
      .at(this.indiceTallaSeleccionada)
      .get('tallaId');

    if (controlTalla?.value === talla.idTalla) {
      controlTalla.setValue(null);
      this.cerrarModalTallas();
      return;
    }

    if (this.estaTallaOcupada(talla.idTalla)) {
      return;
    }

    controlTalla?.setValue(talla.idTalla);
    this.cerrarModalTallas();
  }

  estaTallaOcupada(idTalla: number): boolean {

    return this.inventarios.controls.some(
      (control, index) =>
        index !== this.indiceTallaSeleccionada &&
        control.get('tallaId')?.value === idTalla
    );

  }

  esTallaSeleccionada(idTalla: number): boolean {

    if (this.indiceTallaSeleccionada === -1) {
      return false;
    }

    return this.inventarios
      .at(this.indiceTallaSeleccionada)
      .get('tallaId')
      ?.value === idTalla;

  }

  obtenerNombreTalla(idTalla: number | null): string {

    if (idTalla === null) {
      return '+';
    }

    const talla = this.tallas.find(
      t => t.idTalla === idTalla
    );

    return talla ? talla.nombre : '+';

  }

  obtenerPorcentaje(stock: number): number {

    const cantidad = Number(
      this.form.get('cantidadInicial')?.value || 0
    );

    if (cantidad === 0) {
      return 0;
    }

    return (Number(stock || 0) * 100) / cantidad;

  }

  limpiarInventarios(): void {
    this.inventarios.clear();
  }

  puedeAgregarInventario(): boolean {

    return Number(
      this.form.get('cantidadInicial')?.value || 0
    ) > 0;

  }

  get datosCompletos(): boolean {

    const cantidad = Number(
      this.form.get('cantidadInicial')?.value || 0
    );

    const compra = Number(
      this.form.get('precioCompraTotal')?.value || 0
    );

    const venta = Number(
      this.form.get('precioVenta')?.value || 0
    );

    return cantidad > 0 && compra > 0 && venta > 0;

  }

  get puntoEquilibrio(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    const venta = Number(
      this.form.get('precioVenta')?.value
    );

    const compra = Number(
      this.form.get('precioCompraTotal')?.value
    );

    return Math.ceil(compra / venta);

  }

  get radioInversion(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    const compra = Number(
      this.form.get('precioCompraTotal')?.value
    );

    return Number(
      (this.ingresoTotal / compra).toFixed(2)
    );

  }

  get margenGanancia(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    const compra = Number(
      this.form.get('precioCompraTotal')?.value
    );

    return Number(
      ((this.gananciaTotal / compra) * 100).toFixed(1)
    );

  }

  getEstadoIndicador(
    valor: number,
    limiteRegular: number,
    limiteBueno: number,
    invertido = false
  ): 'neutral' | 'good' | 'medium' | 'bad' {

    if (valor <= 0) {
      return 'neutral';
    }

    if (invertido) {

      if (valor <= limiteBueno) {
        return 'good';
      }

      if (valor <= limiteRegular) {
        return 'medium';
      }

      return 'bad';

    }

    if (valor >= limiteBueno) {
      return 'good';
    }

    if (valor >= limiteRegular) {
      return 'medium';
    }

    return 'bad';

  }

  getIconoIndicador(
    valor: number,
    limiteRegular: number,
    limiteBueno: number,
    invertido = false
  ): string {

    const estado = this.getEstadoIndicador(
      valor,
      limiteRegular,
      limiteBueno,
      invertido
    );

    switch (estado) {
      case 'good':
        return 'fi fi-rr-arrow-trend-up';
      case 'medium':
        return 'fi fi-rr-arrow-right';
      case 'neutral':
        return 'fi fi-rr-down-left-and-up-right-to-center';
      default:
        return 'fi fi-rr-arrow-trend-down';
    }

  }

  get maxComparacion(): number {

    if (!this.datosCompletos) {
      return 1;
    }

    return Math.max(
      this.ingresoTotal,
      this.gananciaTotal,
      Number(
        this.form.get('precioCompraTotal')?.value
      ),
      1
    );

  }

  get porcentajeIngreso(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    return Number(
      (
        (this.ingresoTotal / this.maxComparacion) * 100
      ).toFixed(1)
    );

  }

  get porcentajeCosto(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    const costo = Number(
      this.form.get('precioCompraTotal')?.value
    );

    return Number(
      (
        (costo / this.maxComparacion) * 100
      ).toFixed(1)
    );

  }

  get porcentajeGanancia(): number {

    if (!this.datosCompletos) {
      return 0;
    }

    return Number(
      (
        (this.gananciaTotal / this.maxComparacion) * 100
      ).toFixed(1)
    );

  }

  get estadoFinanciero(): 'neutral' | 'good' | 'medium' | 'bad' {

    if (!this.datosCompletos) {
      return 'neutral';
    }

    if (
      this.margenGanancia >= 60 &&
      this.radioInversion >= 4 &&
      this.puntoEquilibrio <= 2
    ) {
      return 'good';
    }

    if (
      this.margenGanancia >= 30 &&
      this.radioInversion >= 2 &&
      this.puntoEquilibrio <= 5
    ) {
      return 'medium';
    }

    return 'bad';

  }

  get tituloEstadoFinanciero(): string {

    switch (this.estadoFinanciero) {
      case 'good':
        return 'Rentabilidad Alta';
      case 'medium':
        return 'Rentabilidad Moderada';
      case 'bad':
        return 'Rentabilidad Baja';
      default:
        return 'Esperando Datos';
    }

  }

  get descripcionEstadoFinanciero(): string {

    switch (this.estadoFinanciero) {
      case 'good':
        return 'Excelente margen. Este lote proyecta una utilidad elevada y una rápida recuperación de la inversión.';
      case 'medium':
        return 'El lote presenta una rentabilidad aceptable, aunque aún puede optimizarse.';
      case 'bad':
        return 'La utilidad proyectada es reducida. Se recomienda revisar los precios antes de registrar el lote.';
      default:
        return 'Complete las unidades, el costo de compra y el precio de venta para visualizar el análisis.';
    }

  }

  get iconoEstadoFinanciero(): string {

    switch (this.estadoFinanciero) {
      case 'good':
        return 'fi fi-rr-badge-check';
      case 'medium':
        return 'fi fi-rr-time-check';
      case 'bad':
        return 'fi fi-rr-triangle-warning';
      default:
        return 'fi fi-rr-hourglass-start';
    }

  }

  get porcentajeDistribuido(): number {

    const cantidad = Number(
      this.form.get('cantidadInicial')?.value || 0
    );

    if (!cantidad) {
      return 0;
    }

    return Math.min(
      Number(
        ((this.totalAsignado / cantidad) * 100).toFixed(0)
      ),
      100
    );

  }

  get stockPendiente(): number {

    return Math.max(
      Number(this.form.get('cantidadInicial')?.value || 0) -
      this.totalAsignado,
      0
    );

  }

  get inventarioInvalido(): boolean {

    const cantidad = Number(
      this.form.get('cantidadInicial')?.value || 0
    );

    if (cantidad <= 0) {
      return true;
    }

    return this.totalAsignado !== cantidad;

  }


}
