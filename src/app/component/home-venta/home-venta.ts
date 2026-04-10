import {Component, HostListener, OnInit} from '@angular/core';
import {DatePipe, DecimalPipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {SidebarComponent} from '../sidebar-component/sidebar-component';
import {VentaListadoDTO} from '../../model/VentaListadoDTO';
import {VentaService} from '../../services/venta-service';
import {VentaDetalleDTO} from '../../model/VentaDetalleDTO';
import {PrendaCarritoDTO} from '../../model/PrendaCarritoDTO';
import {PrendaService} from '../../services/prenda-service';
import {InventarioCarritoDTO} from '../../model/InventarioActivoDTO';
import {CrearVentaDTO} from '../../model/CrearVentaDTO';
import {ImpactoVentaDTO} from '../../model/ImpactoVentaDTO';

export enum Modales {
  VENTA = 'venta',
  DETALLE = 'detalle',
  IMPACTO = 'impacto',
  ANULAR = 'anular',
}

@Component({
  selector: 'app-home-venta',
  imports: [
    DecimalPipe,
    FormsModule,
    NgForOf,
    NgIf,
    SidebarComponent,
    DatePipe,
    NgClass,
    ReactiveFormsModule,
  ],
  templateUrl: './home-venta.html',
  styleUrl: './home-venta.css',
})
export class HomeVenta implements OnInit {
  constructor(
    private ventaService: VentaService,
    private prendaService: PrendaService
  ) {
  }

  sidebarExpanded = true;

  onToggleSidebar(state: boolean) {
    this.sidebarExpanded = state;
  }

  modalActivo: Modales | null = null;
  protected readonly Modales = Modales;

  abrirModal(modal: Modales) {
    this.modalActivo = modal;
    document.body.classList.add('modal-open');
    if (modal === Modales.VENTA) {
      this.cargarPrendasDisponibles();
    }
  }

  ventasListaPaginada: VentaListadoDTO[] = [];
  paginaActual = 1;
  itemsPorPagina = 20;
  totalPaginas = 0;
  paginaInput = 1;

  totalGlobal: number = 0;
  totalRegistros: number = 0;

  cargarVentas() {

    const filtros = {
      codigo: this.busqueda?.trim() || null,
      metodoPago: this.filtroMetodoPago || null,
      periodo: this.filtroPeriodo || null,
      fecha: this.fechaFiltro || null,
      precioMin: this.precioMin !== null ? Number(this.precioMin) : null,
      precioMax: this.precioMax !== null ? Number(this.precioMax) : null,
      unidadesMin: this.stockMin !== null ? Number(this.stockMin) : null,
      unidadesMax: this.stockMax !== null ? Number(this.stockMax) : null
    };
    const hayFiltros = !!(
      filtros.codigo ||
      filtros.metodoPago ||
      filtros.periodo ||
      filtros.fecha ||
      filtros.precioMin !== null ||
      filtros.precioMax !== null ||
      filtros.unidadesMin !== null ||
      filtros.unidadesMax !== null
    );

    this.ventaService.listarVentas(
      this.paginaActual - 1,
      this.itemsPorPagina,
      filtros
    ).subscribe({
      next: (res) => {

        this.ventasListaPaginada = res.content;
        this.totalPaginas = res.totalPages;
        this.paginaActual = res.number + 1;
        this.paginaInput = this.paginaActual;

        if (!hayFiltros) {
          this.totalGlobal = res.totalElements;
        }
        this.totalRegistros = res.totalElements;

        if (res.content.length === 0 && this.paginaActual > 1) {
          this.paginaActual = 1;
          this.cargarVentas();
        }
      },
      error: (err) => {
        console.error('Error cargando ventas', err);
      }
    });
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.paginaInput = pagina;
    this.cargarVentas();
  }

  irAPagina(pagina: number) {
    if (!pagina) return;
    if (pagina < 1) pagina = 1;
    if (pagina > this.totalPaginas) pagina = this.totalPaginas;
    this.cambiarPagina(pagina);
  }

  getPaginas(): (number | string)[] {
    const paginas: (number | string)[] = [];
    const inicio = Math.max(1, this.paginaActual - 2);
    const fin = Math.min(this.totalPaginas, this.paginaActual + 2);
    if (inicio > 1) {
      paginas.push(1);
      if (inicio > 2) paginas.push('...');
    }
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    if (fin < this.totalPaginas) {
      if (fin < this.totalPaginas - 1) paginas.push('...');
      paginas.push(this.totalPaginas);
    }
    return paginas;
  }

  intervalStepper: any;
  timeoutStepper: any;
  isHolding = false;

  guardarItemsPorPagina() {
    localStorage.setItem('itemsPorPaginaVentas', this.itemsPorPagina.toString());
  }

  cargarItemsPorPagina() {
    const valorGuardado = localStorage.getItem('itemsPorPaginaVentas');
    if (valorGuardado) {
      this.itemsPorPagina = Number(valorGuardado);
    }
  }

  aumentarVent(isHold: boolean = false) {
    if (!isHold) {
      if (this.isHolding) return;
      if (this.itemsPorPagina < 50) {
        this.itemsPorPagina++;
        this.guardarItemsPorPagina();
        this.paginaActual = 1;
        this.cargarVentas();
      }
      return;
    }
    this.isHolding = true;
    this.stopStepper();
    this.timeoutStepper = setTimeout(() => {
      this.intervalStepper = setInterval(() => {
        if (this.itemsPorPagina < 50) {
          this.itemsPorPagina++;
          this.guardarItemsPorPagina();
          this.paginaActual = 1;
          this.cargarVentas();
        }
      }, 150);
    }, 200);
  }

  disminuirVent(isHold: boolean = false) {
    if (!isHold) {
      if (this.isHolding) return;
      if (this.itemsPorPagina > 1) {
        this.itemsPorPagina--;
        this.guardarItemsPorPagina();
        this.paginaActual = 1;
        this.cargarVentas();
      }
      return;
    }
    this.isHolding = true;
    this.stopStepper();
    this.timeoutStepper = setTimeout(() => {
      this.intervalStepper = setInterval(() => {
        if (this.itemsPorPagina > 1) {
          this.itemsPorPagina--;
          this.guardarItemsPorPagina();
          this.paginaActual = 1;
          this.cargarVentas();
        }
      }, 150);
    }, 200);
  }

  stopStepper() {
    clearTimeout(this.timeoutStepper);
    if (this.intervalStepper) {
      clearInterval(this.intervalStepper);
      this.intervalStepper = null;
    }
    setTimeout(() => {
      this.isHolding = false;
    }, 50);
  }

  ngOnInit() {
    this.cargarItemsPorPagina();
    this.cargarVentas();
    this.cargarPrendasDisponibles();
    this.initVenta();
    this.iniciarReloj();
  }

  getMetodoClass(estado?: string) {
    const e = estado?.toLowerCase();
    if (e === 'efectivo') return 'status-efectivo';
    if (e === 'yape') return 'status-yape';
    if (e === 'tarjeta') return 'status-tarjeta';
    return 'status-otro';
  }

  ventaSeleccionada: VentaListadoDTO | null = null;

  seleccionarVenta(venta: VentaListadoDTO) {
    this.ventaSeleccionada = venta;
  }

  menuVisible: boolean = false;
  menuX: number = 0;
  menuY: number = 0;
  menuWidth: number = 160;
  menuHeight: number = 200;

  abrirMenu(event: MouseEvent, venta: VentaListadoDTO) {
    event.preventDefault();
    event.stopPropagation();

    if (this.menuVisible) {
      this.closeMenu();
      return;
    }

    this.ventaSeleccionada = venta;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    this.menuY =
      (rect.bottom + this.menuHeight > viewportHeight)
        ? Math.max(8, rect.top - this.menuHeight)
        : rect.bottom + 5;

    this.menuX =
      Math.min(
        viewportWidth - this.menuWidth - 8,
        Math.max(8, centerX - this.menuWidth / 2 + 15)
      );

    this.menuVisible = true;

    setTimeout(() => {
      window.addEventListener('click', this.closeMenu);
      window.addEventListener('scroll', this.closeMenu, true);
      window.addEventListener('wheel', this.closeMenu, true);
    });
  }

  private closeMenu = () => {
    this.menuVisible = false;
    window.removeEventListener('click', this.closeMenu);
    window.removeEventListener('scroll', this.closeMenu, true);
    window.removeEventListener('wheel', this.closeMenu, true);
  };

  ventaDetalle: VentaDetalleDTO | null = null;

  abrirDetalleVenta() {
    if (!this.ventaSeleccionada?.idVenta) return;
    const idVenta = this.ventaSeleccionada.idVenta;
    this.ventaService.obtenerDetalleVenta(idVenta).subscribe({
      next: (data: VentaDetalleDTO) => {
        this.ventaDetalle = data;
        this.modalActivo = Modales.DETALLE;
      },
      error: (err) => {
        console.error('Error al obtener detalle de la venta', err);
        this.ventaDetalle = null;
      }
    });
  }

  accionMenu(accion: string) {
    if (!this.ventaSeleccionada) return;

    switch (accion) {
      case 'detalle':
        this.abrirDetalleVenta();
        break;

      case 'impacto':
        this.abrirImpactoVenta();
        break;

      case 'anular':
        this.anularVenta();
        break;

      default:
        console.warn('Acción no reconocida', accion);
    }

    this.menuVisible = false;
  }

  confirmacionAnular: string = '';

  anularVenta() {
    if (!this.ventaSeleccionada?.idVenta) return;
    if (this.modalActivo !== Modales.ANULAR) {
      this.confirmacionAnular = '';
      this.modalActivo = Modales.ANULAR;
      return;
    }
    if (this.confirmacionAnular !== 'ANULAR') {
      this.mostrarToastMensaje('Debes escribir "ANULAR" para confirmar', 'error');
      return;
    }
    const idVenta = this.ventaSeleccionada.idVenta;
    this.ventaService.desactivarVenta(idVenta).subscribe({
      next: (msg: string) => {
        this.mostrarToastMensaje(msg || 'Venta anulada correctamente', 'success');

        this.cargarVentas();

        this.cerrarModal();
        this.ventaSeleccionada = null;
      },
      error: (err) => {
        console.error(err);
        const mensajeError =
          typeof err.error === 'string'
            ? err.error
            : err.error?.message || 'No se pudo anular la venta';
        this.mostrarToastMensaje(mensajeError, 'error');
      }
    });
  }

  impactoSeleccionado: ImpactoVentaDTO | null = null;

  abrirImpactoVenta() {
    if (!this.ventaSeleccionada?.idVenta) return;
    const idVenta = this.ventaSeleccionada.idVenta;
    this.ventaService.impactoVenta(idVenta).subscribe({
      next: (data: ImpactoVentaDTO) => {
        this.impactoSeleccionado = data;
        this.modalActivo = Modales.IMPACTO;
      },
      error: (err) => {
        this.impactoSeleccionado = null;
      }
    });
  }

  cerrarModal() {
    switch (this.modalActivo) {
      case Modales.DETALLE:
        break;
      case Modales.IMPACTO:
        break;
    }

    this.modalActivo = null;
    document.body.classList.remove('modal-open');
  }

  prendasDisponibles: PrendaCarritoDTO[] = [];
  prendaSeleccionada: PrendaCarritoDTO | null = null;
  inventarioSeleccionado: InventarioCarritoDTO[] = [];
  modalInventarioVisible: boolean = false;
  totalPrendas: number = 0;

  cargarPrendasDisponibles() {
    this.prendaService.listarPrendasDisponibles().subscribe({
      next: (data) => {
        this.prendasDisponibles = data;
        this.prendasFiltradas = [...data];
        this.totalPrendas = data.length;
        this.categorias = Array.from(new Set(data.map(p => p.categoria)));
        this.marcas = Array.from(new Set(data.map(p => p.marca)));
      },
      error: (err) => console.error('Error al listar prendas', err)
    });
  }

  abrirInventario(prenda: PrendaCarritoDTO) {
    this.prendaSeleccionada = prenda;
    this.prendaService.obtenerInventario(prenda.idPrenda).subscribe({
      next: (data) => {
        this.inventarioSeleccionado = data.map(inv => ({
          ...inv,
          cantidadSeleccionada: 0,
          cantidadEnCarrito: 0
        }));
        this.recuperarCantidades();
        this.modalInventarioVisible = true;
      },
      error: (err) => console.error('Error al obtener inventario', err)
    });
  }

  cerrarInventario() {
    this.modalInventarioVisible = false;
    this.inventarioSeleccionado = [];
  }

  recuperarCantidades() {
    this.inventarioSeleccionado.forEach(inv => {
      const detalleExistente = this.detalles.controls.find((d: any) =>
        d.value.inventario.idInventario === inv.idInventario
      );

      const cantidad = detalleExistente ? detalleExistente.value.cantidad : 0;

      inv.cantidadEnCarrito = cantidad;
      inv.cantidadSeleccionada = cantidad;
    });
  }

  pressTimer: any;
  pressInterval: any;

  startPress(inv: any, tipo: 'sumar' | 'restar') {
    this.clearPress();
    tipo === 'sumar' ? this.aumentar(inv) : this.disminuir(inv);
    this.pressInterval = setInterval(() => {
      tipo === 'sumar' ? this.aumentar(inv) : this.disminuir(inv);
    }, 250);
  }

  endPress() {
    this.clearPress();
  }

  clearPress() {
    clearTimeout(this.pressTimer);
    clearInterval(this.pressInterval);
  }

  cardClick(inv: any) {
    if (inv.cantidadSeleccionada > 0) {
      inv.cantidadSeleccionada = 0;
    } else {
      inv.cantidadSeleccionada = inv.stock;
    }
  }

  aumentar(inv: any) {
    inv.cantidadSeleccionada = (inv.cantidadSeleccionada || 0) + 1;
    if (inv.cantidadSeleccionada > inv.stock) {
      inv.cantidadSeleccionada = inv.stock;
    }
  }

  disminuir(inv: any) {
    inv.cantidadSeleccionada = (inv.cantidadSeleccionada || 0) - 1;
    if (inv.cantidadSeleccionada < 0) {
      inv.cantidadSeleccionada = 0;
    }
  }

  validarCantidad(inv: InventarioCarritoDTO) {
    let valor = Number(inv.cantidadSeleccionada);
    let error = '';
    const enCarrito = inv.cantidadEnCarrito || 0;
    if (isNaN(valor)) {
      valor = 0;
      error = 'Ingresa un número válido';
    } else if (valor < 0) {
      valor = 0;
      error = 'La cantidad no puede ser negativa';
    } else if (valor + enCarrito > inv.stock) {
      valor = inv.stock - enCarrito;
      error = `Máximo disponible: ${inv.stock - enCarrito}`;
    }
    inv.cantidadSeleccionada = valor;
    if (error) {
      this.mostrarToastMensaje(error, 'error');
    }
  }

  initVenta() {
    this.ventaForm = new FormGroup({
      metodoPago: new FormControl('', Validators.required),
      detalles: new FormArray([])
    });
    this.detalles = this.ventaForm.get('detalles') as FormArray;
  }

  agregarTodosInventarios() {
    if (!this.prendaSeleccionada) return;
    let cambios = 0;
    const prenda = this.prendaSeleccionada;

    this.limpiarInventariosDePrenda(prenda.idPrenda);

    this.inventarioSeleccionado.forEach(inv => {
      const cantidad = Number(inv.cantidadSeleccionada);
      if (!cantidad || cantidad <= 0) return;
      if (cantidad > inv.stock) {
        this.mostrarToastMensaje(`Stock insuficiente para ${inv.nombreTalla}`, 'error');
        return;
      }

      const subtotal = inv.precioVenta * cantidad;

      const detalle = new FormGroup({
        inventario: new FormControl({...inv, idPrenda: this.prendaSeleccionada!.idPrenda}),
        prenda: new FormControl({...this.prendaSeleccionada!}),
        cantidad: new FormControl(cantidad, [
          Validators.required,
          Validators.min(1),
          Validators.max(inv.stock)
        ]),
        precioUnitario: new FormControl(inv.precioVenta),
        subtotal: new FormControl(subtotal)
      });
      this.detalles.push(detalle);
      cambios++;
    });

    if (cambios === 0) {
      this.mostrarToastMensaje('Selecciona al menos un inventario válido', 'error');
      return;
    }

    this.mostrarToastMensaje('Carrito actualizado', 'success');
    this.actualizarStockTodasPrendas();
    this.cerrarInventario();
  }

  registrarVenta() {
    if (this.ventaForm.invalid || this.detalles.length === 0) {
      this.mostrarToastMensaje('Completa todos los campos y agrega al menos un inventario', 'error');
      return;
    }

    const venta: CrearVentaDTO = {
      metodoPago: this.ventaForm.value.metodoPago,
      detalles: this.detalles.value.map((d: any) => ({
        cantidad: d.cantidad,
        inventario: {idInventario: d.inventario.idInventario}
      }))
    };

    this.ventaService.registrarVenta(venta).subscribe({
      next: res => {
        this.mostrarToastMensaje(`Venta ${res.codigo} registrada con éxito! 💸`, 'success');
        this.initVenta();
        this.cerrarModal();
        this.cargarVentas();
      },
      error: err => {
        console.error(err);
        this.mostrarToastMensaje('Error al registrar la venta', 'error');
      }
    });
  }

  ventaForm!: FormGroup;
  detalles!: FormArray;

  quitarDelCarrito(detalle: FormGroup) {
    const index = this.detalles.controls.indexOf(detalle);
    if (index !== -1) {
      this.detalles.removeAt(index);
      this.actualizarStockTodasPrendas();
    }
  }


  get totalVenta(): number {
    return this.detalles.controls.reduce((acc, d: any) => acc + d.value.subtotal, 0);
  }

  get totalUnidades(): number {
    return this.detalles.controls
      .reduce((acc, d: any) => acc + Number(d.value.cantidad || 0), 0);
  }

  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  mostrarToastMensaje(mensaje: string, tipo: 'success' | 'error' = 'success') {
    this.toastMensaje = mensaje;
    this.toastTipo = tipo;
    this.mostrarToast = true;
    setTimeout(() => this.cerrarToast(), 2000);
  }

  cerrarToast() {
    const toast = document.querySelector('.toast') as HTMLElement;
    if (toast) {
      toast.classList.add('out');
      setTimeout(() => {
        this.mostrarToast = false;
      }, 300);
    }
  }

  limpiarInventariosDePrenda(idPrenda: number) {
    for (let i = this.detalles.length - 1; i >= 0; i--) {
      const d = this.detalles.at(i) as FormGroup;
      if (d.value.inventario.idPrenda === idPrenda) {
        this.detalles.removeAt(i);
      }
    }
  }

  actualizarStockTodasPrendas() {
    this.prendasDisponibles.forEach(prenda => {
      let totalEnCarrito = 0;

      this.detalles.controls.forEach((d: any) => {
        if (d.value.inventario.idPrenda === prenda.idPrenda) {
          totalEnCarrito += d.value.cantidad;
        }
      });

      if (!prenda.stockOriginal) {
        prenda.stockOriginal = prenda.stock;
      }

      prenda.stock = prenda.stockOriginal - totalEnCarrito;
    });
  }

  fechaHoraActual: Date = new Date();
  private intervaloId: any;

  iniciarReloj(): void {
    this.intervaloId = setInterval(() => {
      this.fechaHoraActual = new Date();
    }, 1000);
  }

  mostrarModalPago = false;

  abrirModalPago() {
    this.mostrarModalPago = true;
  }

  cerrarModalPago() {
    this.mostrarModalPago = false;
  }

  seleccionarMetodo(metodo: string) {
    const actual = this.ventaForm.get('metodoPago')?.value;
    if (actual === metodo) {
      this.ventaForm.get('metodoPago')?.setValue('');
    } else {
      this.ventaForm.get('metodoPago')?.setValue(metodo);
    }
    this.cerrarModalPago();
  }

  getPrendasAgrupadas() {
    const map = new Map<number, { prenda: any, detalles: FormGroup[] }>();
    this.detalles.controls.forEach((control: AbstractControl) => {
      const det = control as FormGroup;
      const prenda = det.get('prenda')!.value;
      if (!map.has(prenda.idPrenda)) {
        map.set(prenda.idPrenda, {prenda, detalles: []});
      }
      map.get(prenda.idPrenda)!.detalles.push(det);
    });
    return Array.from(map.values());
  }

  estaEnCarrito(idPrenda: number): boolean {
    return this.detalles.controls.some((d: any) => d.value.inventario.idPrenda === idPrenda);
  }

  filtroTexto: string = '';
  filtroCategoria: string | null = null;
  filtroMarca: string | null = null;
  dropdownCategoriaFiltro: boolean = false;
  dropdownMarcaFiltro: boolean = false;

  prendasFiltradas: PrendaCarritoDTO[] = [];
  categorias: string[] = [];
  marcas: string[] = [];
  hayFiltrosPrendas = false;

  aplicarFiltros() {

    const busqueda = (this.filtroTexto || '')
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 0);

    this.prendasFiltradas = this.prendasDisponibles.filter(prenda => {

      const textoPrenda = [
        prenda.categoria,
        prenda.marca,
        prenda.material,
        prenda.descripcion
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const cumpleBusqueda = busqueda.length === 0 ||
        busqueda.every(b => textoPrenda.includes(b));

      const cumpleCategoria = !this.filtroCategoria ||
        prenda.categoria === this.filtroCategoria;

      const cumpleMarca = !this.filtroMarca ||
        prenda.marca === this.filtroMarca;

      return cumpleBusqueda && cumpleCategoria && cumpleMarca;
    });

    this.hayFiltrosPrendas = !!(
      busqueda.length > 0 ||
      this.filtroCategoria ||
      this.filtroMarca
    );
  }

  limpiarBuscador() {
    this.filtroTexto = '';
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroTexto = '';
    this.filtroCategoria = null;
    this.filtroMarca = null;
    this.aplicarFiltros();
  }

  toggleCategoria(event: Event) {
    event.stopPropagation();
    this.dropdownCategoriaFiltro = !this.dropdownCategoriaFiltro;
  }

  seleccionarCategoria(cat: string | null) {
    if (this.filtroCategoria === cat) this.filtroCategoria = null;
    else this.filtroCategoria = cat;

    this.dropdownCategoriaFiltro = false;
    this.aplicarFiltros();
  }

  toggleMarca(event: Event) {
    event.stopPropagation();
    this.dropdownMarcaFiltro = !this.dropdownMarcaFiltro;
  }

  seleccionarMarca(marca: string | null) {
    if (this.filtroMarca === marca) this.filtroMarca = null;
    else this.filtroMarca = marca;

    this.dropdownMarcaFiltro = false;
    this.aplicarFiltros();
  }

  @HostListener('document:click', ['$event'])
  clickFuera(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
      this.dropdownCategoriaFiltro = false;
      this.dropdownMarcaFiltro = false;
    }
  }

  fechaFiltro: string | null = null;
  stockMin: number | null = null;
  stockMax: number | null = null;
  precioMin: number | null = null;
  precioMax: number | null = null;
  busqueda: string = '';


  hayFiltros: boolean = false;

  aplicarFiltrosTabla() {
    this.paginaActual = 1;
    this.hayFiltros = !!(
      this.busqueda?.trim() ||
      this.filtroMetodoPago ||
      this.filtroPeriodo ||
      this.fechaFiltro ||
      this.precioMin !== null ||
      this.precioMax !== null ||
      this.stockMin !== null ||
      this.stockMax !== null
    );
    this.cargarVentas();
  }

  dropdownMetodoPago = false;
  dropdownPeriodo = false;
  metodosPago = ['YAPE','PLIN','EFECTIVO','TARJETA'];
  filtroMetodoPago: string | null = null;
  filtroPeriodo: string | null = null;
  metodoPagoSeleccionado: string | null = null;
  periodoSeleccionado: string | null = null;

  toggleMetodoPago(event: Event) {
    event.stopPropagation();
    this.dropdownPeriodo = false;
    this.dropdownMetodoPago = !this.dropdownMetodoPago;
  }

  togglePeriodo(event: Event) {
    event.stopPropagation();
    this.dropdownMetodoPago = false;
    this.dropdownPeriodo = !this.dropdownPeriodo;
  }

  seleccionarMetodoPago(metodo: string | null) {
    if (this.filtroMetodoPago === metodo) {
      this.filtroMetodoPago = null;
      this.metodoPagoSeleccionado = null;
    } else {
      this.filtroMetodoPago = metodo;
      this.metodoPagoSeleccionado = metodo;
    }
    this.dropdownMetodoPago = false;
    this.aplicarFiltrosTabla();
  }

  seleccionarPeriodo(periodo: string | null) {
    if (this.filtroPeriodo === periodo) {
      this.filtroPeriodo = null;
      this.periodoSeleccionado = null;
    } else {
      this.filtroPeriodo = periodo;
      this.periodoSeleccionado = periodo;
    }
    this.dropdownPeriodo = false;
    this.aplicarFiltrosTabla();
  }

  filtrosAvanzadosActivos: boolean = true;


  @HostListener('document:click')
  cerrarDropdowns() {
    this.dropdownMetodoPago = false;
    this.dropdownPeriodo = false;
  }

  limpiarFiltroBuscador() {
    this.busqueda = '';
    this.aplicarFiltrosTabla();
  }

  limpiarFiltrosTabla() {
    this.busqueda = '';
    this.filtroMetodoPago = null;
    this.filtroPeriodo = null;
    this.metodoPagoSeleccionado = null;
    this.periodoSeleccionado = null;
    this.stockMin = null;
    this.stockMax = null;
    this.precioMin = null;
    this.precioMax = null;
    this.fechaFiltro = null;
    this.aplicarFiltrosTabla();
  }
}
