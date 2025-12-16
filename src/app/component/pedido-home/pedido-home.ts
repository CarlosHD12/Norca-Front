import { Component } from '@angular/core';
import {SidebarComponent} from "../sidebar-component/sidebar-component";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Pedido} from '../../model/pedido';
import {PedidoService} from '../../services/pedido-service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatNativeDateModule} from '@angular/material/core';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {Prenda} from '../../model/prenda';
import {PrendaBuscador} from '../prenda-buscador/prenda-buscador';
import {DetallePed} from '../../model/detalle-ped';
import {DetallePedService} from '../../services/detalle-ped-service';
import {forkJoin, of, switchMap} from 'rxjs';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';

@Component({
  selector: 'app-pedido-home',
  imports: [
    SidebarComponent,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgOptimizedImage,
    MatFormFieldModule,
    MatInput,
    MatFormFieldModule,
    MatSelectModule,
    MatNativeDateModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIcon,
    PrendaBuscador,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
  ],
  templateUrl: './pedido-home.html',
  styleUrl: './pedido-home.css'
})
export class PedidoHome {
  pedidos: Pedido[] = [];
  pedidoForm!: FormGroup;
  mostrarModal = false;
  loading = false;
  fechaActual = new Date();
  registrar = false;
  mostrarError = false;
  edicion: boolean = false;
  paginaActual: number = 1;
  itemsPorPagina: number = 20;
  paginaInput: number = 1;
  listaOriginal: Pedido[] = [];
  listaFiltrada: Pedido[] = [];
  pedidoSeleccionado: Pedido | null = null;
  menuVisibleP = false;
  menuXP = 0;
  menuYP = 0;
  mostrarModalPrendas = false;
  prendasSeleccionadasParaPedido: Prenda[] = [];
  mostrarModalConfirmacion = false;
  pedidoAEliminar: Pedido | null = null;

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private detallePedService: DetallePedService,
    ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.cargarPedidos();
  }

  crearFormulario() {
    this.pedidoForm = this.fb.group({
      cliente: ['', Validators.required],
      descripcion: ['']
    });
  }

  guardarPedido() {
    if (this.pedidoForm.invalid) return;

    this.loading = true;
    this.registrar = false;
    this.mostrarError = false;

    const pedido: Pedido = {
      ...this.pedidoForm.value,
      estado: 'Pendiente'
    };

    this.pedidoService.insert(pedido).subscribe({
      next: (pedidoCreado) => {
        this.loading = false;
        this.registrar = true;

        this.pedidos.unshift(pedidoCreado);
        this.reiniciarFiltrosPedidos(); // Reinicia filtros automáticamente
        this.listaOriginal = [...this.pedidos];
        this.listaFiltrada = [...this.pedidos];

        setTimeout(() => {
          this.registrar = false;
          this.cerrarModalPedido();
          this.pedidoForm.reset();
        }, 1000);
      },
      error: err => {
        this.loading = false;
        this.mostrarError = true;
        console.error("ERROR", err);
        setTimeout(() => this.mostrarError = false, 1000);
      }
    });
  }



  cargarPedidos() {
    this.pedidoService.listar().subscribe({
      next: data => {
        this.pedidos = data;
        this.listaOriginal = data;
        this.listaFiltrada = data;
        this.aplicarFiltrosPedidos();

        this.pedidos.forEach(pedido => {
          if (pedido.idPedido) {
            this.detallePedService.contarPrendasPedido(pedido.idPedido).subscribe({
              next: (cantidad) => {
                this.pedidoTieneDetalles.set(pedido.idPedido!, cantidad > 0);
              },
              error: (err) => {
                console.error('Error al contar detalles', err);
                this.pedidoTieneDetalles.set(pedido.idPedido!, false);
              }
            });
          }
        });

        console.log("Pedidos cargados", this.listaFiltrada);
      },
      error: err => console.log('Error no se cargaron los pedidos', err)
    });
  }


  abrirModal() {
    this.mostrarModal = true;
    this.fechaActual = new Date();
    this.pedidoForm.reset({
      estado: 'Pendiente',
      fechaPedido: new Date()
    });
  }

  onOverlayClick(event: MouseEvent) {}

  cerrarModalPedido() {
    this.mostrarModal = false;
  }

  // === PAGINACIÓN ===
  //Devuelve las prendas correspondientes a la página actual.
  get pedidosPaginados() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.listaFiltrada.slice(inicio, fin);
  }


  //Calcula el número total de páginas según el número de prendas y elementos por página.
  get totalPaginas2() {
    return Math.ceil(this.listaFiltrada.length / this.itemsPorPagina);
  }


  //Cambia a una página específica (con validación de límites).
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas2) {
      this.paginaActual = pagina;
      this.paginaInput = pagina;
    }
  }


  //Actualiza la cantidad de elementos por página y reinicia a la primera página.
  cambiarItemsPorPagina() {
    if (this.itemsPorPagina < 1) this.itemsPorPagina = 1;
    if (this.itemsPorPagina > 100) this.itemsPorPagina = 100;
    this.paginaActual = 1;
    this.paginaInput = 1;
  }


  //Genera un array de números y puntos suspensivos para la paginación visual.
  getPaginas2(): (number | string)[] {
    const total = this.totalPaginas2;
    const current = this.paginaActual;

    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, '...', total];
    if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  }


  //Navega a una página ingresada manualmente por el usuario.
  irAPagina(pagina: number) {
    if (pagina && pagina >= 1 && pagina <= this.totalPaginas2) {
      this.paginaActual = pagina;
      this.paginaInput = pagina;
    } else {
      this.paginaInput = this.paginaActual;
    }
  }

  trackByPedido(index: number, pedido: Pedido): number {
    return pedido.idPedido!;
  }

  abrirMenuPedido(event: MouseEvent, pedido: Pedido) {
    event.preventDefault();
    event.stopPropagation();
    this.pedidoSeleccionado = pedido;
    this.menuXP = event.clientX;
    this.menuYP = event.clientY;
    this.menuVisibleP = true;
    const close = () => {
      this.menuVisibleP = false;
      window.removeEventListener('click', close);
    };
    setTimeout(() => window.addEventListener('click', close), 0);
  }

  abrirModalPrendas(pedido: Pedido) {
    console.log('Abriendo modal para pedido:', pedido); // 👈 para depurar
    this.pedidoSeleccionado = pedido;
    this.mostrarModalPrendas = true;
  }

