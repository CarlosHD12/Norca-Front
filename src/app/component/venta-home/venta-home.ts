import { Component } from '@angular/core';
import {SidebarComponent} from '../sidebar-component/sidebar-component';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {VentaService} from '../../services/venta-service';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatFormField, MatFormFieldModule} from '@angular/material/form-field';
import {MatOption, MatSelect, MatSelectModule} from '@angular/material/select';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {CommonModule, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {Venta} from '../../model/venta';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {DetalleVent} from '../../model/detalle-vent';
import {DetalleVentService} from '../../services/detalle-vent-service';
import {forkJoin} from 'rxjs';
import {PrendaBuscadorVenta} from '../prenda-buscador-venta/prenda-buscador-venta';
import {Prenda} from '../../model/prenda';
import {ChartData, ChartOptions, ChartType} from 'chart.js';
import {NgChartsModule} from 'ng2-charts';

@Component({
  selector: 'app-venta-home',
  imports: [
    SidebarComponent,
    MatFormField,
    ReactiveFormsModule,
    MatSelect,
    MatInput,
    MatFormFieldModule,
    MatSelectModule,
    MatNativeDateModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    CommonModule,
    MatOption,
    NgForOf,
    NgIf,
    NgOptimizedImage,
    MatIcon,
    FormsModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    PrendaBuscadorVenta,
    MatDatepicker,
    NgChartsModule,
  ],
  templateUrl: './venta-home.html',
  styleUrl: './venta-home.css'
})
export class VentaHome {
  // === MODAL ===
  mostrarModal = false;
  fechahoraVenta = new Date();

  // === FORMULARIO ===
  ventaForm!: FormGroup;
  loading = false;
  error = false;
  ventas: Venta[] = [];
  ventaGuardada = false;
  ventaSeleccionada: Venta | null = null;
  menuVisibleV = false;
  menuXV = 0;
  menuYV = 0;
  listaFiltradaV: Venta[] = [];

  // === PAGINACIÓN ===
  paginaActual: number = 1;
  itemsPorPagina: number = 20;
  paginaInput: number = 1;

  // === OPCIONES ===
  metodosPago = [
    {value: 'Yape', label: 'Yape'},
    {value: 'Plin', label: 'Plin'},
    {value: 'Efectivo', label: 'Efectivo'}
  ];

  constructor(
    private fb: FormBuilder,
    private ventaService: VentaService,
    private detalleVentaService: DetalleVentService
  ) {
  }

  ngOnInit(): void {
    this.cargarVentas();
    this.actualizarGrafico();
    this.cargarDatosGrafico();
    this.crearFormulario();
  }

  crearFormulario() {
    this.ventaForm = this.fb.group({
      cliente: ['', [Validators.required]],
      metodoPago: ['', Validators.required]
    });
  }

  // === MODAL ===
  abrirModal() {
    this.mostrarModal = true;
    this.error = false;
    this.ventaGuardada = false;
    this.ventaForm.reset();
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // === Guardar nueva venta ===
  guardarVenta() {
    if (this.ventaForm.invalid) return;

    this.loading = true;
    this.error = false;

    const venta = {
      cliente: this.ventaForm.value.cliente,
      metodoPago: this.ventaForm.value.metodoPago
    };

    console.log("Venta enviada:", venta);

    this.ventaService.insert(venta).subscribe({
      next: () => {
        this.ventaGuardada = true;
        this.loading = false;
        setTimeout(() => {
          this.cerrarModal();
          this.reiniciarFiltrosVentas();
          this.cargarVentas();
        }, 1500);
      },
      error: (err) => {
        console.error('Error al registrar venta', err);
        this.error = true;
        this.loading = false;
        setTimeout(() => this.error = false, 2000);
      }
    });
  }


  // === CERRAR MODAL AL HACER CLICK FUERA ===
  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cerrarModal();
    }
  }

  // === PAGINACIÓN ===

  trackByVenta(index: number, venta: Venta): number {
    return venta.idVenta!;
  }

  // === CARGAR VENTAS ===
  cargarVentas() {
    this.ventaService.listar().subscribe({
      next: (ventas) => {
        // 🔥 Orden descendente por fecha
        ventas.sort((a, b) => new Date(b.fechahoraVenta).getTime() - new Date(a.fechahoraVenta).getTime());

        this.listaFiltradaV = ventas;
        this.ventas = ventas;

        // Verificar detalles y demás...
        this.ventas.forEach(venta => {
          if (venta.idVenta) {
            this.detalleVentaService.contarDetallesPorVenta(venta.idVenta).subscribe({
              next: (cantidad) => {
                this.ventaTieneDetalles.set(venta.idVenta!, cantidad > 0);
              },
              error: (err) => {
                console.error('Error al contar detalles', err);
                this.ventaTieneDetalles.set(venta.idVenta!, false);
              }
            });
          }
        });

        // Actualizar gráficos
        this.actualizarGrafico();
        this.cargarDatosGrafico();
      },
      error: (err) => console.error('Error al cargar ventas', err)
    });
  }


  cambiarItemsPorPagina() {
    if (this.itemsPorPagina < 1) this.itemsPorPagina = 1;
    if (this.itemsPorPagina > 100) this.itemsPorPagina = 100;
    this.paginaActual = 1;
    this.paginaInput = 1;
  }

  get totalPaginas3() {
    return Math.ceil(this.listaFiltradaV.length / this.itemsPorPagina);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas3) {
      this.paginaActual = pagina;
      this.paginaInput = pagina;
    }
  }

  irAPagina(pagina: number) {
    if (pagina && pagina >= 1 && pagina <= this.totalPaginas3) {
      this.paginaActual = pagina;
      this.paginaInput = pagina;
    } else {
      this.paginaInput = this.paginaActual;
    }
  }

  getPaginas3(): (number | string)[] {
    const total = this.totalPaginas3;
    const current = this.paginaActual;

    if (total <= 5) return Array.from({length: total}, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, '...', total];
    if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  get ventasPaginadas() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.listaFiltradaV.slice(inicio, fin);
  }

  abrirMenuVenta(event: MouseEvent, venta: Venta) {
    event.preventDefault();
    event.stopPropagation();
    this.ventaSeleccionada = venta;
    this.menuXV = event.clientX;
    this.menuYV = event.clientY;
    this.menuVisibleV = true;
    const close = () => {
      this.menuVisibleV = false;
      window.removeEventListener('click', close);
    };
    setTimeout(() => window.addEventListener('click', close), 0);
  }

  busquedaCliente: string = '';
  metodoPagoFiltro: string | null = null;
  fechaFiltro: Date | null = null;
  precioMin: number | null = null;
  precioMax: number | null = null;


  aplicarFiltrosVentas() {
    this.listaFiltradaV = this.ventas.filter(venta => {
      // Filtro por nombre de cliente
      const matchCliente = this.busquedaCliente
        ? venta.cliente?.toLowerCase().includes(this.busquedaCliente.toLowerCase())
        : true;

      // Filtro por metodo de pago
      const matchMetodoPago = this.metodoPagoFiltro
        ? venta.metodoPago === this.metodoPagoFiltro
        : true;

      // Filtro por fecha específica (solo día)
      const matchFecha = this.fechaFiltro
        ? new Date(venta.fechahoraVenta).toDateString() === new Date(this.fechaFiltro).toDateString()
        : true;

      // Filtro por rango de precios
      const matchPrecio = (() => {
        if (this.precioMin == null && this.precioMax == null) return true;
        const total = venta.total ?? 0;
        if (this.precioMin != null && total < this.precioMin) return false;
        if (this.precioMax != null && total > this.precioMax) return false;
        return true;
      })();
      return matchCliente && matchMetodoPago && matchFecha && matchPrecio;
    });
    this.paginaActual = 1;
  }

  reiniciarFiltrosVentas() {
    this.busquedaCliente = '';
    this.metodoPagoFiltro = null;
    this.fechaFiltro = null;
    this.precioMin = null;
    this.precioMax = null;
    this.aplicarFiltrosVentas();
  }

