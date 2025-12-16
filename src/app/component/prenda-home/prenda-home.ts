import {Component, inject, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Prenda} from '../../model/prenda';
import {PrendaService} from '../../services/prenda-service';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {CommonModule, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {
  FormArray,
  FormBuilder, FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {forkJoin, lastValueFrom} from 'rxjs';
import {MarcaService} from '../../services/marca-service';
import {Marca} from '../../model/marca';
import {MatInput, MatInputModule} from '@angular/material/input';
import {MatOption, MatSelect, MatSelectModule} from '@angular/material/select';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {CategoriaService} from '../../services/categoria-service';
import {Categoria} from '../../model/categoria';
import {SidebarComponent} from '../sidebar-component/sidebar-component';
import {MatListItem, MatNavList} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import { of, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {MatNativeDateModule} from '@angular/material/core';
import {
  ArcElement,
  Chart,
  ChartData, ChartOptions, ChartType,
  Legend,
  PieController,
  Tooltip
} from 'chart.js';
import {NgChartsModule} from 'ng2-charts';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import {PrendaMetricas} from '../../model/prendametricas';
import {PrendaMetricaService} from '../../services/prendametricas-service';
import {Lote} from '../../model/lote';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {Topprenda} from '../../model/topprenda';
import {Talla} from '../../model/talla';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';

Chart.register(ArcElement, PieController, Tooltip, Legend);

@Component({
  selector: 'app-prenda-home',
  imports: [
    MatSlideToggleModule,
    NgForOf,
    FormsModule,
    NgIf,
    MatInput,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    SidebarComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatNativeDateModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    CommonModule,
    RouterModule,
    NgChartsModule,
    NgOptimizedImage,
    MatDatepickerToggle,
    MatDatepickerInput,
    MatDatepicker,
    MatListItem,
    MatNavList,
    MatIcon,
    MatCheckbox,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
  ],
  templateUrl: './prenda-home.html',
  styleUrl: './prenda-home.css'
})
export class PrendaHome implements OnInit {
  // PROPIEDADES
  prendaForm!: FormGroup;
  categoriaForm!: FormGroup;
  marcaForm!: FormGroup;
  listaMarcas: any[] = [];
  listaCategorias: any[] = [];
  prendas: Prenda[] = [];
  edicion: boolean = false;
  idEdicion?: number;
  busquedaCalidad: string = '';
  prendaActual!: Prenda | null;
  prendaDuplicada = false;
  tallaDuplicada: boolean = false;
  metricaPrenda: PrendaMetricas | null = null;
  lotesHistorial: Lote[] = [];

  registrar = false;
  mostrarError = false;

  stockRestante: number = 0;

  // Modal y UI
  mostrarModal = false;
  mostrarModalCategoria = false;
  mostrarModalMarca = false;
  mostrarModalConfirmacion = false;
  mostrarModalDetalles = false;
  mostrarMensajeCopiado = false;

  // Menú contextual
  menuVisible = false;
  menuX = 0;
  menuY = 0;
  prendaSeleccionada: Prenda | null = null;

  // Eliminación
  prendaAEliminar: Prenda | null = null;
  indicePrendaAEliminar: number | null = null;
  idPrendaAEliminar: number | null = null;

  // Copia
  prendaCopiada: any = null;
  prendaDetalles: Prenda | null = null;

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;
  paginaInput: number = 1;
  panelAbierto = false;

  // Filtros
  listaOriginal: Prenda[] = [];
  listaFiltrada: Prenda[] = [];
  busquedaDescripcion: string = '';
  idCategoriaFiltro: number | null = null;
  idMarcaFiltro: number | null = null;
  estadoFiltro: string = '';
  busquedaFecha: Date | null = null;
  fechaDesde: string | null = null;
  fechaHasta: string | null = null;
  marcasFiltro: Marca[] = [];
  categoriasFiltro: Categoria[] = [];
  marcasTodas: Marca[] = [];

  // Gráfico
  pieChartType: ChartType = 'pie';
  pieChartLabels: string[] = [];
  pieChartData: ChartData<'pie', number[], string> = { labels: [], datasets: [{ data: [] }] };
  pieChartOptions: ChartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };
  categoriasPorcentaje: { nombre: string; total: number; porcentaje: number }[] = [];

  // Índices
  indicePrendaSeleccionada: number | null = null;

  // Flags de éxito/error
  categoriaGuardada = false;
  errorCategoria = false;
  marcaGuardado = false;
  errorMarca = false;

  // === CONSTRUCTOR ===
  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private prendaService: PrendaService,
    private prendametricaService: PrendaMetricaService,
    private marcaService: MarcaService,
    private categoriaService: CategoriaService,
  ) {}


  //Convierte el valor de un FormControl a mayúsculas.
  private toUpperCase(control: AbstractControl): void {
    const value = control.value;
    if (typeof value === 'string' && value !== value.toUpperCase()) {
      control.setValue(value.toUpperCase());
    }
  }

  // === CICLO DE VIDA ===
  ngOnInit(): void {

    console.log('🔥 ngOnInit DISPARADO');

    this.prendaForm = this.fb.group({
      categoria: ['', Validators.required],
      marca: ['', Validators.required],
      calidad: ['', Validators.required],
      estado: [{ value: 'Disponible', disabled: true }],
      fechaRegistro: [{ value: new Date(), disabled: true }],
      precioCompra: [null, [Validators.required, Validators.min(0)]],
      precioVenta: [null, [Validators.required, Validators.min(0)]],
      descripcion: [''],
      stock: [0, [Validators.required, Validators.min(1)]], // 👈 NO string
      tallas: this.fb.array([]),
      colores: this.fb.array([])
    }, {
      validators: [
        this.validarStockVsTallas,
        this.validarStockConTallas
      ]
    });

    // 🔁 cuando cambian tallas → revalida el form
    this.tallas.valueChanges.subscribe(() => {
      this.prendaForm.updateValueAndValidity({ emitEvent: false });
    });

    // 🔁 cuando cambia stock
    this.prendaForm.get('stock')?.valueChanges.subscribe(() => {
      this.actualizarStockRestante();
      this.actualizarEstado();
      this.prendaForm.updateValueAndValidity({ emitEvent: false });
    });

    // cargas normales
    this.listarCategorias();
    this.cargarCategorias();
    this.cargarTodasLasMarcas();
    this.configurarOpciones();
    this.cargarPrendas();
    this.cargarGrafico();
    this.reiniciarFiltros();
    this.actualizarGraficoMarcas();
  }

  // === INICIALIZACIÓN DE FORMULARIOS ===
  cargarCategorias(): void {
    this.categoriaService.list().subscribe({
      next: (cats) => {
        this.categoriasFiltro = cats;
      },
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  cargarTodasLasMarcas() {
    this.marcaService.list().subscribe(marcas => {
      this.marcasTodas = marcas;
    });
  }

  async cargarDatosEnModal(prenda: Prenda) {
    if (!prenda) return;

    this.prendaActual = prenda;

    const idCategoria = prenda.marca?.categoria?.idCategoria ?? null;
    const idMarca = prenda.marca?.idMarca ?? null;

    // ===== 1️⃣ DATOS BÁSICOS (SIN MARCA AÚN) =====
    this.prendaForm.patchValue({
      idPrenda: prenda.idPrenda ?? null,
      calidad: prenda.calidad ?? '',
      precioCompra: prenda.precioCompra ?? null,
      precioVenta: prenda.precioVenta ?? null,
      estado: prenda.estado ?? 'Disponible',
      descripcion: prenda.descripcion ?? '',
      categoria: idCategoria,
      fechaRegistro: prenda.fechaRegistro ?? new Date()
    }, { emitEvent: false });

    // ===== 2️⃣ COLORES =====
    const coloresFA = this.prendaForm.get('colores') as FormArray;
    coloresFA.clear();

    (prenda.colores ?? []).forEach(color =>
      coloresFA.push(this.fb.control(color))
    );

    // ===== 3️⃣ TALLAS + STOCK REAL =====
    const tallasFA = this.prendaForm.get('tallas') as FormArray;
    tallasFA.clear();

    let totalStock = 0;

    (prenda.tallas ?? []).forEach(t => {
      totalStock += Number(t.cantidad) || 0;

      tallasFA.push(this.fb.group({
        idTalla: [t.idTalla ?? null],
        size: [t.size ?? '', Validators.required],
        cantidad: [t.cantidad ?? 0, [Validators.required, Validators.min(0)]]
      }));
    });

    this.prendaForm.get('stock')?.setValue(totalStock, { emitEvent: false });
    this.stockRestante = totalStock;

    // ===== 4️⃣ CARGAR MARCAS Y SETEAR MARCA =====
    if (idCategoria) {
      try {
        const marcas = await lastValueFrom(
          this.onCategoriaChange2(idCategoria)
        );

        const marcaSeleccionada =
          marcas.find(m => m.idMarca === idMarca) ?? null;

        this.prendaForm.patchValue(
          { marca: marcaSeleccionada },
          { emitEvent: false }
        );

      } catch (error) {
        console.error('Error cargando marcas:', error);
        this.prendaForm.patchValue({ marca: null });
      }
    } else {
      this.prendaForm.patchValue({ marca: null });
    }

    // ===== 5️⃣ FORZAR VALIDACIONES =====
    this.prendaForm.updateValueAndValidity();
  }

  limpiarBusqueda() {
    this.busquedaCalidad = '';
    this.aplicarFiltros();
  }

  // === LISTADOS (SERVICIOS) ===

  //Obtiene y almacena la lista de marcas
  listarMarcas(): void {
    this.marcaService.list().subscribe({
      next: (data) => (this.listaMarcas = data),
      error: (err) => console.error('Error cargando marcas:', err),
    });
  }

  //Obtiene y almacena la lista de categorías
  listarCategorias(): void {
    this.categoriaService.list().subscribe({
      next: (data) => (this.listaCategorias = data),
      error: (err) => console.error('Error cargando categorías:', err),
    });
  }

  //Refresca la lista de prendas
  listarPrendas(): void {
    this.prendaService.list().subscribe({
      next: (data) => console.log('Prendas actualizadas:', data),
      error: (err) => console.error('Error listando prendas', err)
    });
  }

  //Getter para acceder fácilmente al FormArray de tallas.
  get tallas(): FormArray {
    return this.prendaForm.get('tallas') as FormArray;
  }

  //Agrega un nuevo grupo de talla al formulario.
  agregarTalla(tallaExistente?: any): void {

    if (this.stockRestante <= 0) {
      console.log('🚫 No hay stock disponible para más tallas');
      return;
    }

    const tallaForm = this.fb.group({
      idTalla: [tallaExistente?.idTalla || null],
      size: [
        tallaExistente?.size?.toUpperCase() || '',
        [Validators.required, Validators.maxLength(7)]
      ],
      cantidad: [
        tallaExistente?.cantidad || '',
        [Validators.required, Validators.min(1)]
      ]
    });

    tallaForm.get('size')?.valueChanges.subscribe(val => {
      if (val) {
        const mayus = val.toUpperCase();
        if (val !== mayus) {
          tallaForm.get('size')?.setValue(mayus, { emitEvent: false });
        }
      }
    });

    this.tallas.push(tallaForm);
    this.actualizarStockRestante();
  }


  eliminarTalla(i: number): void {
    this.tallas.removeAt(i);
    this.validarTallasDuplicadas();
    this.actualizarStockRestante();
  }

  validarTallasDuplicadas() {
    const sizes = this.tallas.controls.map(t => t.get('size')?.value.trim().toUpperCase());
    const uniqueSizes = new Set(sizes);
    this.tallaDuplicada = uniqueSizes.size !== sizes.length;
  }

  errorTallaStock = false;

  validarErrorTallas() {
    let total = 0;

    this.tallas.controls.forEach(control => {
      total += Number(control.get('cantidad')?.value) || 0;
    });

    const stock = this.prendaForm.get('stock')?.value || 0;
    this.errorTallaStock = total > stock;
    setTimeout(() => {
      this.errorTallaStock = false;
    }, 1200);
  }


  //Valida que la cantidad ingresada en una talla no exceda el stock disponible.
  validarCantidad(i: number): void {
    const controlCantidad = this.tallas.at(i).get('cantidad');
    const cantidad = Number(controlCantidad?.value) || 0;

    if (cantidad < 0) {
      controlCantidad?.setValue(0);
      return;
    }

    if (!Number.isInteger(cantidad)) {
      controlCantidad?.setValue(Math.floor(cantidad));
      return;
    }

    this.validarErrorTallas();

    this.actualizarStockRestante();
  }

  //Calcula la suma total de cantidades en todas las tallas.
  obtenerTotalTallas(): number {
    return this.tallas.controls.reduce((sum, t) => sum + (t.get('cantidad')?.value || 0), 0);
  }

  //Actualiza el valor de stock restante (stock - total tallas).
  actualizarStockRestante(): void {
    const stock = this.prendaForm.get('stock')?.value || 0;
    const totalTallas = this.obtenerTotalTallas();
    this.stockRestante = stock - totalTallas;
  }

  actualizarEstado(): void {
    const stock = this.prendaForm.get('stock')?.value;
    const estadoCtrl = this.prendaForm.get('estado');

    if (stock === 0) estadoCtrl?.setValue('Agotado');
    else estadoCtrl?.setValue('Disponible');
  }

  // === MANEJO DE MODALES ===


  //Abre el modal en modo creación (nueva prenda).
  abrirModal(): void {
    this.edicion = false;
    this.idEdicion = undefined;
    this.limpiarFormulario();
    this.mostrarModal = true;
    this.mostrarColores = false;
  }


  //Abre el modal en modo edición con los datos de una prenda.
  loteSiguienteNumero: number = 1;
  ultimoLoteReferencia: any = null;

  abrirModalEditar(prenda: Prenda) {
    if (!prenda?.idPrenda) return;

    this.edicion = true;
    this.idEdicion = prenda.idPrenda;
    this.prendaSeleccionada = prenda;
    this.indicePrendaSeleccionada = this.prendas.findIndex(
      p => p.idPrenda === prenda.idPrenda
    );

    this.mostrarModal = true;
    this.mostrarColores = true;
    this.stockRestante = 0;

    // ===== LOTES =====
    this.prendaService.getLotesByPrenda(prenda.idPrenda).subscribe(lotes => {
      this.loteSiguienteNumero = lotes.length + 1;
      this.ultimoLoteReferencia = lotes.length
        ? lotes.reduce((a, b) => a.idLote > b.idLote ? a : b)
        : null;
    });

    this.cargarDatosEnModal(prenda);
    this.actualizarStockRestante();
    this.prendaForm.updateValueAndValidity();
  }

  //Cierra el modal principal de prenda.
  cerrarModal(): void {
    this.mostrarModal = false;
  }


  //Limpia todos los campos del formulario de prenda.

  limpiarFormulario(): void {
    this.prendaForm.reset({
      estado: 'Disponible',
      fechaRegistro: new Date(),
      stock: 0
    });

    // limpiar tallas
    this.tallas.clear();
    this.stockRestante = 0;

    this.colores.clear();
    this.colorTemporalControl.reset();
  }


  //Abre el modal para crear una nueva categoría.

  abrirModalCategoria() {
    if (!this.categoriaForm) {
      this.categoriaForm = this.fb.group({
        nombre: ['', Validators.required]
      });
    } else {
      this.categoriaForm.reset();
    }

    this.categoriaGuardada = false;
    this.errorCategoria = false;
    this.mostrarModalCategoria = true;
  }


  //Cierra el modal de categoría.

  cerrarModalCategoria() {
    this.mostrarModalCategoria = false;
  }


  //Abre el modal para crear una nueva marca.

  abrirModalMarca() {
    if (!this.marcaForm) {
      this.marcaForm = this.fb.group({
        marca: ['', Validators.required],
        categoria: ['', Validators.required]
      });
    } else {
      this.marcaForm.reset();
    }

    this.marcaGuardado = false;
    this.errorMarca = false;
    this.listarCategorias(); // Asegura que las categorías estén cargadas
    this.mostrarModalMarca = true;
  }


  //Cierra el modal de marca.

  cerrarModalMarca() {
    this.mostrarModalMarca = false;
  }


  //Cierra el modal de detalles de prenda.

  cerrarModalDetalles() {
    this.mostrarModalDetalles = false;
    this.prendaDetalles = null;
  }

  // === OPERACIONES CRUD ===


  //Guarda una nueva categoría en la base de datos.
  guardarCategoria() {
    const nombre = this.categoriaForm.value.nombre?.trim();

    if (!nombre) {
      this.errorCategoria = true;
      setTimeout(() => this.errorCategoria = false, 1200);
      return;
    }

    const nombreMinus = nombre.toLowerCase();
    const yaExiste = this.categoriasFiltro.some(
      cat => cat.nombre?.toLowerCase() === nombreMinus
    );

    if (yaExiste) {
      this.errorCategoria = true;
      setTimeout(() => this.errorCategoria = false, 1200);
      return;
    }

    const categoria = new Categoria();
    categoria.nombre = nombre;

    this.categoriaService.insert(categoria).subscribe({
      next: () => {
        this.categoriaGuardada = true;
        this.listarCategorias();
        this.categoriaService.list().subscribe(data => this.categoriasFiltro = data);
        setTimeout(() => this.cerrarModalCategoria(), 1200);
      },
      error: (err) => {
        console.error('Error al crear categoría', err);
        this.errorCategoria = true;
        setTimeout(() => this.errorCategoria = false, 1200);
      }
    });
  }

  //Guarda una nueva marca en la base de datos.
  guardarMarca() {
    if (this.marcaForm.valid) {
      const idCategoria = this.marcaForm.value.categoria;
      const nombreMarca = this.marcaForm.value.marca.trim();

      const nombreMarcaNormalizado = nombreMarca.toLowerCase();
      const yaExiste = this.marcasTodas.some(m =>
        m.categoria?.idCategoria === idCategoria &&
        m.marca?.toLowerCase() === nombreMarcaNormalizado
      );

      if (yaExiste) {
        this.errorMarca = true;
        setTimeout(() => this.errorMarca = false, 1200);
        return;
      }

      const marca: Marca = {
        idMarca: 0,
        marca: nombreMarca,
        categoria: {
          idCategoria: idCategoria,
          nombre: ''
        }
      };

      this.marcaService.insert(marca).subscribe({
        next: () => {
          this.marcaGuardado = true;
          this.errorMarca = false;
          this.listarMarcas();
          this.cargarTodasLasMarcas();
          setTimeout(() => {
            this.cerrarModalMarca();
          }, 800);
        },
        error: (err) => {
          console.error('Error al crear marca', err);
          this.errorMarca = true;
          setTimeout(() => this.errorMarca = false, 1200);
        }
      });
    } else {
      this.marcaForm.markAllAsTouched();
      this.errorMarca = true;
      setTimeout(() => this.errorMarca = false, 1200);
    }

  }

  onSubmit(): void {

    // FORZAR VALIDACIÓN DEL FORM
    this.prendaForm.updateValueAndValidity({ onlySelf: false, emitEvent: false });

    console.log('❗ errores form:', this.prendaForm.errors);

    // 🚫 1. CAMPOS OBLIGATORIOS
    if (this.prendaForm.invalid) {
      this.prendaForm.markAllAsTouched();
      console.log('CAMPOSOBLIGATORIOS:TRUE');
      this.mostrarError = true;
      setTimeout(() => this.mostrarError = false, 1200);
      return;
    }

    // 🚫 2. STOCK > 0 PERO SIN TALLAS
    if (this.prendaForm.errors?.['requiereTallas']) {
      console.log('REQUIERETALLAS:TRUE');
      this.mostrarError = true;
      setTimeout(() => this.mostrarError = false, 1200);
      return;
    }

    // 🚫 3. STOCK 0 CON TALLAS
    if (this.prendaForm.errors?.['stockCeroConTallas']) {
      console.log('STOCKCEROCONTALLAS:TRUE');
      this.mostrarError = true;
      setTimeout(() => this.mostrarError = false, 1200);
      return;
    }

    // 🚫 4. STOCK ≠ SUMA TALLAS
    if (this.prendaForm.errors?.['stockNoCoincide']) {
      console.log('STOCKNOCOINCIDE:TRUE');
      this.mostrarError = true;
      setTimeout(() => this.mostrarError = false, 1200);
      return;
    }

    // 🔠 5. TALLAS EN MAYÚSCULAS
    this.tallas.controls.forEach(ctrl => {
      const sizeCtrl = ctrl.get('size');
      if (sizeCtrl?.value) {
        sizeCtrl.setValue(sizeCtrl.value.toUpperCase(), { emitEvent: false });
      }
    });

    // 🚫 6. TALLAS DUPLICADAS
    this.validarTallasDuplicadas();
    if (this.tallaDuplicada) {
      console.log('TALLASDUPLICADAS:TRUE');
      this.mostrarError = true;
      setTimeout(() => this.mostrarError = false, 1200);
      return;
    }

    // =============================
    // 🧱 ARMADO DE DATOS
    // =============================

    const formValue = this.prendaForm.getRawValue();
    const tallasForm: Talla[] = formValue.tallas || [];
    let tallasFinales: Talla[] = [];

    // ✏️ EDICIÓN
    if (this.edicion && this.prendaActual?.tallas?.length) {

      this.prendaActual.tallas.forEach(t => {
        const tallaForm = tallasForm.find(f => f.size === t.size);
        tallasFinales.push({
          idTalla: t.idTalla,
          size: t.size,
          cantidad: tallaForm?.cantidad ?? 0
        });
      });

      // 🆕 NUEVAS
      tallasForm.forEach(f => {
        if (!this.prendaActual!.tallas.find(t => t.size === f.size)) {
          tallasFinales.push({
            size: f.size,
            cantidad: f.cantidad ?? 0
          });
        }
      });

    } else {
      // 🆕 CREACIÓN
      tallasFinales = tallasForm.map(t => ({
        size: t.size,
        cantidad: t.cantidad ?? 0
      }));
    }

    const prenda: Prenda = {
      idPrenda: this.edicion ? this.idEdicion : undefined,
      calidad: formValue.calidad,
      stock: formValue.stock,
      precioCompra: formValue.precioCompra,
      precioVenta: formValue.precioVenta,
      descripcion: formValue.descripcion || '',
      fechaRegistro: new Date(),
      estado: formValue.stock > 0 ? 'Disponible' : 'Agotado',
      colores: formValue.colores || [],
      marca: formValue.marca,
      tallas: tallasFinales
    };

    // 🚫 7. DUPLICADO (SOLO CREAR)
    if (!this.edicion && this.prendaYaExiste(prenda)) {
      console.log('PRENDADUPLICADA:TRUE');
      this.mostrarError = true;
      setTimeout(() => this.mostrarError = false, 1200);
      return;
    }

    // 🚀 8. BACKEND
    const request$ = this.edicion
      ? this.prendaService.update(this.idEdicion!, prenda)
      : this.prendaService.insert(prenda);

    request$.subscribe({
      next: () => {

        this.registrar = true;
        this.mostrarError = false;

        this.cargarPrendas();
        this.reiniciarFiltros();
        this.cargarGrafico();
        this.actualizarGraficoMarcas();

        setTimeout(() => {
          this.registrar = false;
          this.prendaForm.reset();
          this.edicion = false;
          this.idEdicion = undefined;
          this.cerrarModal();
        }, 800);
      },
      error: err => {
        console.error('❌ Error backend', err);
        this.mostrarError = true;
        setTimeout(() => this.mostrarError = false, 1200);
      }
    });
  }

  limitarDigitos(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 4) {
      input.value = input.value.slice(0, 4);
    }
  }

  limitarTexto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value.length > 30) {
      input.value = input.value.slice(0, 30);
    }
  }

  validarStockVsTallas(form: AbstractControl): ValidationErrors | null {
    const stock = Number(form.get('stock')?.value) || 0;
    const tallas = form.get('tallas') as FormArray;

    if (!tallas || tallas.length === 0) return null;

    const sumaTallas = tallas.controls
      .map(t => Number(t.get('cantidad')?.value) || 0)
      .reduce((a, b) => a + b, 0);

    // 🚫 stock 0 pero hay tallas
    if (stock === 0 && sumaTallas > 0) {
      return { stockCeroConTallas: true };
    }

    // 🚫 stock distinto a suma de tallas
    if (stock !== sumaTallas) {
      return { stockNoCoincide: true };
    }

    return null;
  }

  validarStockConTallas(form: AbstractControl): ValidationErrors | null {
    const stock = Number(form.get('stock')?.value || 0);
    const tallas = form.get('tallas') as FormArray;

    if (stock > 0 && (!tallas || tallas.length === 0)) {
      return { requiereTallas: true };
    }

    return null;
  }



  confirmarEliminacion() {
    if (!this.prendaAEliminar?.idPrenda) return;
    this.prendaService.eliminar(this.prendaAEliminar.idPrenda).subscribe({
      next: () => {
        this.prendas = this.prendas.filter(p => p.idPrenda !== this.prendaAEliminar!.idPrenda);
        this.mostrarModalConfirmacion = false;
        this.prendaAEliminar = null;
        this.indicePrendaAEliminar = null;
        this.prendaService.actualizarLista();
        this.listarPrendas();
        this.cargarPrendas();
        this.cargarGrafico();
        this.reiniciarFiltros();
        this.actualizarGraficoMarcas();
      },
      error: (err) => {
        const mensaje = err.error || 'No se pudo eliminar la prenda.';
        alert(mensaje);
        this.mostrarModalConfirmacion = false;
        this.prendaAEliminar = null;
        this.indicePrendaAEliminar = null;
      }
    });
  }

  //Cancela la eliminación de una prenda.
  cancelarEliminacion() {
    this.mostrarModalConfirmacion = false;
    this.idPrendaAEliminar = null;
  }

  mostrarModalLotes: boolean = false;
  //Copia los datos de una prenda seleccionada para pegarlos después.
  accionMenu(accion: string) {
    if (!this.prendaSeleccionada) return;
    switch (accion) {

      case 'editar':
        this.abrirModalEditar(this.prendaSeleccionada);
        break;

      case 'ver':
        if (!this.prendaSeleccionada?.idPrenda) return;
        const id = this.prendaSeleccionada.idPrenda;

        forkJoin({
          prenda: this.prendaService.getById(id),
          metricas: this.prendametricaService.getMetricas(id).pipe(
            catchError(err => of(null))
          ),
          lotes: this.prendaService.getLotesByPrenda(id) // 👈 AGREGA ESTO
        }).subscribe({
          next: ({ prenda, metricas, lotes }) => {
            this.lotesHistorial = lotes || []; // 👈 guárdalo
            this.cargarDetalles(prenda);
            this.metricaPrenda = metricas;
            this.mostrarModalDetalles = true;
          },
          error: err => {
            console.error('Error cargando detalles:', err);
            alert('No se pudieron cargar los detalles.');
          }
        });
        break;

      case 'lotes':
        if (!this.prendaSeleccionada?.idPrenda) return;
        const idL = this.prendaSeleccionada.idPrenda;

        this.prendaService.getLotesByPrenda(idL).subscribe({
          next: (lotes) => {
            this.lotesHistorial = lotes || [];
            this.mostrarModalLotes = true;
          },
          error: (err) => {
            console.error('Error al cargar lotes:', err);
            alert('No se pudieron cargar los lotes de la prenda.');
          }
        });
        break;

      case 'copiar':
        this.prendaCopiada = {
          ...this.prendaSeleccionada,
          colores: [...(this.prendaSeleccionada.colores ?? [])],
          tallas: this.prendaSeleccionada.tallas?.map(t => ({ ...t })) ?? []
        };

        this.mostrarMensajeCopiado = true;
        setTimeout(() => this.mostrarMensajeCopiado = false, 1000);
        break;

      case 'eliminar':
        const indiceGlobal = this.prendas.findIndex(p => p.idPrenda === this.prendaSeleccionada?.idPrenda);
        this.indicePrendaAEliminar = indiceGlobal !== -1 ? indiceGlobal + 1 : null;
        this.prendaAEliminar = this.prendaSeleccionada;
        this.mostrarModalConfirmacion = true;
        break;
    }
    this.menuVisible = false;
  }

  pegarPrenda(): void {
    if (!this.prendaCopiada) return;

    const idCategoria = this.prendaCopiada.marca?.categoria?.idCategoria;

    // Pegamos categoría y fecha
    this.prendaForm.patchValue({
      categoria: idCategoria,
      fechaRegistro: new Date()
    });

    // ======= PEGAR MARCA =======
    if (idCategoria) {
      this.onCategoriaChange2(idCategoria).subscribe({
        next: (marcas) => {
          this.listaMarcas = marcas;

          const marcaSeleccionada = marcas.find(
            m => m.idMarca === this.prendaCopiada!.marca.idMarca
          );

          this.prendaForm.patchValue({
            marca: marcaSeleccionada || null
          });
        }
      });
    } else {
      this.prendaForm.patchValue({ marca: null });
    }

    // ======= PEGAR CAMPOS NORMALES =======
    this.prendaForm.patchValue({
      calidad: this.prendaCopiada.calidad,
      precioCompra: this.prendaCopiada.precioCompra,
      precioVenta: this.prendaCopiada.precioVenta,
      stock: this.prendaCopiada.stock,
      descripcion: this.prendaCopiada.descripcion,
    });

    // ======= PEGAR COLORES =======
    this.mostrarColores = true;
    this.colores.clear();

    this.prendaCopiada.colores.forEach((c: string) => {
      this.colores.push(new FormControl(c));
    });

    // ======= PEGAR TALLAS =======
    this.tallas.clear();

    this.prendaCopiada.tallas.forEach((t: Talla) => {
      this.tallas.push(
        this.fb.group({
          size: [t.size],
          cantidad: [t.cantidad]
        })
      );
    });

    // Recalcular stock restante
    this.actualizarStockRestante();
  }

  // === FILTROS Y CATEGORÍAS/MARCAS DINÁMICAS ===

  //Carga las marcas asociadas a una categoría seleccionada (para el formulario).
  onCategoriaChange(idCategoria: number): void {
    if (!idCategoria) {
      this.marcasFiltro = []; // ← Limpiar filtro de marcas si no hay categoría
      return;
    }
    this.marcaService.listarPorCategoria(idCategoria).subscribe({
      next: (data) => {
        this.listaMarcas = data;   // para el formulario
        this.marcasFiltro = data; // ← para el filtro (¡esto faltaba!)
        this.prendaForm.get('marca')?.reset();
      },
      error: (err) => console.error('Error cargando marcas por categoría:', err)
    });
    this.aplicarFiltros();
  }

  //Versión observable de onCategoriaChange, usada al pegar prendas.
  onCategoriaChange2(idCategoria: number): Observable<Marca[]> {
    if (!idCategoria) {
      return of([]); // si no hay categoría, devolver array vacío
    }

    return this.marcaService.listarPorCategoria(idCategoria).pipe(
      tap((marcas) => {
        this.listaMarcas = marcas; // llenar select
      }),
      catchError(err => {
        console.error('Error cargando marcas por categoría:', err);
        return of([]);
      })
    );
  }

  cargarPrendas(): void {
    console.log('🚀 cargarPrendas EJECUTADO');

    this.prendaService.list().subscribe({
      next: (data: Prenda[]) => {
        const prendasConStock = data.map(p => ({
          ...p,
          stock: p.tallas?.reduce(
            (acc: number, t) => acc + (t.cantidad || 0),
            0
          ) || 0
        }));

        prendasConStock.sort(
          (a, b) => (b.idPrenda ?? 0) - (a.idPrenda ?? 0)
        );

        this.prendas = prendasConStock;
        this.listaOriginal = [...this.prendas];
        this.listaFiltrada = [...this.prendas];
      },
      error: err => console.error('❌ Error cargando prendas', err)
    });
  }

  stockFiltro: number | null = null;
  precioMin: number | null = null;
  precioMax: number | null = null;

  aplicarFiltros(): void {
    this.listaFiltrada = this.prendas.filter(p => {

      /* -------------- BÚSQUEDA MÚLTIPLE POR COMA (modo AND) -------------- */
      const search = this.busquedaCalidad?.toLowerCase() || "";

      // "Polo,Realeza,Lana" → ["polo", "realeza", "lana"]
      const keywords = search
        .split(",")
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

      // Debe cumplir TODOS los keywords
      const matchMega = keywords.length === 0
        ? true
        : keywords.every(keyword =>
          (p.descripcion?.toLowerCase().includes(keyword)) ||
          (p.calidad?.toLowerCase().includes(keyword)) ||
          (p.marca?.marca?.toLowerCase().includes(keyword)) ||
          (p.marca?.categoria?.nombre?.toLowerCase().includes(keyword))
        );


      /* ------------------ RESTO DE FILTROS ------------------ */

      const matchCategoria = this.idCategoriaFiltro
        ? p.marca?.categoria?.idCategoria === this.idCategoriaFiltro
        : true;

      const matchMarca = this.idMarcaFiltro
        ? p.marca?.idMarca === this.idMarcaFiltro
        : true;

      const matchEstado = this.estadoFiltro
        ? p.estado === this.estadoFiltro
        : true;

      const matchFecha = this.busquedaFecha
        ? (() => {
          const fechaPrenda = new Date(p.fechaRegistro);
          const fechaFiltro = this.busquedaFecha!;
          return fechaPrenda.getUTCFullYear() === fechaFiltro.getFullYear() &&
            fechaPrenda.getUTCMonth() === fechaFiltro.getMonth() &&
            fechaPrenda.getUTCDate() === fechaFiltro.getDate();
        })()
        : true;

      const matchStock = this.stockFiltro !== null
        ? p.stock >= this.stockFiltro
        : true;

      const matchPrecioMin = this.precioMin !== null
        ? p.precioVenta >= this.precioMin
        : true;

      const matchPrecioMax = this.precioMax !== null
        ? p.precioVenta <= this.precioMax
        : true;

      return (
        matchMega &&
        matchCategoria &&
        matchMarca &&
        matchEstado &&
        matchFecha &&
        matchStock &&
        matchPrecioMin &&
        matchPrecioMax
      );
    });

    this.paginaActual = 1;
  }

  mostrarFiltrosAvanzados = false;


  //Reinicia todos los filtros a su estado inicial
  reiniciarFiltros() {
    this.busquedaDescripcion = '';
    this.busquedaCalidad = '';
    this.idCategoriaFiltro = null;
    this.idMarcaFiltro = null;
    this.estadoFiltro = '';
    this.stockFiltro = null;
    this.precioMin = null;
    this.precioMax = null;
    this.busquedaFecha = null;
    this.marcasFiltro = [];
    this.cargarPrendas();
    this.paginaActual = 1;
  }

  resetearFiltrosSinRecargar() {
    this.busquedaDescripcion = '';
    this.busquedaCalidad = '';
    this.idCategoriaFiltro = null;
    this.idMarcaFiltro = null;
    this.estadoFiltro = '';
    this.stockFiltro = null;
    this.precioMin = null;
    this.precioMax = null;
    this.busquedaFecha = null;
    this.marcasFiltro = [];
    this.paginaActual = 1;
  }


  //Maneja el cambio de categoría en el filtro lateral y recarga prendas/marcas.
  onCategoriaFiltroChange(): void {
    this.paginaActual = 1;

    if (this.idCategoriaFiltro === null) {
      // Mostrar todas las prendas
      this.cargarPrendas(); // ← trae todas las prendas
      this.marcasFiltro = []; // limpia las marcas del filtro
      this.idMarcaFiltro = null; // resetea selección de marca
    } else {
      // Cargar marcas de la categoría seleccionada (para el filtro de marcas)
      this.marcaService.listarPorCategoria(this.idCategoriaFiltro).subscribe({
        next: (marcas) => {
          this.marcasFiltro = marcas;
          this.idMarcaFiltro = null; // resetea selección al cambiar categoría
        },
        error: (err) => console.error('Error al cargar marcas del filtro', err)
      });

      // Cargar prendas de esa categoría
      this.prendaService.listarPorCategoria(this.idCategoriaFiltro).subscribe({
        next: (prendas) => {
          this.listaOriginal = prendas;
          this.aplicarFiltros(); // aplica filtros actuales (si ya hay marca, estado, etc.)
        },
        error: (err) => console.error('Error al cargar prendas por categoría', err)
      });
    }
  }

  // === PAGINACIÓN ===
  //Devuelve las prendas correspondientes a la página actual.
  get prendasPaginadas() {
    const inicio = (this.paginaActual - 1) //this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.listaFiltrada.slice(inicio, fin);
  }


  //Calcula el número total de páginas según el número de prendas y elementos por página.
  get totalPaginas() {
    return Math.ceil(this.listaFiltrada.length / this.itemsPorPagina);
  }


  //Cambia a una página específica (con validación de límites).
  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
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
  getPaginas(): (number | string)[] {
    const total = this.totalPaginas;
    const current = this.paginaActual;

    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, '...', total];
    if (current >= total - 2) return [1, '...', total - 2, total - 1, total];
    return [1, '...', current - 1, current, current + 1, '...', total];
  }


  //Navega a una página ingresada manualmente por el usuario.
  irAPagina(pagina: number) {
    if (pagina && pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.paginaInput = pagina;
    } else {
      this.paginaInput = this.paginaActual;
    }
  }


  // === MENÚ CONTEXTUAL ===

  //Maneja clics fuera del menú contextual para cerrarlo.
  onOverlayClick(event: MouseEvent) {}

  //Abre el menú contextual en la posición del clic derecho sobre una prenda.
  abrirMenu(event: MouseEvent, prenda: Prenda) {
    event.preventDefault();
    event.stopPropagation();
    this.prendaSeleccionada = prenda;
    this.menuX = event.clientX;
    this.menuY = event.clientY;
    this.menuVisible = true;
    const close = () => {
      this.menuVisible = false;
      window.removeEventListener('click', close);
    };
    setTimeout(() => window.addEventListener('click', close), 0);
  }

  configurarOpciones() {
    this.pieChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              family: 'Poppins, sans-serif',
              size: 12,
            },
            color: '#2A2523'
          }
        },
        tooltip: {
          bodyFont: {
            family: 'Poppins, sans-serif', // fuente del texto
            size: 14, // tamaño del texto
          },
          backgroundColor: '#2A2523', // fondo del tooltip
          titleFont: {
            family: 'Poppins, sans-serif', // fuente del título si quieres
            size: 14,
          },
          titleColor: '#FFF8F0',
          bodyColor: '#FFF8F0',
          padding: 9,
          cornerRadius: 12,
        }
      }
    };
  }


  // === GRÁFICOS ===
  //Carga los datos y genera el gráfico circular de distribución por categoría.
  cargarGrafico(): void {
    this.prendaService.list().subscribe({
      next: (prendas: Prenda[]) => {
        // Filtramos solo las prendas disponibles
        const prendasDisponibles = prendas.filter(p => p.estado === 'Disponible');

        // Calculamos stock sumando las tallas (o 0 si no hay)
        const prendasConStock = prendasDisponibles.map(prenda => ({
          ...prenda,
          stock: prenda.stock || 0
        }));

        // Contamos cuántas prendas hay por categoría
        const frecuencias: { [key: string]: number } = {};
        prendasConStock.forEach(p => {
          const cat = p.marca?.categoria?.nombre || 'Sin categoría';
          frecuencias[cat] = (frecuencias[cat] || 0) + (p.stock || 0);
        });

        const total = Object.values(frecuencias).reduce((a, b) => a + b, 0);

        const colors = [
          '#E85A7F', // reemplaza el rosa (#FF6384)
          '#5AA3D8', // reemplaza el azul (#36A2EB)
          '#FFD56A', // reemplaza el amarillo (#FFCE56)
          '#4BC0C0', // aqua, lo dejamos similar
          '#A27FFF', // violeta, más suave y combinable
          '#FF9F6A', // naranja suave (#FF9F40)
          '#D12650', // rojo fuerte (#FF5252)
          '#7CAF6A', // verde suave (#4CAF50)
          '#FF6F9A', // rosa vibrante (#FF4081)
          '#7C4DFF'  // violeta profundo (#7C4DFF)
        ];


        // Labels y datos
        this.pieChartLabels = Object.keys(frecuencias);
        const dataValues = Object.values(frecuencias);

        // Configuración del gráfico
        this.pieChartData = {
          labels: this.pieChartLabels,
          datasets: [{
            data: dataValues,
            backgroundColor: colors.slice(0, dataValues.length)
          }],
        };

        // Cálculo de porcentajes por categoría
        this.categoriasPorcentaje = this.pieChartLabels.map((nombre, i) => ({
          nombre,
          total: frecuencias[nombre],
          porcentaje: total > 0 ? Math.round((frecuencias[nombre] / total) * 100) : 0,
          color: colors[i % colors.length]
        }));

        this.pieChartType = 'pie';
      },
      error: (err) => console.error('Error al cargar prendas para gráfico', err)
    });
  }

  //Compara dos objetos Marca por su idMarca (usado en [compareWith] de selects).
  compararMarca(m1: Marca, m2: Marca): boolean {
    return m1 && m2 ? m1.idMarca === m2.idMarca : m1 === m2;
  }

  // === NUEVO GRÁFICO: Marcas por Categoría ===
  categoriaSeleccionadaGrafico: number | null = null;
  graficoMarcasData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  marcasPorcentaje: { nombre: string; total: number; porcentaje: number; color: string }[] = [];

  actualizarGraficoMarcas(): void {
    if (!this.categoriaSeleccionadaGrafico) {
      this.graficoMarcasData = { labels: [], datasets: [{ data: [] }] };
      this.marcasPorcentaje = [];
      return;
    }

    // Filtrar prendas por categoría seleccionada y estado 'Disponible'
    const prendasFiltradas = this.prendas.filter(p =>
      p.marca?.categoria?.idCategoria === this.categoriaSeleccionadaGrafico &&
      p.estado === 'Disponible'
    );

    // Contar frecuencia de marcas (sumando stock)
    const frecuencias: { [key: string]: number } = {};
    prendasFiltradas.forEach(p => {
      const marca = p.marca?.marca || 'Sin marca';
      frecuencias[marca] = (frecuencias[marca] || 0) + (p.stock || 0);
    });

    const total = Object.values(frecuencias).reduce((a, b) => a + b, 0);
    const colores = [
      '#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF',
      '#FF9F40','#FF5252','#4CAF50','#FF4081','#7C4DFF'
    ];

    const labels = Object.keys(frecuencias);
    const data = Object.values(frecuencias);

    // Configuración del gráfico
    this.graficoMarcasData = {
      labels,
      datasets: [{
        data,
        backgroundColor: colores.slice(0, data.length)
      }]
    };

    // Cálculo de porcentajes por marca
    this.marcasPorcentaje = labels.map((nombre, i) => ({
      nombre,
      total: frecuencias[nombre],
      porcentaje: total > 0 ? Math.round((frecuencias[nombre] / total) * 100) : 0,
      color: colores[i % colores.length]
    }));
  }

  formularioCompletoParaBuscar(): boolean {
    const categoria = this.prendaForm.get('categoria')?.value;
    const marca = this.prendaForm.get('marca')?.value;
    const calidad = this.prendaForm.get('calidad')?.value?.trim();
    return !!categoria && !!marca && !!calidad;
  }

  prendaYaExiste(prendaNueva: {
    marca?: any;
    calidad?: string;
    colores?: string[];
    descripcion?: string;
  }): boolean {

    const coloresNuevos = (prendaNueva.colores || []).map(c => c.trim().toLowerCase());

    return this.prendas.some(p => {

      const mismaCategoria =
        p.marca?.categoria?.idCategoria === prendaNueva.marca?.categoria?.idCategoria;

      const mismaMarca =
        p.marca?.idMarca === prendaNueva.marca?.idMarca;

      const mismaCalidad =
        (p.calidad || '').trim().toLowerCase() ===
        (prendaNueva.calidad || '').trim().toLowerCase();

      const mismaDescripcion =
        (p.descripcion || '').trim().toLowerCase() ===
        (prendaNueva.descripcion || '').trim().toLowerCase();

      // 🟨 COMPARACIÓN DE LISTA DE COLORES (TODOS IGUALES)
      const coloresExistentes = (p.colores || []).map(c => c.trim().toLowerCase());

      const mismosColores =
        coloresExistentes.length === coloresNuevos.length &&
        coloresExistentes.every((c, i) => c === coloresNuevos[i]);

      return mismaCategoria &&
        mismaMarca &&
        mismaCalidad &&
        mismaDescripcion &&
        mismosColores;
    });
  }

  colorTemporalControl = new FormControl('');
  get colores(): FormArray {
    return this.prendaForm.get('colores') as FormArray;
  }

  agregarColor() {
    const c: string = this.colorTemporalControl.value?.trim() || '';

    if (c === '') return;

    // Verificar duplicados en FormArray
    const yaExiste = this.colores.controls.some(ctrl => ctrl.value === c);
    if (yaExiste) return;

    // Agregar al FormArray
    this.colores.push(new FormControl(c));

    this.colorTemporalControl.setValue('');
  }

  eliminarColor(i: number) {
    this.colores.removeAt(i);
  }

  separarColores(color: unknown): string[] {
    if (!color) return ['—'];

    // Si viene como FormArray (Angular)
    if (Array.isArray(color)) {
      // Puede venir como array de strings del backend O FormArray.value
      return color
        .map((c: any) => String(c).trim())
        .filter((c: string) => c.length > 0);
    }

    // Si viene como string tipo "Rojo, Azul"
    if (typeof color === 'string') {
      return color
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0);
    }

    return ['—'];
  }



  aplicarFiltrosDesdeModal() {
    this.resetearFiltrosSinRecargar();

    const formValue = this.prendaForm.value || {};
    this.mostrarFiltrosAvanzados = true;

    const nuevaCategoria =
      formValue.categoria != null && formValue.categoria !== ''
        ? Number(formValue.categoria)
        : null;

    const nuevaCalidad = formValue.calidad?.trim() || '';

    const nuevaMarcaId =
      formValue.marca?.idMarca != null && formValue.marca.idMarca !== ''
        ? Number(formValue.marca.idMarca)
        : null;

    this.idCategoriaFiltro = nuevaCategoria;
    this.busquedaCalidad = nuevaCalidad;

    if (this.idCategoriaFiltro) {
      this.marcaService.listarPorCategoria(this.idCategoriaFiltro).subscribe({
        next: (marcas) => {
          this.marcasFiltro = marcas || [];

          // Si la marca existe en la lista filtrada
          const existe = this.marcasFiltro.some(m => m.idMarca === nuevaMarcaId);
          this.idMarcaFiltro = existe ? nuevaMarcaId : null;

          // Aplicar filtros
          this.aplicarFiltros();

          // Cerrar modal y mover scroll
          this.cerrarModal();
          document.querySelector('.lista-prendas')?.scrollTo(0, 0);
        },
        error: (err) => {
          console.error('Error al cargar marcas para filtro', err);

          // Si falló la carga igual asignamos marca y filtramos
          this.idMarcaFiltro = nuevaMarcaId;
          this.aplicarFiltros();
          this.cerrarModal();
        }
      });
    } else {
      this.idMarcaFiltro = nuevaMarcaId;

      this.aplicarFiltros();
      this.cerrarModal();
      document.querySelector('.lista-prendas')?.scrollTo(0, 0);
    }
  }



  verificarDuplicado() {
    if (this.edicion) return;

    const categoria = this.prendaForm.get('categoria')?.value;
    const marca = this.prendaForm.get('marca')?.value;
    const calidad = this.prendaForm.get('calidad')?.value?.trim();
    const color = this.prendaForm.get('color')?.value?.trim();
    const descripcion = this.prendaForm.get('descripcion')?.value?.trim();

    if (!categoria || !marca || !calidad) {
      this.prendaDuplicada = false;
      return;
    }

    const prendaTemporal = {
      marca: typeof marca === 'object'
        ? marca
        : {
          idMarca: marca,
          categoria: { idCategoria: categoria }
        },
      calidad: calidad,
      color: color,
      descripcion: descripcion
    };

    if (this.prendaYaExiste(prendaTemporal)) {
      this.prendaDuplicada = true;
      setTimeout(() => {
        this.prendaDuplicada = false;
      }, 6000);
    } else {
      this.prendaDuplicada = false;
    }
  }

  getImagenCategoria(prendas: any): string {
    const nombreCat = prendas.marca?.categoria?.nombre;

    if (!nombreCat) return '/default.png';

    // Pasar a minúsculas y quitar espacios si es necesario
    const nombreNormalizado = nombreCat.toLowerCase().replace(/\s+/g, '');

    return `/${nombreNormalizado}.png`;
  }

  // Asegúrate de que prendaDetalles sea un objeto observable o reasignable
  get tallasOrdenadas() {
    if (!this.prendaDetalles?.tallas) return [];
    return [...this.prendaDetalles.tallas].sort((a, b) => b.cantidad - a.cantidad);
  }

  datosGananciaCache: any = null;

  ultimoLoteUsado: any = null; // ← nueva propiedad

  cargarDetalles(prenda: Prenda) {
    let stockBase = prenda.stock;
    let compraBase = prenda.precioCompra;

    if (this.lotesHistorial && this.lotesHistorial.length > 0) {
      const ultimoLote = this.lotesHistorial.reduce((prev, curr) =>
        prev.idLote > curr.idLote ? prev : curr
      );
      stockBase = ultimoLote.cantidad;
      compraBase = ultimoLote.precioCompraTotal;
      this.ultimoLoteUsado = ultimoLote;
    }

    const prendaParaCalculo = { ...prenda, stock: stockBase, precioCompra: compraBase };
    this.recalcularGanancias(prendaParaCalculo);
    this.prendaDetalles = prenda;
  }

  recalcularGanancias(p: Prenda) {
    const compraTotal   = p.precioCompra || 0;
    const stock         = p.stock || 1;
    const ventaUnidad   = p.precioVenta || 0;

    const compraUnidad  = compraTotal / stock;
    const gananciaUnidad = ventaUnidad - compraUnidad;

    // Ahora SÍ: totalVenta y totalGanancia se basan en el lote original (no en el stock actual reducido)
    const totalVenta    = ventaUnidad * stock;
    const totalGanancia = gananciaUnidad * stock;

    const margen = compraUnidad > 0
      ? (gananciaUnidad / compraUnidad) * 100
      : 0;

    let icono = 'trending_flat';
    let iconoColor = 'flat';

    if (margen < 25) {
      icono = 'trending_down';
      iconoColor = 'down';
    } else if (margen <= 40) {
      icono = 'trending_flat';
      iconoColor = 'flat';
    } else {
      icono = 'trending_up';
      iconoColor = 'up';
    }

    this.datosGananciaCache = {
      compraUnidad,
      gananciaUnidad,
      totalVenta,
      totalGanancia,
      margen,
      icono,
      iconoColor
    };
  }


  mostrarDrawer: boolean = false;

  abrirModalMetricas(id: number | undefined) {
    if (!id) {
      console.warn("ID inválido para métricas");
      return;
    }

    this.mostrarDrawer = true;

    this.prendametricaService.getMetricas(id).subscribe(data => {
      this.metricaPrenda = data;
    });
  }

  cerrarModalMetricas() {
    this.mostrarDrawer = false;
  }

  cerrarModalLotes(event?: Event) {
    if (event) event.stopPropagation();
    this.mostrarModalLotes = false;
    this.lotesHistorial = [];
  }

  sidebarExpanded = true;

  onToggleSidebar(state: boolean) {
    this.sidebarExpanded = state;
  }

  hoverPrenda: Prenda | null = null;
  activarHoverInfo = false;

  onHoverPrenda(prenda: Prenda) {
    if (!this.activarHoverInfo) return;

    this.hoverPrenda = prenda;
  }

  onLeavePrenda() {
    if (!this.activarHoverInfo) return;

    this.hoverPrenda = null;
  }



  mostrarCategorias = false;
  mostrarMarcas = false;
  mostrarTop10 = false;

  top10: any[] = [];

  cargarTop10() {
    this.prendametricaService.getTop10().subscribe(res => {
      this.top10 = res;
    });
  }

  stockBajoActivo = false;
  listaStockBajo: Prenda[] = [];
  limiteStock: number = 5;

  toggleStockBajo() {
    if (this.stockBajoActivo) {
      this.cargarStockBajo();
    } else {
      this.listaStockBajo = [];
    }
  }


  cargarStockBajo() {
    this.prendaService.getPrendasStockBajo(this.limiteStock)
      .subscribe({
        next: data => this.listaStockBajo = data,
        error: err => console.error('Error cargando stock bajo', err)
      });
  }

  activarPrendasOlvidadas: boolean = false;
  prendasOlvidadas: any[] = [];


  onTogglePrendasOlvidadas() {
    if (this.activarPrendasOlvidadas) {
      // Cargar prendas olvidadas
      this.prendametricaService.getPrendasOlvidadas().subscribe({
        next: data => {
          this.prendasOlvidadas = data;
        },
        error: err => {
          console.error("Error cargando prendas olvidadas", err);
        }
      });
    } else {
      // Ocultar lista
      this.prendasOlvidadas = [];
    }
  }

  getTallasDisponibles() {
    if (!this.hoverPrenda || !this.hoverPrenda.tallas) return [];
    return this.hoverPrenda.tallas
      .filter((t: any) => t.cantidad > 0)
      .sort((a: any, b: any) => b.cantidad - a.cantidad);
  }

