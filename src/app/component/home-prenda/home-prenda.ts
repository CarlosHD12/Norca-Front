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
import {Marca} from '../../model/Marca';
import {Categoria} from '../../model/Categoria';
import {Talla} from '../../model/Talla';
import {PrendaService} from '../../services/prenda-service';
import {MarcaService} from '../../services/marca-service';
import {CategoriaService} from '../../services/categoria-service';
import {TallaService} from '../../services/talla-service';
import {Prenda} from '../../model/Prenda';
import {SidebarComponent} from '../sidebar-component/sidebar-component';
import {
  DatePipe,
  DecimalPipe,
  NgClass,
  NgForOf,
  NgIf,
  SlicePipe
} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {PrendaListadoDTO} from '../../model/PrendaListadoDTO';
import {Lote} from '../../model/Lote';
import {LoteService} from '../../services/lote-service';
import {startWith} from 'rxjs';
import {PrendaDetalleDTO} from '../../model/PrendaDetalleDTO';
import {Metrica} from '../../model/Metrica';
import {MetricaService} from '../../services/metrica-service';
import {LoteMetricasDTO} from '../../model/LoteMetricasDTO';
import {LoteDetalleDTO} from '../../model/LoteDetalleDTO';

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
    SidebarComponent,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    MatIcon,
    NgClass,
    NgForOf,
    DatePipe,
    DecimalPipe,
    SlicePipe,
  ],
  templateUrl: './home-prenda.html',
  styleUrl: './home-prenda.css',
})
export class HomePrenda implements OnInit {
  // -------------------- TOAST --------------------
  mostrarToast = false;
  toastMensaje = '';
  toastTipo: 'success' | 'error' = 'success';

  // -------------------- MENÚ CONTEXTUAL --------------------
  prendaSeleccionada: Prenda | null = null;
  prendaSeleccionadaId: number | null = null;
  menuVisible: boolean = false;
  menuX: number = 0;
  menuY: number = 0;
  menuWidth: number = 160;
  menuHeight: number = 200;

  modoEdicion: boolean = false;

  get colores(): FormArray {
    return this.prendaForm.get('colores') as FormArray;
  }

  // -------------------- MODALES --------------------
  modalActivo: Modales | null = null;

  // -------------------- FORMULARIOS --------------------
  prendaForm!: FormGroup;
  categoriaForm!: FormGroup;
  marcaForm!: FormGroup;
  tallaForm!: FormGroup;
  loteForm!: FormGroup;
  colorTemporalControl = new FormControl('');

  // -------------------- DATOS --------------------
  marcas: Marca[] = [];
  categorias: Categoria[] = [];
  tallas: Talla[] = [];

  hoverPrendaId: number | null = null;

  selectedCategoria: Categoria | null = null;
  selectedMarca: Marca | null = null;

  dropdownCategoriaOpen = false;
  dropdownMarcaOpen = false;

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
    this.initPrendaForm();
    this.initCategoriaForm();
    this.initMarcaForm();
    this.initTallaForm();
    this.initLoteForm();
    this.cargarItemsPorPagina();
    this.cargarPrendas();
    this.cargarMarcas();
    this.cargarCategorias();
    this.cargarTallas();
    this.detectarCambios();
    this.loteForm.valueChanges.subscribe(() => {
      this.calcularStockRestante();
    });
    const estadoGuardado = localStorage.getItem('filtrosAvanzados');
    this.filtrosAvanzadosActivos = estadoGuardado === 'true';
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

  // -------------------- FORMULARIOS --------------------
  initPrendaForm() {
    this.prendaForm = this.fb.group({
      material: ['', Validators.required],
      fechaRegistro: [new Date(), Validators.required],
      estado: [{value: 'SIN LOTES', disabled: false}, Validators.required],
      descripcion: [''],
      colores: this.fb.array<FormControl<string>>([], {validators: [], updateOn: 'change'}),
      categoria: [null, Validators.required],
      marca: [null, Validators.required],
      lotes: this.fb.array([])
    });
  }

  initLoteForm() {
    this.loteForm = this.fb.group({
      prenda: this.fb.group({
        idPrenda: [null, Validators.required]
      }),
      cantidad: [null, [Validators.required, Validators.min(1)]],
      precioCompraTotal: [null, [Validators.required, Validators.min(0)]],
      precioVenta: [null, [Validators.required, Validators.min(0)]],
      inventarios: this.fb.array([])
    });
    this.stockRestante = 0;
  }

  initCategoriaForm() {
    this.categoriaForm = this.fb.group({nombre: ['', Validators.required]});
  }

  initMarcaForm() {
    this.marcaForm = this.fb.group({nombre: ['', Validators.required]});
  }

  initTallaForm() {
    this.tallaForm = this.fb.group({nombre: ['', Validators.required]});
  }

  agregarColor() {
    const c = this.colorTemporalControl.value?.trim().toUpperCase() || '';
    if (!c) return this.mostrarToastMensaje('Ingresa un color', 'error');
    if (c.length > 20) return this.mostrarToastMensaje('El color no puede superar 20 caracteres', 'error');
    if (this.colores.controls.some(ctrl => ctrl.value === c)) return this.mostrarToastMensaje('Este color ya existe', 'error');
    this.colores.push(this.fb.control(c, {nonNullable: true}));
    this.colorTemporalControl.setValue('');
  }