// Modal de detalles
  mostrarModalPrendasVenta = false;

// Mapa para rastrear si una venta tiene detalles
  ventaTieneDetalles = new Map<number, boolean>();

  // === MODALES ===
  abrirModalAgregarDetalles() {
    if (!this.ventaSeleccionada) return;
    this.mostrarModalPrendasVenta = true;
    this.menuVisibleV = false;
  }

// === Al agregar detalles ===
  onDetallesVentaAgregados(detalles: DetalleVent[]) {
    if (!this.ventaSeleccionada?.idVenta) return;

    const observables = detalles.map(detalle =>
      this.detalleVentaService.insert({
        cantidad: detalle.cantidad,
        precioUnitario: detalle.precioUnitario,
        subTotal: detalle.subTotal,
        prenda: {idPrenda: detalle.prenda.idPrenda},
        talla: {idTalla: detalle.talla.idTalla},
        venta: {idVenta: this.ventaSeleccionada!.idVenta!}
      })
    );

    forkJoin(observables).subscribe({
      next: () => {
        this.ventaTieneDetalles.set(this.ventaSeleccionada!.idVenta!, true);
        this.mostrarModalPrendasVenta = false;

        this.reiniciarFiltrosVentas();
        this.cargarVentas();
      },
      error: (err) => console.error('Error al guardar detalles', err)
    });
  }



  ventaAEliminar: any = null;
  mostrarModalConfirmarEliminar = false;

  abrirModalEliminar(venta: any) {
    this.ventaAEliminar = venta;
    this.mostrarModalConfirmarEliminar = true;
  }


  cancelarEliminacion() {
    this.ventaAEliminar = null;
    this.mostrarModalConfirmarEliminar = false;
  }

  confirmarEliminacion() {
    if (!this.ventaAEliminar?.idVenta) return;

    this.ventaService.eliminar(this.ventaAEliminar.idVenta).subscribe({
      next: () => {
        this.reiniciarFiltrosVentas();
        this.cargarVentas();
        this.mostrarModalConfirmarEliminar = false;
        this.ventaAEliminar = null;
      },
      error: err => console.error('Error eliminando venta', err)
    });
  }

  // Variable para mostrar el modal
  mostrarModalVerDetalles: boolean = false;

