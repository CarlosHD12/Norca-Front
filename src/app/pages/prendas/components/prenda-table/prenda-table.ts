import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from '@angular/core';
import {PrendaListResponseDTO} from '../../../../model/PrendaListResponseDTO';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {PrendaFiltros} from '../../../../model/PrendaFiltros';

@Component({
  selector: 'app-prenda-table',
  imports: [
    NgForOf,
    NgIf,
    DecimalPipe
  ],
  templateUrl: './prenda-table.html',
  styleUrl: './prenda-table.css',
})
export class PrendaTable  implements OnInit {

  @Output() refresh = new EventEmitter<void>();

  onRefresh(): void {
    this.refresh.emit();
  }

  @Input() loadingTabla = false;

  @Output() quickDetail = new EventEmitter<number>();

  @Input() prendas: PrendaListResponseDTO[] = [];

  @Output() selectPrenda = new EventEmitter<PrendaListResponseDTO>();

  openedMenuId: number | null = null;
  menuTop = 0;
  menuLeft = 0;
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

  ngOnInit(): void {}

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openedMenuId === id) {
      this.openedMenuId = null;
      return;
    }
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    this.menuTop = rect.bottom - 25;
    this.menuLeft = rect.right - 175;

    this.openedMenuId = id;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.openedMenuId = null;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.openedMenuId = null;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
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
      return;}
    this.selectedPrendaId = prenda.idPrenda;
    this.selectedPrendaCodigo = prenda.codigo;
    this.quickDetail.emit(prenda.idPrenda);
  }

  onRowHover(prenda: PrendaListResponseDTO): void {
    if (!this.hoverMode) {
      return;}
    this.selectedPrendaId = prenda.idPrenda;
    this.selectedPrendaCodigo = prenda.codigo;
    this.quickDetail.emit(prenda.idPrenda);
  }

  get maxStock(): number {
    return Math.max(
      ...this.prendas.map(p => p.stock),
      1
    );
  }

  @Output() editarPrenda = new EventEmitter<PrendaListResponseDTO>();

  editarPorId(idPrenda: number, event: Event): void {
    event.stopPropagation();
    const prenda = this.prendas.find(
      p => p.idPrenda === idPrenda
    );
    if (!prenda) {
      return;
    }
    this.openedMenuId = null;
    this.editarPrenda.emit(prenda);
  }

  @Output() nuevoLote = new EventEmitter<number>();

  @Output() detalle = new EventEmitter<number>();

  @Output() historial = new EventEmitter<number>();

  @Output() desactivar = new EventEmitter<number>();

  abrirDetalle(idPrenda: number): void {
    this.openedMenuId = null;
    this.detalle.emit(idPrenda);
  }

  abrirNuevoLote(idPrenda: number): void {
    this.openedMenuId = null;
    this.nuevoLote.emit(idPrenda);
  }

  abrirHistorial(idPrenda: number): void {
    this.openedMenuId = null;
    this.historial.emit(idPrenda);
  }

  abrirDesactivar(idPrenda: number): void {
    this.openedMenuId = null;
    this.desactivar.emit(idPrenda);
  }
}