  eliminarColor(i: number) {
    this.colores.removeAt(i);
  }

  // -------------------- DROPDOWNS --------------------
  toggleDropdown(type: 'categoria' | 'marca', event: Event) {
    event.stopPropagation();
    if (type === 'categoria') {
      this.dropdownCategoriaOpen = !this.dropdownCategoriaOpen;
      this.dropdownMarcaOpen = false;
    } else {
      this.dropdownMarcaOpen = !this.dropdownMarcaOpen;
      this.dropdownCategoriaOpen = false;
    }
  }

  selectCategoria(categoria: Categoria, event: Event) {
    event.stopPropagation();
    if (this.selectedCategoria?.idCategoria === categoria.idCategoria) {
      this.selectedCategoria = null;
      this.prendaForm.get('categoria')?.setValue(null);
    } else {
      this.selectedCategoria = categoria;
      this.prendaForm.get('categoria')?.setValue(categoria);
    }
    this.dropdownCategoriaOpen = false;
  }

  selectMarca(marca: Marca, event: Event) {
    event.stopPropagation();
    if (this.selectedMarca?.idMarca === marca.idMarca) {
      this.selectedMarca = null;
      this.prendaForm.get('marca')?.setValue(null);
    } else {
      this.selectedMarca = marca;
      this.prendaForm.get('marca')?.setValue(marca);
    }
    this.dropdownMarcaOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.dropdownCategoriaOpen = false;
    this.dropdownMarcaOpen = false;
  }

  // -------------------- CARGA DE DATOS --------------------

  cargarCategorias() {
    this.categoriaService.listarCategorias().subscribe({next: res => this.categorias = res, error: console.error});
  }

  cargarMarcas() {
    this.marcaService.listarMarcas().subscribe({next: res => this.marcas = res, error: console.error});
  }

  cargarTallas() {
    this.tallaService.listarTallas().subscribe({next: res => this.tallas = res, error: console.error});
  }

  // -------------------- MODALES --------------------
  crearPrendaModal() {
    this.modoEdicion = false;
    this.prendaForm.reset();
    this.initPrendaForm();
    this.modalActivo = Modales.PRENDA;
    document.body.classList.add('modal-open');
  }

  abrirModal(tipo: Modales) {
    this.modalActivo = tipo;
    document.body.classList.add('modal-open');
  }

  cerrarModal() {
    switch (this.modalActivo) {
      case Modales.PRENDA:
        this.prendaForm.reset({
          material: '',
          fechaRegistro: new Date(),
          estado: 'SIN LOTES',
          descripcion: '',
          categoria: null,
          marca: null
        });
        (this.prendaForm.get('colores') as FormArray).clear();
        (this.prendaForm.get('lotes') as FormArray).clear();
        this.selectedCategoria = null;
        this.selectedMarca = null;
        this.dropdownCategoriaOpen = false;
        this.dropdownMarcaOpen = false;
        this.prendaSeleccionada = null;
        this.prendaSeleccionadaId = null;
        this.modoEdicion = false;
        this.colorTemporalControl.setValue('');
        break;

      case Modales.CATEGORIA:
        this.categoriaForm.reset({nombre: ''});
        break;

      case Modales.MARCA:
        this.marcaForm.reset({nombre: ''});
        break;

      case Modales.TALLA:
        this.tallaForm.reset({nombre: ''});
        break;

      case Modales.LOTE:
        this.initLoteForm();
        this.stockRestante = 0;
        this.metricasSimuladas = {};
        if (this.metricasSub) {
          this.metricasSub.unsubscribe();
          this.metricasSub = null;
        }
        break;

      case Modales.DETALLE:
        this.prendaDetalle = null;
        this.cerrarMetrica();
        break;


    }

    this.modalActivo = null;
    document.body.classList.remove('modal-open');
  }

  // -------------------- REGISTRO & EDICIÓN --------------------
  crearCategoria(nombre: string) {
    nombre = (nombre || '').trim();
    if (!nombre) {
      return this.mostrarToastMensaje('El nombre de la categoría no puede estar vacío', 'error');
    }
    if (nombre.length > 30) {
      return this.mostrarToastMensaje('El nombre de la categoría es demasiado largo', 'error');
    }
    const existe = this.categorias.some(
      c => (c.nombre ?? '').trim().toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      return this.mostrarToastMensaje(`La categoría "${nombre}" ya existe`, 'error');
    }
    const nuevaCategoria: Categoria = { idCategoria: 0, nombre };
    this.categoriaService.crearCategoria(nuevaCategoria).subscribe({
      next: res => {
        this.mostrarToastMensaje(`Categoría "${res.nombre}" creada`, 'success');
        this.cargarCategorias();
        this.limpiarFiltros();
        this.cerrarModal();
      },
      error: err => {
        console.error('Error creando categoría', err);
        this.mostrarToastMensaje('Error creando categoría', 'error');
      }
    });
  }