// Detalles que vas a mostrar

  detallesAgrupados: { prenda: Prenda, tallas: DetalleVent[] }[] = [];

  abrirModalVerDetalles() {
    if (!this.ventaSeleccionada) return;

    this.detalleVentaService.listarPorVenta(this.ventaSeleccionada.idVenta).subscribe({
      next: (detalles: DetalleVent[]) => {
        const grupos: { prenda: Prenda, tallas: DetalleVent[] }[] = [];
        detalles.forEach(det => {
          let grupo = grupos.find(g => g.prenda.idPrenda === det.prenda.idPrenda);
          if (!grupo) {
            grupo = { prenda: det.prenda, tallas: [] };
            grupos.push(grupo);
          }
          grupo.tallas.push(det);
        });

        this.detallesAgrupados = grupos;
        this.mostrarModalVerDetalles = true;
      },
      error: err => console.error('Error cargando detalles', err)
    });
  }

  cerrarModalVerDetalles() {
    this.mostrarModalVerDetalles = false;
    this.ventaSeleccionada = null;
  }

  fechaSeleccionada: Date = new Date();
  totalDelDia: number = 0;

  // Chart.js
  public barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Total ganado por día' }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: ['Total del día'],
    datasets: [{ data: [0], label: 'Soles' }]
  };

  public barChartType: ChartType = 'bar';


  actualizarGrafico() {
    this.ventaService.listar().subscribe({
      next: (ventas) => {
        const total = ventas
          .filter(v => new Date(v.fechahoraVenta).toDateString() === this.fechaSeleccionada.toDateString())
          .reduce((sum, v) => sum + (v.total ?? 0), 0);

        this.totalDelDia = total;

        // 🔄 Reasignar objeto completo
        this.barChartData = {
          labels: ['Total del día'],
          datasets: [{ data: [total], label: 'Soles' }]
        };
      },
      error: err => console.error('Error cargando ventas', err)
    });
  }

  onFechaChange(event: any) {
    this.fechaSeleccionada = event.target.valueAsDate;
    this.actualizarGrafico();
  }

  fechas: string[] = [];
  totales: number[] = [];

  public lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Ganancias a lo largo del tiempo' }
    }
  };
  public lineChartData: ChartData<'line'> = {
    labels: this.fechas,
    datasets: [
      { data: this.totales, label: 'Soles', fill: true, borderColor: 'rgb(75, 192, 192)', tension: 0.3 }
    ]
  };
  public lineChartType: ChartType = 'line';

  cargarDatosGrafico() {
    this.ventaService.listar().subscribe({
      next: (ventas) => {
        const mapaTotales: { [fecha: string]: number } = {};
        ventas.forEach(v => {
          // Usamos YYYY-MM-DD para que sea fácil ordenar luego
          const fecha = new Date(v.fechahoraVenta);
          const dia = fecha.toISOString().split('T')[0]; // "2025-12-10"
          if (!mapaTotales[dia]) mapaTotales[dia] = 0;
          mapaTotales[dia] += v.total ?? 0;
        });

        // Ordenar por fecha real
        const fechas = Object.keys(mapaTotales).sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        // Convertir de nuevo a formato DD/MM/YY para mostrar bonito en el gráfico
        const fechasFormateadas = fechas.map(f => {
          const d = new Date(f);
          return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear().toString().slice(-2)}`;
        });

        const totales = fechas.map(f => mapaTotales[f]);

        // Reasignar objeto completo para Chart.js
        this.lineChartData = {
          labels: fechasFormateadas,
          datasets: [
            {
              data: totales,
              label: 'Soles',
              fill: true,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.3
            }
          ]
        };
      },
      error: (err) => console.error('Error cargando ventas', err)
    });
  }
}