// VARIABLES PARA DRAG
  isDragging = false;
  offsetX = 0;
  offsetY = 0;

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.offsetX = event.clientX;
    this.offsetY = event.clientY;
  }

  stopDrag() {
    this.isDragging = false;
  }

  dragging(event: MouseEvent) {
    if (!this.isDragging) return;

    const dx = event.clientX - this.offsetX;
    const dy = event.clientY - this.offsetY;

    const modal = document.getElementById('hoverBox');

    if (modal) {
      const rect = modal.getBoundingClientRect();
      modal.style.left = rect.left + dx + "px";
      modal.style.top = rect.top + dy + "px";
      modal.style.transform = "none"; // para que ya no centre

      this.offsetX = event.clientX;
      this.offsetY = event.clientY;
    }
  }

  columnas = [
    { key: 'numero', label: 'N°', visible: true },
    { key: 'categoria', label: 'Categoría', visible: true },
    { key: 'marca', label: 'Marca', visible: true },
    { key: 'calidad', label: 'Calidad', visible: true },
    { key: 'stock', label: 'Stock', visible: true },
    { key: 'estado', label: 'Estado', visible: true },
    { key: 'precioVenta', label: 'Precio de Venta', visible: true },
    { key: 'acciones', label: 'Acciones', visible: true },
  ];

  toggleColumna(col: any) {
    col.visible = !col.visible;
  }

  mostrar(key: string): boolean {
    return this.columnas.find(c => c.key === key)?.visible ?? true;
  }

  mostrarColores: boolean = false;
}