  crearMarca(nombre: string) {
    nombre = (nombre || '').trim();
    if (!nombre) {
      return this.mostrarToastMensaje('El nombre de la marca no puede estar vacío', 'error');
    }
    if (nombre.length > 30) {
      return this.mostrarToastMensaje('El nombre de la marca es demasiado largo', 'error');
    }
    const existe = this.marcas.some(
      m => (m.nombre ?? '').trim().toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      return this.mostrarToastMensaje(`La marca "${nombre}" ya existe`, 'error');
    }
    const nuevaMarca: Marca = { idMarca: 0, nombre };
    this.marcaService.crearMarca(nuevaMarca).subscribe({
      next: res => {
        this.mostrarToastMensaje(`Marca "${res.nombre}" creada`, 'success');
        this.cargarMarcas();
        this.limpiarFiltros();
        this.cerrarModal();
      },
      error: err => {
        console.error('Error creando marca', err);
        this.mostrarToastMensaje('Error creando marca', 'error');
      }
    });
  }

  crearTalla(nombre: string) {
    nombre = (nombre || '').trim();
    if (!nombre) {
      return this.mostrarToastMensaje('El nombre de la talla no puede estar vacío', 'error');
    }
    if (nombre.length > 10) {
      return this.mostrarToastMensaje('El nombre de la talla es demasiado largo', 'error');
    }
    const existe = this.tallas.some(
      t => (t.nombre ?? '').trim().toLowerCase() === nombre.toLowerCase()
    );
    if (existe) {
      return this.mostrarToastMensaje(`La talla "${nombre}" ya existe`, 'error');
    }
    const nuevaTalla: Talla = { idTalla: 0, nombre };
    this.tallaService.crearTalla(nuevaTalla).subscribe({
      next: res => {
        this.mostrarToastMensaje(`Talla "${res.nombre}" creada`, 'success');
        this.cargarTallas();
        this.limpiarFiltros();
        this.cerrarModal();
      },
      error: err => {
        console.error('Error creando talla', err);
        this.mostrarToastMensaje('Error creando talla', 'error');
      }
    });
  }

  guardarPrenda() {
    if (this.modoEdicion) {
      this.editarPrenda();
    } else {
      this.registrarPrenda();
    }
  }

  registrarPrenda() {
    const formValue = this.prendaForm.value;

    if (!this.selectedCategoria || !this.selectedMarca) {
      return this.mostrarToastMensaje('Selecciona una categoría y marca válidas', 'error');
    }
    if (!formValue.material?.trim()) {
      return this.mostrarToastMensaje('El material es obligatorio', 'error');
    }
    if (this.prendaForm.invalid) {
      return this.mostrarToastMensaje('Completa los campos obligatorios', 'error');
    }

    const material = formValue.material.trim();
    const descripcion = (formValue.descripcion || '').trim();
    const categoriaId = this.selectedCategoria.idCategoria;
    const marcaId = this.selectedMarca.idMarca;

    const prendaData: Prenda = {
      material,
      descripcion,
      colores: formValue.colores || [],
      fechaRegistro: new Date(),
      estado: 'SIN LOTES',
      categoria: { idCategoria: categoriaId, nombre: this.selectedCategoria.nombre },
      marca: { idMarca: marcaId, nombre: this.selectedMarca.nombre }
    };

    this.prendaService.obtenerPrendas().subscribe(prendasExistentes => {
      const duplicada = prendasExistentes.some(p =>
        p.material.trim().toLowerCase() === material.toLowerCase() &&
        p.categoria.idCategoria === categoriaId &&
        p.marca.idMarca === marcaId &&
        (p.descripcion || '').trim().toLowerCase() === descripcion.toLowerCase()
      );

      if (duplicada) {
        return this.mostrarToastMensaje(
          'Ya existe una prenda con la misma categoría, marca, material y descripción',
          'error'
        );
      }

      this.prendaService.registrarPrenda(prendaData).subscribe({
        next: () => {
          this.mostrarToastMensaje('Prenda registrada correctamente', 'success');
          this.cargarPrendas();
          this.limpiarFiltros();
          this.cerrarModal();
        },
        error: err => {
          console.error('Error registrando prenda', err);
          this.mostrarToastMensaje('Error al registrar la prenda', 'error');
        }
      });
    });
  }

  abrirEditarPrenda() {
    if (!this.prendaSeleccionada?.idPrenda) return;

    this.modoEdicion = true;

    this.prendaService.obtenerDetalle(this.prendaSeleccionada.idPrenda).subscribe({
      next: data => {
        this.prendaForm.patchValue({
          material: data.material,
          fechaRegistro: data.fechaRegistro,
          estado: data.estado,
          descripcion: data.descripcion
        });

        this.selectedCategoria = this.categorias.find(c => c.nombre === data.nombreCategoria) || null;
        this.selectedMarca = this.marcas.find(m => m.nombre === data.nombreMarca) || null;

        const colores = this.prendaForm.get('colores') as FormArray;
        colores.clear();
        data.colores?.forEach((c: string) => colores.push(this.fb.control(c)));

        this.modalActivo = Modales.PRENDA;
        document.body.classList.add('modal-open');
      },
      error: err => console.error('Error al abrir edición', err)
    });
  }

