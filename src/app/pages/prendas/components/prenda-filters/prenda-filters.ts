import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {MarcaResponseDTO} from '../../../../model/MarcaResponseDTO';
import {CategoriaResponseDTO} from '../../../../model/CategoriaResponseDTO';
import {CategoriaService} from '../../../../services/categoria-service';
import {MarcaService} from '../../../../services/marca-service';
import {PrendaFiltros} from '../../../../model/PrendaFiltros';

@Component({
  selector: 'app-prenda-filters',
  imports: [
    FormsModule,
    NgForOf,
    NgIf
  ],
  templateUrl: './prenda-filters.html',
  styleUrl: './prenda-filters.css',
})
export class PrendaFilters   implements OnInit {
  showMarcaDropdown = false;
  showEstadoDropdown = false;
  showCategoriaDropdown = false;

  toggleCategoriaDropdown(event: Event): void {

    event.stopPropagation();

    this.showCategoriaDropdown =
      !this.showCategoriaDropdown;

    this.showEstadoDropdown = false;
    this.showMarcaDropdown = false;

  }

  toggleMarcaDropdown(event: Event): void {

    event.stopPropagation();

    this.showMarcaDropdown =
      !this.showMarcaDropdown;

    this.showCategoriaDropdown = false;
    this.showEstadoDropdown = false;

  }

  toggleEstadoDropdown(event: Event): void {

    event.stopPropagation();

    this.showEstadoDropdown =
      !this.showEstadoDropdown;

    this.showCategoriaDropdown = false;
    this.showMarcaDropdown = false;

  }

  selectMarca(marca: string): void {

    this.filters.marca =
      this.filters.marca === marca
        ? ''
        : marca;

    this.showMarcaDropdown = false;

    this.onFiltersChange();

  }

  selectEstado(estado: string): void {

    this.filters.estado =
      this.filters.estado === estado
        ? ''
        : estado;

    this.showEstadoDropdown = false;

    this.onFiltersChange();

  }

  @HostListener('document:click')
  closeDropdowns(): void {

    this.showCategoriaDropdown = false;

    this.showMarcaDropdown = false;

    this.showEstadoDropdown = false;

  }

  selectCategoria(categoria: string): void {

    if (this.filters.categoria === categoria) {

      this.filters.categoria = '';

    } else {

      this.filters.categoria = categoria;

    }

    this.showCategoriaDropdown = false;

    this.onFiltersChange();

  }

  @Output()
  filtersChange =
    new EventEmitter<PrendaFiltros>();

  categorias: CategoriaResponseDTO[] = [];

  marcas: MarcaResponseDTO[] = [];

  showAdvanced = false;

  filters: PrendaFiltros = {
    search: '',
    categoria: '',
    marca: '',
    estado: '',
    stockMin: null,
    stockMax: null,
    precioMin: null,
    precioMax: null
  };

  constructor(
    private categoriaService: CategoriaService,
    private marcaService: MarcaService
  ) {}

  ngOnInit(): void {
    console.log('FILTERS INIT');

    this.loadCategorias();
    this.loadMarcas();
  }

  loadCategorias(): void {

    this.categoriaService
      .listarCategorias()
      .subscribe({

        next: (data) => {

          this.categorias = data;

        },

        error: (error) => {

          console.error(error);

        }

      });

  }

  loadMarcas(): void {

    this.marcaService
      .listarMarcas()
      .subscribe({

        next: (data) => {

          this.marcas = data;

        },

        error: (error) => {

          console.error(error);

        }

      });

  }

  onFiltersChange(): void {
    this.filtersChange.emit({
      ...this.filters
    });
  }

  toggleAdvancedFilters(): void {
    this.showAdvanced =
      !this.showAdvanced;
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      categoria: '',
      marca: '',
      estado: '',
      stockMin: null,
      stockMax: null,
      precioMin: null,
      precioMax: null
    };
    this.filtersChange.emit({
      ...this.filters
    });
  }
}