// En PedidoHome.ts
  onPrendasSeleccionadas(prendas: Prenda[]) {
    if (!this.pedidoSeleccionado?.idPedido) {
      console.error('No hay pedido seleccionado');
      return;
    }

    const idPedido = this.pedidoSeleccionado.idPedido;

    const observables = prendas.map(prenda => {
      const detalle: DetallePed = {
        pedido: { idPedido } as Pedido,
        prenda: prenda
      };
      return this.detallePedService.insert(detalle);
    });

    forkJoin(observables).subscribe({
      next: () => {
        console.log('Detalles guardados');
        this.pedidoTieneDetalles.set(idPedido, true);
        this.mostrarModalPrendas = false;
        this.reiniciarFiltrosPedidos();
      },
      error: (err) => {
        console.error('Error al guardar detalles', err);
      }
    });
  }

  cargarDetallesPedido(idPedido: number) {
    this.detallePedService.listarPorPedido(idPedido).subscribe({
      next: detalles => {
        console.log('Detalles cargados:', detalles);
        // Aquí podrías pasarlos al modal si quieres que los muestre
      }
    });
  }

  eliminarPedidoSeleccionado() {
    if (!this.pedidoSeleccionado?.idPedido) {
      this.menuVisibleP = false;
      return;
    }

    this.pedidoAEliminar = this.pedidoSeleccionado;
    this.mostrarModalConfirmacion = true;
    this.menuVisibleP = false;
  }

  confirmarEliminacion() {
    if (!this.pedidoAEliminar?.idPedido) return;

    this.pedidoService.eliminar(this.pedidoAEliminar.idPedido).subscribe({
      next: (mensaje) => {
        console.log(mensaje);
        this.pedidos = this.pedidos.filter(p => p.idPedido !== this.pedidoAEliminar!.idPedido);
        this.listaOriginal = this.listaOriginal.filter(p => p.idPedido !== this.pedidoAEliminar!.idPedido);
        this.listaFiltrada = this.listaFiltrada.filter(p => p.idPedido !== this.pedidoAEliminar!.idPedido);
        this.reiniciarFiltrosPedidos();
        this.cerrarModalConfirmacion();
      },
      error: (err) => {
        console.error('Error al eliminar el pedido', err);
        // Opcional: mostrar error en UI
        this.cerrarModalConfirmacion();
      }
    });
  }

  cancelarEliminacion() {
    this.cerrarModalConfirmacion();
  }

  cerrarModalConfirmacion() {
    this.mostrarModalConfirmacion = false;
    this.pedidoAEliminar = null;
  }

  // En PedidoHome.ts
  mostrarModalEditarDetalles = false;
  prendasActualesDelPedido: Prenda[] = [];

  abrirModalEditarDetalles() {
    if (!this.pedidoSeleccionado?.idPedido) return;

    this.detallePedService.listarPorPedido(this.pedidoSeleccionado.idPedido).subscribe({
      next: (detalles) => {
        this.prendasActualesDelPedido = detalles.map(d => d.prenda);
        this.mostrarModalEditarDetalles = true;
        this.menuVisibleP = false;
      },
      error: (err) => console.error('Error al cargar detalles para edición', err)
    });
  }

  onDetallesEditados(prendasNuevas: Prenda[]) {
    if (!this.pedidoSeleccionado?.idPedido) return;

    const idPedido = this.pedidoSeleccionado.idPedido;

    // 1. Obtener los detalles actuales
    this.detallePedService.listarPorPedido(idPedido).subscribe({
      next: (detallesActuales) => {
        const idsAEliminar = detallesActuales.map(d => d.idDP!);

        // 2. Eliminar todos los detalles actuales
        const eliminar$ = idsAEliminar.length > 0
          ? forkJoin(idsAEliminar.map(id => this.detallePedService.eliminar(id)))
          : of([]);

        // 3. Crear nuevos detalles
        const nuevosDetalles = prendasNuevas.map(prenda => ({
          pedido: { idPedido } as Pedido,
          prenda: prenda
        }));

        const insertar$ = nuevosDetalles.length > 0
          ? forkJoin(nuevosDetalles.map(detalle => this.detallePedService.insert(detalle)))
          : of([]);

        // 4. Ejecutar en secuencia: eliminar primero, luego insertar
        eliminar$.pipe(
          switchMap(() => insertar$)
        ).subscribe({
          next: () => {
            console.log('Detalles actualizados correctamente');
            this.pedidoTieneDetalles.set(idPedido, prendasNuevas.length > 0);
            this.reiniciarFiltrosPedidos();
            this.mostrarModalEditarDetalles = false;
          },
          error: (err) => console.error('Error actualizando detalles', err)
        });
      },
      error: (err) => console.error('Error cargando detalles actuales', err)
    });
  }

  // Filtros nuevos
  busquedaCliente: string = '';
  estadoFiltroPedido: string | null = null;
  fechaDesdeP: string | null = null; // Formato: 'YYYY-MM-DD'
  fechaHastaP: string | null = null; // Formato: 'YYYY-MM-DD'

  aplicarFiltrosPedidos() {
    this.listaFiltrada = this.pedidos.filter(pedido => {
      // 1. Filtro por cliente
      const matchCliente = this.busquedaCliente
        ? pedido.cliente?.toLowerCase().includes(this.busquedaCliente.toLowerCase())
        : true;

      // 2. Filtro por estado
      const matchEstado = this.estadoFiltroPedido
        ? pedido.estado === this.estadoFiltroPedido
        : true;

      // 3. Filtro por fecha
      const matchFecha = () => {
        if (!this.fechaDesdeP && !this.fechaHastaP) return true;

        const fechaPedido = new Date(pedido.fechaPedido);
        const desde = this.fechaDesdeP ? new Date(this.fechaDesdeP) : null;
        const hasta = this.fechaHastaP ? new Date(this.fechaHastaP) : null;

        // Ajustar "hasta" al final del día
        if (hasta) {
          hasta.setHours(23, 59, 59, 999);
        }

        if (desde && fechaPedido < desde) return false;
        if (hasta && fechaPedido > hasta) return false;
        return true;
      };

      return matchCliente && matchEstado && matchFecha();
    });

    this.paginaActual = 1;
  }


  pedidoTieneDetalles = new Map<number, boolean>();

  reiniciarFiltrosPedidos() {
    this.busquedaCliente = '';
    this.estadoFiltroPedido = null;
    this.fechaDesdeP = null;
    this.fechaHastaP = null;
    this.aplicarFiltrosPedidos();
  }

  mostrarModalEstado = false;

  abrirModalEstado() {
    if (!this.pedidoSeleccionado) return;
    this.mostrarModalEstado = true;
    this.menuVisibleP = false;
  }

  // En PedidoHome.ts

  cerrarModalEstado() {
    this.mostrarModalEstado = false;
  }

  guardarEstadoPedido() {
    if (!this.pedidoSeleccionado?.idPedido) return;

    const pedidoActualizado: Pedido = { ...this.pedidoSeleccionado };

    this.pedidoService.actualizar(this.pedidoSeleccionado.idPedido, pedidoActualizado).subscribe({
      next: () => {
        console.log('Estado actualizado');
        const index = this.pedidos.findIndex(p => p.idPedido === this.pedidoSeleccionado!.idPedido);
        if (index !== -1) {
          this.pedidos[index] = { ...this.pedidoSeleccionado! };
          this.listaOriginal[index] = { ...this.pedidoSeleccionado! };
          this.listaFiltrada[index] = { ...this.pedidoSeleccionado! };
        }
        this.reiniciarFiltrosPedidos();
        this.cerrarModalEstado();
      },
      error: (err) => console.error('Error al actualizar estado', err)
    });
  }
}