  editarPrenda() {
    if (!this.prendaSeleccionada?.idPrenda) return; // aseguras que exista

    const idPrenda = this.prendaSeleccionada.idPrenda; // TS ya sabe que no es undefined
    const formValue = this.prendaForm.value;
    const material = formValue.material?.trim()!;
    const descripcion = (formValue.descripcion || '').trim();
    const categoriaId = this.selectedCategoria!.idCategoria;
    const marcaId = this.selectedMarca!.idMarca;

    if (!material || !categoriaId || !marcaId) {
      return this.mostrarToastMensaje('Completa todos los campos obligatorios', 'error');
    }

    const huboCambios =
      material !== this.prendaSeleccionada.material ||
      descripcion !== this.prendaSeleccionada.descripcion ||
      categoriaId !== this.prendaSeleccionada.categoria.idCategoria ||
      marcaId !== this.prendaSeleccionada.marca.idMarca ||
      JSON.stringify(formValue.colores) !== JSON.stringify(this.prendaSeleccionada.colores);

    if (!huboCambios) {
      return this.mostrarToastMensaje('No se detectaron cambios para guardar');
    }

    const prendaData: Prenda = {
      idPrenda,
      material,
      descripcion,
      colores: formValue.colores || [],
      fechaRegistro: formValue.fechaRegistro,
      estado: formValue.estado,
      categoria: { idCategoria: categoriaId, nombre: this.selectedCategoria!.nombre },
      marca: { idMarca: marcaId, nombre: this.selectedMarca!.nombre }
    };

    this.prendaService.obtenerPrendas().subscribe(prendasExistentes => {
      const duplicada = prendasExistentes.some(p =>
        p.idPrenda !== idPrenda &&
        p.material.trim().toLowerCase() === material.toLowerCase() &&
        p.categoria.idCategoria === categoriaId &&
        p.marca.idMarca === marcaId &&
        (p.descripcion || '').trim().toLowerCase() === descripcion.toLowerCase()
      );

      if (duplicada) {
        return this.mostrarToastMensaje(
          'Ya existe otra prenda con la misma categoría, marca, material y descripción',
          'error'
        );
      }

      this.prendaService.editarPrenda(idPrenda, prendaData).subscribe({
        next: () => {
          this.mostrarToastMensaje('Prenda editada correctamente', 'success');
          this.cargarPrendas();
          this.limpiarFiltros();
          this.cerrarModal();
          this.modoEdicion = false;
        },
        error: err => console.error('Error editando prenda', err)
      });
    });
  }

  get inventarios(): FormArray {
    return this.loteForm.get('inventarios') as FormArray;
  }

  agregarInventario() {

    const cantidad = this.loteForm.get('cantidad')?.value || 0;
    this.calcularStockRestante();
    if (cantidad > 0 && this.stockRestante <= 0) {
      this.mostrarToastMensaje('Ya no puedes agregar más inventarios', 'error');
      return;
    }
    const inventario = this.fb.group({
      talla: this.fb.group({
        idTalla: [null, Validators.required]
      }),
      stock: [null, [Validators.required, Validators.min(1)]]
    });
    inventario.get('stock')?.valueChanges.subscribe(() => {
      this.calcularStockRestante();
    });
    this.inventarios.push(inventario);
    this.calcularStockRestante();
  }

  eliminarInventario(index: number) {
    this.inventarios.removeAt(index);
    this.calcularStockRestante();
  }

  registrarLote() {
    this.loteForm.markAllAsTouched();
    if (this.loteForm.invalid) {
      this.mostrarToastMensaje('Completa todos los campos del lote', 'error');
      return;
    }
    if (this.inventarios.length === 0) {
      this.mostrarToastMensaje('Debes agregar al menos un inventario', 'error');
      return;
    }
    const cantidad = this.loteForm.get('cantidad')?.value || 0;

    const totalInventarios = this.inventarios.controls
      .map(inv => inv.get('stock')?.value || 0)
      .reduce((a, b) => a + b, 0);

    if (totalInventarios !== cantidad) {
      this.mostrarToastMensaje('Debes distribuir todo el stock del lote', 'error');
      return;
    }

    const lote: Lote = {
      ...this.loteForm.value,
      inventarios: this.inventarios.value
    };

    this.loteService.registrarLote(lote).subscribe({

      next: () => {

        this.mostrarToastMensaje('Lote registrado correctamente', 'success');

        this.cerrarModal();
        this.limpiarFiltros();
        this.cargarPrendas();

      },
      error: () => {

        this.mostrarToastMensaje('Error al registrar el lote', 'error');

      }
    });
  }

  stockRestante = 0;

  calcularStockRestante() {
    const cantidad = this.loteForm.get('cantidad')?.value || 0;
    const totalInventarios = this.inventarios.controls
      .map(inv => inv.get('stock')?.value || 0)
      .reduce((a, b) => a + b, 0);
    if (totalInventarios > cantidad) {
      this.mostrarToastMensaje('El stock asignado supera la cantidad del lote', 'error');
    }
    this.stockRestante = cantidad - totalInventarios;
  }

