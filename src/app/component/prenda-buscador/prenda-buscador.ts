import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {Prenda} from '../../model/prenda';
import {Categoria} from '../../model/categoria';
import {PrendaService} from '../../services/prenda-service';
import {CategoriaService} from '../../services/categoria-service';
import {CommonModule} from '@angular/common';
import {MatNativeDateModule} from '@angular/material/core';
import {MatOption, MatSelect, MatSelectModule} from '@angular/material/select';
import {MarcaService} from '../../services/marca-service';
import {Marca} from '../../model/marca';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-prenda-buscador',
  imports: [
    FormsModule,
    MatSelectModule,
    FormsModule,
    MatNativeDateModule,
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatOption,
    MatSelect,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './prenda-buscador.html',
  styleUrl: './prenda-buscador.css'
})
export class PrendaBuscador {
  prendas: Prenda[] = [];
  listaFiltrada: Prenda[] = [];
  prendasSeleccionadas: Prenda[] = [];
  categoriasFiltro: Categoria[] = [];
  marcasFiltro: Marca[] = [];
  idMarcaFiltro: number | null = null;
  busquedaDescripcionPr: string = '';
  idCategoriaFiltro: number | null = null;
  estadoFiltro: string | null = null;
  busquedaCalidadPr: string = '';

  constructor(
    private prendaService: PrendaService,
    private marcaService: MarcaService,
    private categoriaService: CategoriaService,
  ) {}

  private procesarPrendasSeleccionadas() {
    this.prendasSeleccionadas = [...this.prendasIniciales];
    this.listaFiltrada = this.prendas.filter(p =>
      !this.prendasSeleccionadas.some(seleccionada =>
        seleccionada.idPrenda === p.idPrenda
      )
    );
  }

  cargarPrendas(): void {
    this.prendaService.list().subscribe({
      next: data => {
        this.prendas = data;
        // 👇 Solo procesar seleccionadas si hay prendas iniciales
        if (this.prendasIniciales && this.prendasIniciales.length > 0) {
          this.procesarPrendasSeleccionadas();
        } else {
          // Modo registrar: mostrar todas las prendas
          this.listaFiltrada = [...this.prendas];
        }
      },
      error: err => console.error('Error cargando prendas', err)
    });
  }


  cargarCategorias(): void {
    this.categoriaService.list().subscribe({
      next: (cats) => {
        console.log("Categorias cargadas:", cats);
        this.categoriasFiltro = cats;
      },
      error: (err) => console.error('Error cargando categorías', err)
    });
  }

  aplicarFiltros(): void {
    this.listaFiltrada = this.prendas.filter(p => {
      if (this.prendasSeleccionadas.some(seleccionada =>
        seleccionada.idPrenda === p.idPrenda
      )) {
        return false;
      }

      // Resto de tus filtros
      const matchDescripcionPr = this.busquedaDescripcionPr
        ? p.descripcion?.toLowerCase().includes(this.busquedaDescripcionPr.toLowerCase())
        : true;

      const matchCalidadPr = this.busquedaCalidadPr
        ? p.calidad?.toLowerCase().includes(this.busquedaCalidadPr.toLowerCase())
        : true;

      const matchCategoria = this.idCategoriaFiltro
        ? p.marca?.categoria?.idCategoria === this.idCategoriaFiltro
        : true;

      const matchMarca = this.idMarcaFiltro
        ? p.marca?.idMarca === this.idMarcaFiltro
        : true;

      const matchEstado = this.estadoFiltro
        ? p.estado === this.estadoFiltro
        : true;

      return matchDescripcionPr && matchCalidadPr && matchCategoria && matchMarca && matchEstado;
    });
  }

  agregarPrenda(prenda: Prenda) {
    if (!this.prendasSeleccionadas.includes(prenda)) {
      this.prendasSeleccionadas.push(prenda);

      const index = this.listaFiltrada.indexOf(prenda);
      if (index > -1) {
        this.listaFiltrada.splice(index, 1);
      }
    }
  }

  eliminarPrenda(prenda: Prenda) {
    this.prendasSeleccionadas = this.prendasSeleccionadas.filter(p => p !== prenda);

    this.listaFiltrada.push(prenda);

    this.listaFiltrada.sort((a, b) => a.idPrenda! - b.idPrenda!);
  }

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<Prenda[]>();


  cerrarModal(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cerrar.emit();
    }
  }

  confirmarSeleccion() {
    this.confirmar.emit([...this.prendasSeleccionadas]); // Emite una copia
    this.cerrar.emit(); // Cierra el modal
  }

  cancelarSeleccion(): void {
    this.cerrar.emit(); // Cierra directamente
  }

  onCategoriaFiltroChange(): void {
    this.idMarcaFiltro = null;
    this.marcasFiltro = [];

    if (this.idCategoriaFiltro !== null) {
      this.marcaService.listarPorCategoria(this.idCategoriaFiltro).subscribe({
        next: (marcas) => this.marcasFiltro = marcas,
        error: (err) => console.error('Error al cargar marcas', err)
      });
    }

    this.aplicarFiltros();
  }

  reiniciarFiltros() {
    // Resetear valores de filtros
    this.busquedaDescripcionPr = '';
    this.busquedaCalidadPr = '';
    this.idCategoriaFiltro = null;
    this.idMarcaFiltro = null;
    this.estadoFiltro = null;
    this.marcasFiltro = [];

    this.aplicarFiltros();
  }

  truncarDescripcion(texto: string | undefined, limite: number = 40): string {
    if (!texto) return '—'; // maneja null, undefined o string vacío
    return texto.length > limite ? texto.substring(0, limite) + '...' : texto;
  }

  @Input() prendasIniciales: Prenda[] = [];

  ngAfterViewInit() {
    if (this.prendasIniciales.length > 0) {
      // Esperar a que this.prendas esté cargado
      const intervalo = setInterval(() => {
        if (this.prendas.length > 0) {
          clearInterval(intervalo);

          // Marcar prendas iniciales como seleccionadas
          this.prendasSeleccionadas = [...this.prendasIniciales];

          // Quitar las seleccionadas de la lista filtrada
          this.listaFiltrada = this.prendas.filter(p =>
            !this.prendasSeleccionadas.some(seleccionada =>
              seleccionada.idPrenda === p.idPrenda
            )
          );
        }
      }, 100);
    }
  }

  ngOnInit(): void {
    this.cargarPrendas(); // carga this.prendas
    this.cargarCategorias();
  }

  getImagenCategoria(prenda: any): string {
    const nombreCat = prenda.marca?.categoria?.nombre;

    if (!nombreCat) return '/defaults.png';

    // Pasar a minúsculas y quitar espacios si es necesario
    const nombreNormalizado = nombreCat.toLowerCase().replace(/\s+/g, '');

    return `/${nombreNormalizado}.png`;
  }


}
