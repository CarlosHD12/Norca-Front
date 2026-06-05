import {Component, EventEmitter, HostListener, Input, OnInit, Output} from '@angular/core';
import {PrendaListResponseDTO} from '../../../../model/PrendaListResponseDTO';
import {NgForOf, NgIf} from '@angular/common';
import {PrendaService} from '../../../../services/prenda-service';
import {PrendaFiltros} from '../../../../model/PrendaFiltros';

@Component({
  selector: 'app-prenda-table',
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './prenda-table.html',
  styleUrl: './prenda-table.css',
})
export class PrendaTable  implements OnInit {
  @Output()
  refresh = new EventEmitter<void>();

  onRefresh(): void {
    this.refresh.emit();
  }

  @Output()
  quickDetail = new EventEmitter<number>();

  @Input()
  prendas: PrendaListResponseDTO[] = [];

  @Output()
  selectPrenda = new EventEmitter<PrendaListResponseDTO>();
  openedMenuId: number | null = null;
  loading = false;
  page = 0;
  totalPages = 0;
  filters: PrendaFiltros = {
    search: '',
    categoria: '',
    marca: '',
    estado: '',
    stockMin: null,
    stockMax: null,
    precioMin: null,
    precioMax: null,
    page: 0,
    size: 10
  };

  ngOnInit(): void {
  }

  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openedMenuId =
      this.openedMenuId === id
        ? null
        : id;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.openedMenuId = null;
  }


  hoverMode = false;

  selectedPrendaId: number | null = null;

  toggleHoverMode(): void {

    this.hoverMode = !this.hoverMode;

  }


  selectedPrendaCodigo = '';

  onRowClick(prenda: PrendaListResponseDTO): void {
    if (this.hoverMode) {
      return;
    }
    this.selectedPrendaId = prenda.idPrenda;
    this.selectedPrendaCodigo = prenda.codigo;
    this.quickDetail.emit(prenda.idPrenda);
  }

  onRowHover(prenda: PrendaListResponseDTO): void {

    if (!this.hoverMode) {
      return;
    }

    this.selectedPrendaId = prenda.idPrenda;

    this.selectedPrendaCodigo = prenda.codigo;

    this.quickDetail.emit(prenda.idPrenda);
  }
}