  abrirRegistrarLote() {
    if (!this.prendaSeleccionada) return;
    this.initLoteForm();
    this.loteForm.patchValue({
      prenda: {
        idPrenda: this.prendaSeleccionada.idPrenda
      }
    });
    this.loteForm.get('cantidad')?.valueChanges.subscribe(() => {

      this.inventarios.clear();
      this.calcularStockRestante();

    });
    this.detectarCambios();
    this.modalActivo = Modales.LOTE;
  }

  prendaDetalle: PrendaDetalleDTO | null = null;
  metricaDetalle: Metrica | null = null;
  metricaLoteDetalle: LoteMetricasDTO | null = null;
  metricaDisponible: boolean = false;

  abrirDetallePrenda() {
    if (!this.prendaSeleccionada?.idPrenda) return;
    const idPrenda = this.prendaSeleccionada.idPrenda;

    this.prendaService.obtenerDetalle(idPrenda).subscribe({
      next: (data) => {
        this.prendaDetalle = data;
        this.modalActivo = Modales.DETALLE;

        this.metricaVisible = false;
        this.metricaDetalle = null;
        this.metricaLoteDetalle = null;
        this.metricaDisponible = false;

        this.metricaService.existeMetricaPorPrenda(idPrenda).subscribe({
          next: (existe: boolean) => {
            this.metricaDisponible = existe;
            console.log('¿Existe métrica de la prenda?', existe);

            if (existe) {
              this.metricaService.obtenerMetricaPorPrenda(idPrenda).subscribe({
                next: (metricas: Metrica) => {
                  this.metricaDetalle = metricas;
                  console.log('Métricas de la prenda', metricas);
                },
                error: (err) => console.error('Error al obtener métricas de la prenda', err)
              });
            }
          },
          error: () => {
            this.metricaDisponible = false;
            console.log('Error al verificar métricas de la prenda');
          }
        });

        const idLote = data.loteActivo?.idLote;
        if (idLote) {
          this.loteService.getMetricas(idLote).subscribe({
            next: (metricas: LoteMetricasDTO) => {
              this.metricaLoteDetalle = metricas;
              console.log('Métricas del lote', metricas);
            },
            error: (err) => {
              this.metricaLoteDetalle = null;
              console.error('Error al obtener métricas del lote', err);
            }
          });
        }
      },
      error: (err) => console.error('Error al obtener detalle de prenda', err)
    });
  }

  metricaVisible: boolean = false;

  abrirMetrica() {
    if (!this.prendaDetalle?.idPrenda) return;
    if (this.metricaVisible) {
      this.cerrarMetrica();
      return;
    }
    console.log('Abriendo métrica con id:', this.prendaDetalle.idPrenda);
    this.metricaService.obtenerMetricaPorPrenda(this.prendaDetalle.idPrenda)
      .subscribe({
        next: (data) => {
          this.metricaDetalle = data;
          this.metricaVisible = true;
          console.log('Métrica cargada:', data);
        },
        error: (err) => {
          console.error('Error al obtener métrica', err);
          alert(`Error al obtener métrica: ${err.message || err.status}`);
        }
      });
  }

  cerrarMetrica() {
    this.metricaVisible = false;
    this.metricaDetalle = null;
  }

  historialPrenda: LoteDetalleDTO[] | null = null;

  abrirHistorialLotes() {
    if (!this.prendaSeleccionada?.idPrenda) return;
    const idPrenda = this.prendaSeleccionada.idPrenda;
    this.historialPrenda = null;
    this.loteService.historialLotes(idPrenda).subscribe({
      next: (historial: LoteDetalleDTO[]) => {
        this.historialPrenda = historial;
        this.modalActivo = Modales.HISTORIAL;
        console.log('Historial de lotes', historial);
      },
      error: (err) => {
        this.historialPrenda = null;
        console.error('Error al obtener historial de lotes', err);
      }
    });
  }

  cambiarEstadoPrenda() {
    if (!this.prendaSeleccionada?.idPrenda) return;
    const idPrenda = this.prendaSeleccionada.idPrenda;
    const estaInactiva = this.prendaSeleccionada.estado === 'INACTIVO';
    const request = estaInactiva
      ? this.prendaService.activarEstado(idPrenda)
      : this.prendaService.cambiarEstado(idPrenda);
    request.subscribe({
      next: (mensaje: string) => {
        console.log('Estado cambiado:', mensaje);
        this.cargarPrendas();
        this.menuVisible = false;
        this.mostrarToastMensaje(mensaje, 'success');
      },
      error: (err) => {
        console.error('Error al cambiar estado', err);
        this.mostrarToastMensaje('No se pudo cambiar el estado', 'error');
      }
    });
  }

