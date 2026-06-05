import {Component, HostListener, OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {PrendaService} from '../../services/prenda-service';
import {MarcaService} from '../../services/marca-service';
import {CategoriaService} from '../../services/categoria-service';
import {TallaService} from '../../services/talla-service';
import {
  DatePipe,
  DecimalPipe,
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {PrendaListadoDTO} from '../../model/PrendaListadoDTO';
import {Lote} from '../../model/Lote';
import {LoteService} from '../../services/lote-service';
import {interval, startWith, Subscription} from 'rxjs';
import {PrendaDetalleDTO} from '../../model/PrendaDetalleDTO';
import {Metrica} from '../../model/Metrica';
import {MetricaService} from '../../services/metrica-service';
import {LoteMetricasDTO} from '../../model/LoteMetricasDTO';
import {LoteDetalleDTO} from '../../model/LoteDetalleDTO';
import {PrendaListResponseDTO} from '../../model/PrendaListResponseDTO';
import {CategoriaResponseDTO} from '../../model/CategoriaResponseDTO';
import {CategoriaRegistroDTO} from '../../model/CategoriaRegistroDTO';
import {MarcaResponseDTO} from '../../model/MarcaResponseDTO';
import {TallaResponseDTO} from '../../model/TallaResponseDTO';
import {MarcaRegistroDTO} from '../../model/MarcaRegistroDTO';
import {TallaRegistroDTO} from '../../model/TallaRegistroDTO';
import {PrendaRegistroDTO} from '../../model/PrendaRegistroDTO';
import {UltimoLoteResponseDTO} from '../../model/UltimoLoteResponseDTO';
import {InventarioRegistroDTO} from '../../model/InventarioRegistroDTO';
import {LoteRegistroDTO} from '../../model/LoteRegistroDTO';
import {MetricaLoteDTO} from '../../model/MetricaLoteDTO';
import {LoteHistorialResponseDTO} from '../../model/LoteHistorialResponseDTO';
import {Sidebar} from '../../layout/sidebar/sidebar';

export enum Modales {
  PRENDA = 'prenda',
  MARCA = 'marca',
  CATEGORIA = 'categoria',
  TALLA = 'talla',
  LOTE = 'lote',
  DETALLE = 'detalle',
  HISTORIAL = 'historial',
  ELIMINAR = 'eliminar'
}

@Component({
  selector: 'app-home-prenda',
  imports: [
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    MatIcon,
    NgClass,
    NgForOf,
    DatePipe,
    DecimalPipe,
    Sidebar,
  ],
  templateUrl: './home-prenda.html',
  styleUrl: './home-prenda.css',
})
export class HomePrenda implements OnInit {
  prendasLista: PrendaListResponseDTO[] = [];
  prendasListaPaginada: PrendaListResponseDTO[] = [];

  totalPages = 0;
  totalElements = 0;
  currentPage = 0;
  pageSize = 20;
  loading = false;

  cargarPrendas(page: number = 0): void {
    this.loading = true;
    this.prendaService
      .listarPrendas(page, this.itemsPorPagina)
      .subscribe({

        next: (response) => {

          this.prendasLista = response.content;

          this.prendasListaPaginada = response.content;

          this.totalPaginas = response.totalPages;

          this.totalElementos = response.totalElements;

          this.paginaActual = response.number + 1;

          this.paginaInput = this.paginaActual;

          this.loading = false;
        },

        error: (error) => {

          console.error('Error al listar prendas', error);

          this.loading = false;
        }
      });
  }

  modoFijo: boolean = false;
  selectedPrendaId: number | null = null;
  prendaHover: PrendaListResponseDTO | null = null;
  prendaSeleccionada: PrendaListResponseDTO | null = null;
  mostrarMenuAcciones: boolean = false;
  menuX: number = 0;
  menuY: number = 0;

  onHoverPrenda(prenda: PrendaListResponseDTO): void {
    if (this.modoFijo) return;
    this.prendaHover = prenda;
    this.selectedPrendaId = prenda.idPrenda;
  }

  onLeavePrenda(): void {
    if (this.modoFijo) return;
    this.prendaHover = null;
    this.selectedPrendaId = null;
  }

  seleccionarPrenda(prenda: PrendaListResponseDTO): void {
    this.prendaSeleccionada = prenda;
    this.selectedPrendaId = prenda.idPrenda;
  }

  activarModoFijo(): void {
    this.modoFijo = true;
  }

  desactivarModoFijo(): void {
    this.modoFijo = false;
    this.selectedPrendaId = null;
    this.prendaSeleccionada = null;
    this.cerrarMenu();
  }

  abrirMenu(event: MouseEvent, prenda: PrendaListResponseDTO): void {
    event.stopPropagation();
    this.prendaSeleccionada = prenda;
    this.selectedPrendaId = prenda.idPrenda;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.menuVisible = true;
  }

  cerrarMenu(): void {
    this.mostrarMenuAcciones = false;
  }

  accionMenu(accion: string): void {
    if (!this.prendaSeleccionada) return;
    switch (accion) {
      case 'editar':
        this.menuVisible = false;
        this.abrirEditarPrenda(this.prendaSeleccionada);
        break;
      case 'lote':
        this.menuVisible = false;
        this.abrirModalLote(this.prendaSeleccionada);
        break;
      case 'detalle':
        this.menuVisible = false;
        this.abrirDetallePrenda(this.prendaSeleccionada);
        break;
      case 'historial':
        this.menuVisible = false;
        this.abrirHistorialLotes(this.prendaSeleccionada);
        break;
      case 'copiar':
        this.menuVisible = false;
        this.copiarPrenda(this.prendaSeleccionada);
        break;
      case 'desactivar':
        this.menuVisible = false;
        this.toggleEstadoPrenda(this.prendaSeleccionada);
        break;
      case 'eliminar':
        this.menuVisible = false;
        this.abrirModalEliminar(this.prendaSeleccionada);
        break;
    }
  }

  paginaActual: number = 1;
  itemsPorPagina: number = 20;
  totalPaginas: number = 1;
  paginaInput: number = 1;
  totalElementos: number = 0;
  private stepperSubscription?: Subscription;

  cambiarPagina(page: number): void {
    if (page < 1 || page > this.totalPaginas) return;
    this.cargarPrendas(page - 1);
  }

  irAPagina(page: number): void {
    if (!page || page < 1) {
      this.paginaInput = this.paginaActual;
      return;
    }
    if (page > this.totalPaginas) {
      this.paginaInput = this.totalPaginas;
      return;
    }
    this.cambiarPagina(page);
  }

  getPaginas(): (number | string)[] {
    const paginas: (number | string)[] = [];
    if (this.totalPaginas <= 7) {
      for (let i = 1; i <= this.totalPaginas; i++) {
        paginas.push(i);
      }
      return paginas;
    }
    paginas.push(1);
    if (this.paginaActual > 3) {
      paginas.push('...');
    }
    const inicio = Math.max(2, this.paginaActual - 1);
    const fin = Math.min(
      this.totalPaginas - 1,
      this.paginaActual + 1
    );
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    if (this.paginaActual < this.totalPaginas - 2) {
      paginas.push('...');
    }
    paginas.push(this.totalPaginas);
    return paginas;
  }

  aumentarItems(): void {
    if (this.itemsPorPagina >= 50) return;
    this.itemsPorPagina++;
    this.cargarPrendas(0);
  }

  disminuirItems(): void {
    if (this.itemsPorPagina <= 1) return;
    this.itemsPorPagina--;
    this.cargarPrendas(0);
  }

  startAumentar(): void {
    this.aumentarItems();
    this.stopStepper();
    this.stepperSubscription = interval(120)
      .subscribe(() => {
        if (this.itemsPorPagina < 50) {
          this.aumentarItems();
        }
      });
  }

  startDisminuir(): void {
    this.disminuirItems();
    this.stopStepper();
    this.stepperSubscription = interval(120)
      .subscribe(() => {
        if (this.itemsPorPagina > 1) {
          this.disminuirItems();
        }
      });
  }

  stopStepper(): void {
    if (this.stepperSubscription) {
      this.stepperSubscription.unsubscribe();
      this.stepperSubscription = undefined;
    }
  }

  modalActivo: Modales | null = null;

  categoriaForm!: FormGroup;
  categorias: CategoriaResponseDTO[] = [];
  loadingCategoria: boolean = false;
  marcaForm!: FormGroup;
  marcas: MarcaResponseDTO[] = [];
  loadingMarca: boolean = false;
  tallaForm!: FormGroup;
  tallas: TallaResponseDTO[] = [];
  loadingTalla: boolean = false;
  modoEdicion: boolean = false;
  prendaForm!: FormGroup;
  loadingPrenda: boolean = false;
  dropdownCategoriaOpen: boolean = false;
  dropdownMarcaOpen: boolean = false;
  selectedCategoria: CategoriaResponseDTO | null = null;
  selectedMarca: MarcaResponseDTO | null = null;
  colorTemporalControl = new FormControl('');
  fechaActual: Date = new Date();
  loteForm!: FormGroup;
  loadingLote: boolean = false;
  ultimoLote: UltimoLoteResponseDTO | null = null;
  metricasSimuladas: any = null;
  selectorActivo: boolean = false;
  inventarioIndexSeleccionado: number | null = null;
  prendaDetalle: PrendaDetalleDTO | null = null;
  metricaLoteDetalle: MetricaLoteDTO | null = null;
  metricaVisible: boolean = false;
  metricaDisponible: boolean = false;
  historialPrenda: LoteHistorialResponseDTO[] = [];
  hoverLote: number | null = null;
  mostrarInventarioSiempre: boolean = false;
  confirmacionEliminar: string = '';

  initForms(): void {
    this.categoriaForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ]
    });
    this.marcaForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ]

    });
    this.tallaForm = this.fb.group({
      nombre: ['',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ]
    });
    this.prendaForm = this.fb.group({
      material: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],
      descripcion: [''],
      imagenUrl: [''],
      categoriaId: [null, Validators.required],
      marcaId: [null, Validators.required],
      colores: this.fb.array([])
    });
    this.loteForm = this.fb.group({
      cantidadInicial: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      precioCompraTotal: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      precioVenta: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      inventarios: this.fb.array([])
    });
    this.loteForm.valueChanges.subscribe(() => {
      this.calcularMetricasSimuladas();
    });
  }

  abrirModal(modal: Modales): void {
    this.modalActivo = modal;
  }

  cerrarModal(): void {

    this.modalActivo = null;

    this.confirmacionEliminar = '';

    this.prendaDetalle = null;

    this.metricaLoteDetalle = null;

    this.historialPrenda = [];

    this.hoverLote = null;

    this.mostrarInventarioSiempre = false;

    this.metricaVisible = false;

    this.selectorActivo = false;

    this.inventarioIndexSeleccionado = null;

    this.categoriaForm?.reset();

    this.marcaForm?.reset();

    this.tallaForm?.reset();

    this.prendaForm?.reset();

    this.loteForm?.reset();
  }

  listarCategorias(): void {
    this.categoriaService
      .listarCategorias()
      .subscribe({
        next: (response) => {
          this.categorias = response;
        },
        error: (error) => {
          console.error(error);
          this.mostrarToastMensaje(
            'Error al listar categorías',
            'error'
          );
        }
      });
  }

  crearCategoria(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      this.mostrarToastMensaje(
        'Complete correctamente el formulario',
        'error');
      return;
    }
    if (this.loadingCategoria) return;
    this.loadingCategoria = true;
    const dto: CategoriaRegistroDTO = {
      nombre: this.categoriaForm.value.nombre.trim()
    };
    this.categoriaService
      .registrarCategoria(dto)
      .subscribe({
        next: (response) => {
          this.categorias.unshift(response);
          this.loadingCategoria = false;
          this.mostrarToastMensaje(
            'Categoría creada correctamente',
            'success');
          this.cerrarModal();
        },
        error: (error) => {
          console.error(error);
          this.loadingCategoria = false;
          let mensaje = 'Error al crear categoría';
          if (error?.error?.message) {
            mensaje = error.error.message;
          }
          this.mostrarToastMensaje(
            mensaje,
            'error'
          );
        }
      });
  }

  listarMarcas(): void {
    this.marcaService
      .listarMarcas()
      .subscribe({
        next: (response) => {
          this.marcas = response;
        },
        error: (error) => {
          console.error(error);
          this.mostrarToastMensaje(
            'Error al listar marcas',
            'error'
          );
        }
      });
  }

  crearMarca(): void {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      this.mostrarToastMensaje(
        'Complete correctamente el formulario',
        'error');
      return;
    }
    if (this.loadingMarca) return;
    this.loadingMarca = true;
    const dto: MarcaRegistroDTO = {
      nombre: this.marcaForm.value.nombre.trim()
    };
    this.marcaService
      .registrarMarca(dto)
      .subscribe({
        next: (response) => {
          this.marcas.unshift(response);
          this.loadingMarca = false;
          this.mostrarToastMensaje(
            'Marca creada correctamente',
            'success'
          );
          this.cerrarModal();
        },
        error: (error) => {
          console.error(error);
          this.loadingMarca = false;
          let mensaje = 'Error al crear marca';
          if (error?.error?.message) {
            mensaje = error.error.message;
          }
          this.mostrarToastMensaje(
            mensaje,
            'error'
          );
        }
      });
  }

  listarTallas(): void {
    this.tallaService
      .listarTallas()
      .subscribe({
        next: (response) => {
          this.tallas = response;
        },
        error: (error) => {
          console.error(error);
          this.mostrarToastMensaje(
            'Error al listar tallas',
            'error'
          );
        }
      });
  }

  crearTalla(): void {
    if (this.tallaForm.invalid) {
      this.tallaForm.markAllAsTouched();
      this.mostrarToastMensaje(
        'Complete correctamente el formulario',
        'error');
      return;
    }
    if (this.loadingTalla) return;
    this.loadingTalla = true;
    const dto: TallaRegistroDTO = {
      nombre: this.tallaForm.value.nombre.trim()
    };
    this.tallaService
      .registrarTalla(dto)
      .subscribe({
        next: (response) => {
          this.tallas.unshift(response);
          this.loadingTalla = false;
          this.mostrarToastMensaje(
            'Talla creada correctamente',
            'success');
          this.cerrarModal();
        },
        error: (error) => {
          console.error(error);
          this.loadingTalla = false;
          let mensaje = 'Error al crear talla';
          if (error?.error?.message) {
            mensaje = error.error.message;
          }
          this.mostrarToastMensaje(
            mensaje,
            'error'
          );
        }
      });
  }

  get colores(): FormArray {
    return this.prendaForm.get('colores') as FormArray;
  }

  get prendaTieneDatos(): boolean {
    return !!(
      this.prendaForm.get('material')?.value ||
      this.prendaForm.get('descripcion')?.value ||
      this.prendaForm.get('imagenUrl')?.value ||
      this.colores.length > 0 ||
      this.selectedCategoria ||
      this.selectedMarca
    );
  }

  toggleDropdown(tipo: string, event: Event): void {
    event.stopPropagation();
    if (tipo === 'categoria') {
      this.dropdownCategoriaOpen =
        !this.dropdownCategoriaOpen;
      this.dropdownMarcaOpen = false;
    }
    if (tipo === 'marca') {
      this.dropdownMarcaOpen =
        !this.dropdownMarcaOpen;
      this.dropdownCategoriaOpen = false;
    }
  }

  selectCategoria(categoria: CategoriaResponseDTO, event: Event): void {
    event.stopPropagation();
    this.selectedCategoria = categoria;
    this.prendaForm.patchValue({
      categoriaId: categoria.idCategoria
    });
    this.dropdownCategoriaOpen = false;
  }

  selectMarca(marca: MarcaResponseDTO, event: Event): void {
    event.stopPropagation();
    this.selectedMarca = marca;
    this.prendaForm.patchValue({
      marcaId: marca.idMarca
    });
    this.dropdownMarcaOpen = false;
  }

  agregarColor(): void {
    const color =
      this.colorTemporalControl.value?.trim();
    if (!color) return;
    const existe =
      this.colores.value.includes(color);
    if (existe) {
      this.mostrarToastMensaje(
        'Ese color ya fue agregado',
        'error');
      return;
    }
    this.colores.push(
      this.fb.control(color)
    );
    this.colorTemporalControl.reset();
  }

  eliminarColor(index: number): void {
    this.colores.removeAt(index);
  }

  limpiarPrenda(): void {
    this.prendaForm.reset();
    this.colores.clear();
    this.selectedCategoria = null;
    this.selectedMarca = null;
    this.colorTemporalControl.reset();
  }

  guardarPrenda(): void {
    if (this.prendaForm.invalid) {
      this.prendaForm.markAllAsTouched();
      this.mostrarToastMensaje(
        'Complete correctamente el formulario',
        'error');
      return;
    }
    if (this.loadingPrenda) return;
    this.loadingPrenda = true;
    const dto: PrendaRegistroDTO = {
      nombre: this.prendaForm.value.nombre.trim(),
      material: this.prendaForm.value.material.trim(),
      descripcion: this.prendaForm.value.descripcion?.trim(),
      imagenUrl: this.prendaForm.value.imagenUrl?.trim(),
      categoriaId: this.prendaForm.value.categoriaId,
      marcaId: this.prendaForm.value.marcaId,
      colores: this.prendaForm.value.colores
    };
    this.prendaService
      .registrarPrenda(dto)
      .subscribe({
        next: () => {
          this.loadingPrenda = false;
          this.mostrarToastMensaje(
            'Prenda registrada correctamente',
            'success');
          this.cargarPrendas();
          this.limpiarPrenda();
          this.cerrarModal();
        },
        error: (error) => {
          console.error(error);
          this.loadingPrenda = false;
          let mensaje = 'Error al registrar prenda';
          if (error?.error?.message) {
            mensaje = error.error.message;
          }
          this.mostrarToastMensaje(mensaje, 'error');
        }
      });
  }

  get inventarios(): FormArray {
    return this.loteForm.get('inventarios') as FormArray;
  }

  get stockRestante(): number {
    const cantidadInicial =
      Number(this.loteForm.value.cantidadInicial || 0);
    const sumaInventarios =
      this.inventarios.controls.reduce((acc, inv) => {
        return acc + Number(inv.get('stock')?.value || 0);
      }, 0);
    return cantidadInicial - sumaInventarios;
  }

  eliminarInventario(index: number): void {
    this.inventarios.removeAt(index);
  }

  calcularMetricasSimuladas(): void {
    const cantidad = Number(this.loteForm.value.cantidadInicial || 0);
    const compra = Number(this.loteForm.value.precioCompraTotal || 0);
    const venta = Number(this.loteForm.value.precioVenta || 0);
    if (cantidad <= 0 || compra <= 0 || venta <= 0) {
      this.metricasSimuladas = null;
      return;
    }
    const costoUnitario = compra / cantidad;
    const gananciaUnidad = venta - costoUnitario;
    const ventaTotal = venta * cantidad;
    const gananciaTotal = ventaTotal - compra;
    const margenGanancia = venta !== 0 ? (gananciaUnidad / venta) * 100 : 0;
    const radioInversion = compra !== 0 ? ventaTotal / compra : 0;
    const puntoEquilibrio = gananciaUnidad > 0 ? Math.ceil(compra / gananciaUnidad) : 0;
    this.metricasSimuladas = {
      gananciaUnidad,
      gananciaTotal,
      margenGanancia,
      ventaTotal,
      radioInversion,
      puntoEquilibrio,
      icono: gananciaTotal > 0
        ? 'trending_up'
        : 'trending_down',
      iconoColor:
        gananciaTotal > 0
          ? 'success'
          : 'danger'
    };
  }

  cargarUltimoLote(idPrenda: number): void {
    this.loteService
      .obtenerUltimoLotePrenda(idPrenda)
      .subscribe({
        next: (response) => {
          this.ultimoLote = response;
        },
        error: () => {
          this.ultimoLote = null;
        }
      });
  }

  abrirModalLote(prenda: PrendaListResponseDTO): void {
    this.prendaSeleccionada = prenda;
    this.modalActivo = Modales.LOTE;
    this.agregarInventario();
    this.cargarUltimoLote(prenda.idPrenda);
  }

  registrarLote(): void {
    if (!this.prendaSeleccionada) {
      this.mostrarToastMensaje(
        'Seleccione una prenda',
        'error');
      return;
    }
    if (this.loteForm.invalid) {
      this.loteForm.markAllAsTouched();
      this.mostrarToastMensaje(
        'Complete correctamente el formulario',
        'error');
      return;
    }
    if (this.stockRestante !== 0) {
      this.mostrarToastMensaje(
        'La suma de inventarios debe coincidir con la cantidad total',
        'error');
      return;
    }
    const tallasIds =
      this.inventarios.controls.map(inv => inv.get('tallaId')?.value);
    const tallasDuplicadas = new Set(tallasIds).size !== tallasIds.length;
    if (tallasDuplicadas) {
      this.mostrarToastMensaje(
        'No se permiten tallas repetidas',
        'error');
      return;
    }
    if (this.loadingLote) return;
    this.loadingLote = true;
    const inventariosDTO: InventarioRegistroDTO[] = this.inventarios.controls.map(inv => ({
      tallaId: inv.get('tallaId')?.value,
      stock: Number(inv.get('stock')?.value)
    }));
    const dto: LoteRegistroDTO = {
      cantidadInicial: Number(this.loteForm.value.cantidadInicial),
      precioCompraTotal: Number(this.loteForm.value.precioCompraTotal),
      precioVenta: Number(this.loteForm.value.precioVenta),
      prendaId: this.prendaSeleccionada.idPrenda,
      inventarios:
      inventariosDTO
    };
    this.loteService
      .registrarLote(dto)
      .subscribe({
        next: () => {
          this.loadingLote = false;
          this.mostrarToastMensaje(
            'Lote registrado correctamente',
            'success');
          this.cargarPrendas();
          this.cerrarModal();
        },
        error: (error) => {
          console.error(error);
          this.loadingLote = false;
          let mensaje = 'Error al registrar lote';
          if (error?.error?.message) {
            mensaje = error.error.message;
          }
          this.mostrarToastMensaje(
            mensaje,
            'error'
          );
        }
      });
  }

  abrirSelector(index: number): void {
    this.inventarioIndexSeleccionado = index;
    this.selectorActivo = true;
  }

  cerrarSelector(): void {
    this.selectorActivo = false;
    this.inventarioIndexSeleccionado = null;
  }

  seleccionarTalla(talla: TallaResponseDTO): void {
    if (this.inventarioIndexSeleccionado === null) return;
    const existe =
      this.inventarios.controls.some((inv, index) => {
        if (index === this.inventarioIndexSeleccionado) {
          return false;
        }
        return inv.get('tallaId')?.value === talla.idTalla;
      });
    if (existe) {
      this.mostrarToastMensaje(
        'Esa talla ya fue seleccionada',
        'error');
      return;
    }
    this.inventarios
      .at(this.inventarioIndexSeleccionado)
      .patchValue({
        tallaId: talla.idTalla
      });
    this.cerrarSelector();
  }

  obtenerNombreTalla(index: number): string {
    const tallaId =
      this.inventarios
        .at(index)
        .get('tallaId')
        ?.value;
    if (!tallaId) return 'Seleccionar talla';
    const talla =
      this.tallas.find(
        t => t.idTalla === tallaId);
    return talla?.nombre || 'Seleccionar talla';
  }

  agregarInventario(): void {
    const inventarioForm = this.fb.group({
      tallaId: [null, Validators.required],
      stock: [
        null,
        [
          Validators.required,
          Validators.min(1)
        ]
      ]
    });
    this.inventarios.push(inventarioForm);
  }

  abrirDetallePrenda(prenda: PrendaListResponseDTO): void {
    this.prendaSeleccionada = prenda;
    this.modalActivo = Modales.DETALLE;
    this.obtenerDetallePrenda(prenda.idPrenda);
  }

  obtenerDetallePrenda(idPrenda: number): void {
    this.prendaService
      .obtenerDetallePrenda(idPrenda)
      .subscribe({
        next: (response) => {
          this.prendaDetalle = response;
          this.metricaLoteDetalle = response.metricas;
          this.metricaDisponible = !!response.metricas;},
        error: (error) => {
          console.error(error);
          this.mostrarToastMensaje(
            'Error al obtener detalle de la prenda',
            'error');
          this.cerrarModal();
        }
      });
  }

  abrirMetrica(): void {
    if (!this.prendaDetalle?.metricas) return;
    this.metricaVisible =
      !this.metricaVisible;
  }

  abrirHistorialLotes(prenda: PrendaListResponseDTO): void {
    this.prendaSeleccionada = prenda;
    this.modalActivo = Modales.HISTORIAL;
    this.obtenerHistorialLotes(
      prenda.idPrenda);
  }

  obtenerHistorialLotes(idPrenda: number): void {
    this.loteService
      .listarHistorialLotes(idPrenda)
      .subscribe({
        next: (response) => {this.historialPrenda = response;},
        error: (error) => {
          console.error(error);
          this.mostrarToastMensaje(
            'Error al obtener historial de lotes',
            'error');
          this.cerrarModal();
        }
      });
  }

  toggleInventarioSiempre(): void {
    this.mostrarInventarioSiempre =
      !this.mostrarInventarioSiempre;
  }

  abrirModalEliminar(prenda: PrendaListResponseDTO): void {
    this.prendaSeleccionada = prenda;
    this.confirmacionEliminar = '';
    this.modalActivo = Modales.ELIMINAR;
  }

  eliminarPrenda(): void {
    if (!this.prendaSeleccionada) {
      this.mostrarToastMensaje(
        'No hay prenda seleccionada',
        'error');
      return;
    }
    if (this.confirmacionEliminar.trim() !== 'ELIMINAR') {
      this.mostrarToastMensaje(
        'Debe escribir ELIMINAR para confirmar',
        'error');
      return;
    }
    this.prendaService
      .eliminarPrenda(this.prendaSeleccionada.idPrenda)
      .subscribe({
        next: () => {
          this.mostrarToastMensaje(
            'Prenda eliminada correctamente',
            'success');
          this.cargarPrendas();
          this.cerrarModal();
        },
        error: (error) => {
          console.error(error);
          let mensaje =
            'Error al eliminar la prenda';
          if (error?.error?.message) {
            mensaje = error.error.message;
          }
          this.mostrarToastMensaje(
            mensaje,
            'error'
          );
        }
      });
  }

  copiarPrenda(prenda: PrendaListResponseDTO): void {
    navigator.clipboard
      .writeText(
        JSON.stringify(prenda)
      )
      .then(() => {
        this.mostrarToastMensaje(
          'Prenda copiada',
          'success'
        );
      })
      .catch(() => {
        this.mostrarToastMensaje(
          'Error al copiar',
          'error'
        );
      });
  }

  toggleEstadoPrenda(prenda: PrendaListResponseDTO): void {
    if (prenda.estado === 'INHABILITADA') {
      this.prendaService
        .activarPrenda(prenda.idPrenda)
        .subscribe({
          next: () => {
            this.mostrarToastMensaje(
              'Prenda activada correctamente',
              'success');
            this.cargarPrendas();
          },
          error: (error) => {
            console.error(error);
            this.mostrarToastMensaje(
              'Error al activar prenda',
              'error'
            );
          }
        });
      return;
    }
    this.abrirModalEliminar(prenda);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.cerrarMenu();
  }

  abrirEditarPrenda(prenda: PrendaListResponseDTO): void {
    this.mostrarToastMensaje(
      'Modo edición próximamente',
      'success');
  }

  // -------------------- TOAST --------------------
  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  // -------------------- MENÚ CONTEXTUAL --------------------
  prendaSeleccionadaId: number | null = null;
  menuVisible: boolean = false;
  menuWidth: number = 160;
  menuHeight: number = 200;

  // -------------------- DATOS --------------------
  hoverPrendaId: number | null = null;

  sidebarExpanded = true;

  protected readonly Modales = Modales;

  constructor(
    private fb: FormBuilder,
    private prendaService: PrendaService,
    private marcaService: MarcaService,
    private categoriaService: CategoriaService,
    private tallaService: TallaService,
    private loteService: LoteService,
    private metricaService: MetricaService) {
  }

  ngOnInit(): void {
    this.cargarPrendas();
    this.initForms();
    this.listarCategorias();
    this.listarMarcas();
    this.listarTallas();
    this.cargarItemsPorPagina();
  }

  // -------------------- TOAST --------------------
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


  // -------------------- MENÚ CONTEXTUAL --------------------
  private closeMenu = () => {
    this.menuVisible = false;
    window.removeEventListener('click', this.closeMenu);
    window.removeEventListener('scroll', this.closeMenu, true);
    window.removeEventListener('wheel', this.closeMenu, true);
  };

  // -------------------- UTILS --------------------
  onToggleSidebar(state: boolean) {
    this.sidebarExpanded = state;
  }

  metricasSub: any;

  getEstadoClass(estado?: string) {
    const e = estado?.toLowerCase();
    if (e === 'disponible') return 'status-disponible';
    if (e === 'agotado') return 'status-agotado';
    if (e === 'sin lotes') return 'status-sinlotes';
    return 'status-otro';
  }

  cargarItemsPorPagina() {
    const valorGuardado = localStorage.getItem('itemsPorPagina');
    if (valorGuardado) {
      const valor = Number(valorGuardado);
      if (!isNaN(valor) && valor >= 1 && valor <= 50) {
        this.itemsPorPagina = valor;
      }
    }
  }

  guardarItemsPorPagina() {
    localStorage.setItem('itemsPorPagina', this.itemsPorPagina.toString());
  }


  prendasFiltradas: PrendaListadoDTO[] = [];
  busquedaPrenda: string = '';

  filtrarPrendas() {
    let lista = [...this.prendasLista];
    const busqueda = this.busquedaPrenda?.trim().toLowerCase() || '';
    const categoria = this.filtroCategoria;
    const marca = this.filtroMarca;
    const estado = this.filtroEstado;
    const stockMin = this.filtroStockMin;
    const stockMax = this.filtroStockMax;
    const precioMin = this.filtroPrecioMin;
    const precioMax = this.filtroPrecioMax;
    const tieneColores = this.filtroTieneColores;
  }

  limpiarFiltros() {
    this.busquedaPrenda = '';
    this.filtroCategoria = null;
    this.filtroMarca = null;
    this.filtroEstado = null;
    this.filtroStockMin = null;
    this.filtroStockMax = null;
    this.filtroPrecioMin = null;
    this.filtroPrecioMax = null;
    this.filtroTieneColores = null;
    this.filtrarPrendas();
  }

  limpiarBuscador() {
    this.busquedaPrenda = '';
    this.filtrarPrendas();
  }

  buscarPrenda() {
    if (!this.prendaForm) return;
    this.limpiarFiltros();
    const formValues = this.prendaForm.value;
    const busqueda = formValues.material?.trim() || '';
    const descripcion = formValues.descripcion?.trim() || '';
    const estado = formValues.estado || null;
    const categoriaId = this.selectedCategoria?.idCategoria ?? null;
    const marcaId = this.selectedMarca?.idMarca ?? null;
    this.busquedaPrenda = busqueda;
    if (descripcion) {
      this.busquedaPrenda += this.busquedaPrenda ? `, ${descripcion}` : descripcion;}
    this.filtroCategoria = categoriaId;
    this.filtroMarca = marcaId;
    this.filtroEstado = estado;
    this.filtrarPrendas();
    this.cerrarModal();
  }

  filtroStockMin: number | null = null;
  filtroStockMax: number | null = null;
  filtroPrecioMin: number | null = null;
  filtroPrecioMax: number | null = null;
  filtroTieneColores: boolean | null = null;
  filtroCategoria: number | null = null;
  filtroMarca: number | null = null;
  filtroEstado: string | null = null;
  dropdownCategoriaFiltro = false;
  dropdownMarcaFiltro = false;
  dropdownEstadoFiltro = false;
  estados = ['DISPONIBLE','AGOTADO','SIN LOTES','INACTIVO'];

  @HostListener('document:click', ['$event'])
  clickFuera(event: Event) {
    this.dropdownCategoriaFiltro = false;
    this.dropdownMarcaFiltro = false;
    this.dropdownEstadoFiltro = false;
    this.dropdownColorFiltro = false;
  }

  get categoriaSeleccionada(): string {
    return this.categorias.find(cat => cat.idCategoria === this.filtroCategoria)?.nombre || 'Categoria';
  }

  get marcaSeleccionada(): string {
    return this.marcas.find(m => m.idMarca === this.filtroMarca)?.nombre || 'Marca';
  }

  seleccionarCategoria(id: number | null) {
    this.filtroCategoria = this.filtroCategoria === id ? null : id;
    this.dropdownCategoriaFiltro = false;
    this.filtrarPrendas();
  }

  seleccionarMarca(id: number | null) {
    this.filtroMarca = this.filtroMarca === id ? null : id;
    this.dropdownMarcaFiltro = false;
    this.filtrarPrendas();
  }

  seleccionarEstado(estado: string | null) {
    this.filtroEstado = this.filtroEstado === estado ? null : estado;
    this.dropdownEstadoFiltro = false;
    this.filtrarPrendas();
  }

  toggleCategoria(event: Event){
    event.stopPropagation();
    this.dropdownCategoriaFiltro = !this.dropdownCategoriaFiltro;
    this.dropdownMarcaFiltro = false;
    this.dropdownEstadoFiltro = false;
  }

  toggleMarca(event: Event){
    event.stopPropagation();
    this.dropdownMarcaFiltro = !this.dropdownMarcaFiltro;
    this.dropdownCategoriaFiltro = false;
    this.dropdownEstadoFiltro = false;
  }

  toggleEstado(event: Event){
    event.stopPropagation();
    this.dropdownEstadoFiltro = !this.dropdownEstadoFiltro;
    this.dropdownCategoriaFiltro = false;
    this.dropdownMarcaFiltro = false;
  }

  dropdownColorFiltro = false;

  get colorSeleccionado(): string {
    if (this.filtroTieneColores === true) return 'Si Tiene';
    if (this.filtroTieneColores === false) return 'No Tiene';
    return 'Ambas Opciones';
  }

  toggleColor(event: Event){
    event.stopPropagation();
    this.dropdownColorFiltro = !this.dropdownColorFiltro;
    this.dropdownCategoriaFiltro = false;
    this.dropdownMarcaFiltro = false;
    this.dropdownEstadoFiltro = false;
  }

  seleccionarColor(valor: boolean | null){
    this.filtroTieneColores = this.filtroTieneColores === valor ? null : valor;
    this.dropdownColorFiltro = false;
    this.filtrarPrendas();
  }

  filtrosAvanzadosActivos: boolean = false;

  panelAjustesVisible = false;
  panelAjustesX = 0;
  panelAjustesY = 0;
  panelWidth = 600;
  panelHeight = 130;

  abrirPanelAjustes(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.panelAjustesVisible) {
      this.cerrarPanelAjustes();
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    this.panelAjustesY = (rect.bottom + this.panelHeight > viewportHeight) ? Math.max(8, rect.top - this.panelHeight) : rect.bottom + 5;
    this.panelAjustesX = Math.min(viewportWidth - this.panelWidth - 8, Math.max(8, centerX - this.panelWidth / 2 + 15)
    );
    this.panelAjustesVisible = true;
    setTimeout(() => {
      window.addEventListener('click', this.cerrarPanelAjustes);
      window.addEventListener('scroll', this.cerrarPanelAjustes, true);
      window.addEventListener('wheel', this.cerrarPanelAjustes, true);
    });
  }

  cerrarPanelAjustes = () => {
    this.panelAjustesVisible = false;
    window.removeEventListener('click', this.cerrarPanelAjustes);
  };

  guardarEstado() {
    localStorage.setItem('filtrosAvanzados', this.filtrosAvanzadosActivos.toString());
  }

  clipboardDisponible = false;

  async checkClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        this.clipboardDisponible = false;
        return;
      }
      const data = JSON.parse(text);
      this.clipboardDisponible = !!data?.material;
    } catch {
      this.clipboardDisponible = false;
    }
  }

  get puedeBuscar(): boolean {
    const form = this.prendaForm;
    return !!(
      form.value.material?.trim() &&
      this.selectedCategoria &&
      this.selectedMarca
    );
  }

  categoriaSeleccionadaId!: number;
  archivoSeleccionado!: File;
  previewUrl: string | ArrayBuffer | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.archivoSeleccionado = file;

    // preview GOD
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }
}