  copiarPrenda() {
    if (!this.prendaSeleccionada?.idPrenda) return;
    const idPrenda = this.prendaSeleccionada.idPrenda;
    this.prendaService.obtenerDetalle(idPrenda).subscribe({
      next: (data) => {
        const prendaCopiada = {
          material: data.material,
          descripcion: data.descripcion,
          categoria: data.nombreCategoria,
          marca: data.nombreMarca,
          colores: data.colores ?? []
        };
        navigator.clipboard.writeText(JSON.stringify(prendaCopiada))
          .then(() => {
            this.mostrarToastMensaje('Prenda copiada al portapapeles 📋', 'success');
            this.clipboardDisponible = true;
          })
          .catch(() => {
            this.mostrarToastMensaje('No se pudo copiar la prenda', 'error');
            this.clipboardDisponible = false;
          });
      },
      error: () => {
        this.mostrarToastMensaje('Error al obtener la prenda', 'error');
        this.clipboardDisponible = false;
      }
    });
  }

  pegarPrenda() {
    navigator.clipboard.readText()
      .then(async texto => {
        const data = JSON.parse(texto);
        this.prendaForm.patchValue({
          material: data.material,
          descripcion: data.descripcion
        });
        const categoria = this.categorias.find(c => c.nombre === data.categoria) || null;
        this.selectedCategoria = categoria;
        this.prendaForm.patchValue({ categoria: categoria?.idCategoria ?? null });
        const marca = this.marcas.find(m => m.nombre === data.marca) || null;
        this.selectedMarca = marca;
        this.prendaForm.patchValue({ marca: marca?.idMarca ?? null });
        const colores = this.prendaForm.get('colores') as FormArray;
        colores.clear();
        data.colores?.forEach((c: string) => colores.push(this.fb.control(c)));
        this.mostrarToastMensaje('Prenda pegada correctamente ✨', 'success');
        try {
          await navigator.clipboard.writeText('');
          this.clipboardDisponible = false;} catch {console.warn('No se pudo limpiar el portapapeles');}
      })
      .catch(() => {
        this.mostrarToastMensaje('No hay una prenda válida en el portapapeles', 'error');
        this.clipboardDisponible = false;
      });
  }

  limpiarPrenda() {
    this.prendaForm.reset({
      material: '',
      fechaRegistro: new Date(),
      estado: 'SIN LOTES',
      descripcion: ''
    });
    this.selectedCategoria = null;
    this.selectedMarca = null;
    const colores = this.prendaForm.get('colores') as FormArray;
    colores.clear();
    this.colorTemporalControl.setValue('');
    this.mostrarToastMensaje('Formulario limpiado 🧹', 'success');
  }

  // -------------------- MENÚ CONTEXTUAL --------------------
  private closeMenu = () => {
    this.menuVisible = false;
    window.removeEventListener('click', this.closeMenu);
    window.removeEventListener('scroll', this.closeMenu, true);
    window.removeEventListener('wheel', this.closeMenu, true);
  };

  abrirMenu(event: MouseEvent, prenda: PrendaListadoDTO) {
    event.preventDefault();
    event.stopPropagation();
    if (this.menuVisible) {
      this.closeMenu();
      return;
    }
    this.prendaSeleccionadaId = prenda.idPrenda;
    this.prendaSeleccionada = {
      idPrenda: prenda.idPrenda,
      material: prenda.material,
      descripcion: prenda.descripcion,
      estado: prenda.estado,
      fechaRegistro: new Date(),
      colores: [],
      categoria: {idCategoria: prenda.categoriaId, nombre: prenda.categoriaNombre},
      marca: {idMarca: prenda.marcaId, nombre: prenda.marcaNombre}};
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    this.menuY = (rect.bottom + this.menuHeight > viewportHeight) ? Math.max(8, rect.top - this.menuHeight) : rect.bottom + 5;
    this.menuX = Math.min(viewportWidth - this.menuWidth - 8, Math.max(8, centerX - this.menuWidth / 2 + 15));
    this.menuVisible = true;
    setTimeout(() => {
      window.addEventListener('click', this.closeMenu);
      window.addEventListener('scroll', this.closeMenu, true);
      window.addEventListener('wheel', this.closeMenu, true);});
  }

  accionMenu(accion: string) {
    if (!this.prendaSeleccionada) return;

    switch (accion) {
      case 'editar':
        this.abrirEditarPrenda();
        break;
      case 'lote':
        this.abrirRegistrarLote();
        break;
      case 'detalle':
        this.abrirDetallePrenda();
        break;
      case 'historial':
        this.abrirHistorialLotes();
        break;
      case 'copiar':
        this.copiarPrenda();
        break;
      case 'desactivar':
        this.cambiarEstadoPrenda();
        break;
      case 'eliminar':
        this.abrirModalEliminar();
        break;
      default:
        console.warn('Acción no reconocida', accion);
    }

    this.menuVisible = false;
  }

  // -------------------- UTILS --------------------
  onToggleSidebar(state: boolean) {
    this.sidebarExpanded = state;
  }

  metricasSimuladas: any = {};
  metricasSub: any;

  detectarCambios() {
    this.metricasSub = this.loteForm.valueChanges
      .pipe(startWith(this.loteForm.value))
      .subscribe(values => {

        const compraTotal = Number(values.precioCompraTotal);
        const cantidad = Number(values.cantidad);
        const precioVenta = Number(values.precioVenta);

        if (!compraTotal || !cantidad || !precioVenta) {
          this.metricasSimuladas = {
            icono: 'hide_source',
            iconoColor: 'off'
          };
          return;
        }

      const compraUnidad = compraTotal / cantidad;
      const ventaTotal = precioVenta * cantidad;
      const gananciaUnidad = precioVenta - compraUnidad;
      const gananciaTotal = gananciaUnidad * cantidad;
      const margenGanancia = (gananciaUnidad / precioVenta) * 100;
      const radioInversion = ventaTotal / compraTotal;

      let puntoEquilibrio = 0;

      if (gananciaUnidad > 0) {
        puntoEquilibrio = Math.ceil(compraTotal / gananciaUnidad);
      }

      let icono: string;
      let iconoColor: string;

      if (margenGanancia < 25 || radioInversion < 1.5) {
        icono = 'trending_down';
        iconoColor = 'off';
      }
      else if (margenGanancia <= 50 || radioInversion <= 3) {
        icono = 'trending_flat';
        iconoColor = 'off';
      }
      else {
        icono = 'trending_up';
        iconoColor = 'off';
      }

      const round = (v: number) => Number(v.toFixed(2));

      this.metricasSimuladas = {
        compraUnidad: round(compraUnidad),
        ventaTotal: round(ventaTotal),
        gananciaUnidad: round(gananciaUnidad),
        gananciaTotal: round(gananciaTotal),
        margenGanancia: round(margenGanancia),
        radioInversion: round(radioInversion),
        puntoEquilibrio, // entero
        icono,
        iconoColor
      };

    });
  }

  selectorActivo = false;
  inventarioIndexSeleccionado: number | null = null;

  abrirSelector(index: number) {
    this.inventarioIndexSeleccionado = index;
    this.selectorActivo = true;
  }

  cerrarSelector(){
    this.selectorActivo = false;
  }

  seleccionarTalla(talla: any) {
    if (this.inventarioIndexSeleccionado === null) return;
    const indexActual = this.inventarioIndexSeleccionado;
    const inventario = this.inventarios.at(indexActual);
    const tallaActual = inventario.get('talla.idTalla')?.value;
    if (tallaActual === talla.idTalla) {
      inventario.get('talla.idTalla')?.setValue(null);
      this.selectorActivo = false;
      return;
    }
    const repetida = this.inventarios.controls.some((inv, i) => {
      if (i === indexActual) return false;
      const idTalla = inv.get('talla.idTalla')?.value;
      return idTalla === talla.idTalla;
    });
    if (repetida) {
      this.mostrarToastMensaje(`La talla "${talla.nombre}" ya fue agregada a otro inventario`, 'error');
      return;
    }
    inventario.get('talla.idTalla')?.setValue(talla.idTalla);
    this.selectorActivo = false;
  }

  obtenerNombreTalla(index: number){
    const id = this.inventarios.at(index).get('talla.idTalla')?.value;
    const talla = this.tallas.find(t => t.idTalla === id);
    return talla ? talla.nombre : '';
  }

  hoverLote: number | null = null;
  mostrarInventarioSiempre = false;

  // Lista completa y lista paginada
  prendasLista: PrendaListadoDTO[] = [];
  prendasListaPaginada: PrendaListadoDTO[] = [];

  // Paginación
  paginaActual: number = 1;
  itemsPorPagina: number = 20;
  totalPaginas: number = 1;
  paginaInput: number = 1;

  // Modo fijo / selección
  selectedPrendaId: number | null = null;
  modoFijo: boolean = false;

  cargarPrendas(): void {
    this.cargarItemsPorPagina();
    this.prendaService.listarPrendasTabla().subscribe({
      next: (data) => {
        this.prendasLista = data;
        this.prendasFiltradas = [...data];
        this.calcularTotalPaginas();
        this.actualizarPaginacion();
      },
      error: () => this.mostrarToastMensaje('Error al cargar prendas', 'error')
    });
  }

  calcularTotalPaginas(): void {
    this.totalPaginas = Math.ceil(this.prendasFiltradas.length / this.itemsPorPagina) || 1;
    if (this.paginaActual > this.totalPaginas)
      this.paginaActual = this.totalPaginas;
  }

  actualizarPaginacion(): void {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.prendasListaPaginada = this.prendasFiltradas.slice(inicio, fin);
    this.paginaInput = this.paginaActual;
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }

  cambiarItemsPorPagina(): void {
    this.calcularTotalPaginas();
    this.actualizarPaginacion();
  }

  irAPagina(pagina: number): void {
    this.cambiarPagina(pagina);
  }

  getPaginas(): (number | string)[] {
    const paginas: (number | string)[] = [];
    const total = this.totalPaginas;
    const actual = this.paginaActual;
    if (total <= 5) {
      for (let i = 1; i <= total; i++) paginas.push(i);
    } else {
      if (actual <= 3) {
        paginas.push(1, 2, 3, 4, '...', total);
      } else if (actual >= total - 2) {
        paginas.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        paginas.push(1, '...', actual - 1, actual, actual + 1, '...', total);
      }
    }
    return paginas;
  }

  seleccionarPrenda(dto: PrendaListadoDTO) {
    this.prendaSeleccionada = {
      idPrenda: dto.idPrenda,
      material: dto.material,
      descripcion: dto.descripcion,
      estado: dto.estado,
      categoria: {idCategoria: dto.categoriaId, nombre: dto.categoriaNombre},
      marca: {idMarca: dto.marcaId, nombre: dto.marcaNombre},
      colores: dto.colores?.map(c => c.toUpperCase()) || []
    };
    this.selectedPrendaId = dto.idPrenda;
  }

  onHoverPrenda(prenda: PrendaListadoDTO): void {
    this.hoverPrendaId = prenda.idPrenda;
  }

  onLeavePrenda(): void {
    this.hoverPrendaId = null;
  }

  getEstadoClass(estado?: string) {
    const e = estado?.toLowerCase();
    if (e === 'disponible') return 'status-disponible';
    if (e === 'agotado') return 'status-agotado';
    if (e === 'sin lotes') return 'status-sinlotes';
    return 'status-otro';
  }

  stepperInterval: any = null;

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

  startAumentar() {
    this.stopStepper();
    this.incrementItems();
    this.stepperInterval = setInterval(() => {
      this.incrementItems(false);
    }, 150);
  }

  startDisminuir() {
    this.stopStepper();
    this.decrementItems();
    this.stepperInterval = setInterval(() => {
      this.decrementItems(false);
    }, 150);
  }

  incrementItems(guardar: boolean = true) {
    if (this.itemsPorPagina < 50) {
      this.itemsPorPagina++;
      this.cambiarItemsPorPagina();
      if (guardar) this.guardarItemsPorPagina();
    }
  }

  decrementItems(guardar: boolean = true) {
    if (this.itemsPorPagina > 1) {
      this.itemsPorPagina--;
      this.cambiarItemsPorPagina();
      if (guardar) this.guardarItemsPorPagina();
    }
  }

  stopStepper() {
    if (this.stepperInterval) {
      clearInterval(this.stepperInterval);
      this.stepperInterval = null;
      this.guardarItemsPorPagina();
    }
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
    if (busqueda) {
      const filtros = busqueda
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      lista = lista.filter(prenda => {
        const texto = `
      ${prenda.categoriaNombre}
      ${prenda.marcaNombre}
      ${prenda.material}
      ${prenda.descripcion}
    `.toLowerCase();
        return filtros.every(f => texto.includes(f));});
    }

    if (categoria !== null)
      lista = lista.filter(p => p.categoriaId === categoria);

    if (marca !== null)
      lista = lista.filter(p => p.marcaId === marca);

    if (estado !== null)
      lista = lista.filter(p => p.estado === estado);

    if (stockMin !== null && stockMax !== null) {
      lista = lista.filter(p =>
        p.stockActual >= stockMin &&
        p.stockActual <= stockMax);
    } else if (stockMin !== null) {
      lista = lista.filter(p => p.stockActual >= stockMin);
    } else if (stockMax !== null) {
      lista = lista.filter(p => p.stockActual <= stockMax);
    }

    if (precioMin !== null && precioMax !== null) {
      lista = lista.filter(p =>
        p.precioVenta >= precioMin &&
        p.precioVenta <= precioMax);
    } else if (precioMin !== null) {
      lista = lista.filter(p => p.precioVenta >= precioMin);
    } else if (precioMax !== null) {
      lista = lista.filter(p => p.precioVenta <= precioMax);
    }

    if (tieneColores !== null) {
      lista = lista.filter(p =>
        tieneColores
          ? p.colores && p.colores.length > 0
          : !p.colores || p.colores.length === 0);
    }
    this.prendasFiltradas = lista;
    this.paginaActual = 1;
    this.calcularTotalPaginas();
    this.actualizarPaginacion();
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

  get prendaTieneDatos(): boolean {
    const form = this.prendaForm;
    if (!form) return false;
    const valores = form.value;
    const colores = (form.get('colores') as FormArray)?.length || 0;

    return !!(
      valores.material?.trim() ||
      valores.descripcion?.trim() ||
      this.selectedCategoria ||
      this.selectedMarca ||
      colores > 0
    );
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

  confirmacionEliminar: string = '';

  eliminarPrenda() {
    if (!this.prendaSeleccionada?.idPrenda) return;
    const id = this.prendaSeleccionada.idPrenda;
    this.prendaService.eliminarPrenda(id).subscribe({
      next: () => {
        console.log('Prenda eliminada');
        this.cerrarModal();
        this.cargarPrendas();
        this.prendaSeleccionada = null;
        this.mostrarToastMensaje('Prenda eliminada correctamente', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar prenda', err);
        this.mostrarToastMensaje('No se pudo eliminar la prenda', 'error');
      }
    });
  }

  abrirModalEliminar() {
    if (!this.prendaSeleccionada) return;
    this.menuVisible = false;
    this.abrirModal(Modales.ELIMINAR);
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

  subirImagen() {
    if (!this.archivoSeleccionado || !this.categoriaSeleccionadaId) return;

    this.categoriaService
      .subirImagen(this.categoriaSeleccionadaId, this.archivoSeleccionado)
      .subscribe({
        next: () => {
          console.log("Imagen subida como campeón 🏆");
        },
        error: (err) => {
          console.error("F en el chat 💀", err);
        }
      });
  }
}
