import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-paginator',
  imports: [
    NgIf,
    NgForOf,
    DecimalPipe,
    FormsModule
  ],
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
})
export class Paginator {
  @Input() page = 0;
  @Input() totalPages = 0;
  @Input() totalElements = 0;
  @Input() size = 10;
  @Output() pageChange = new EventEmitter<number>();
  @Output() sizeChange = new EventEmitter<number>();

  goFirst(): void {
    if (this.page > 0) {
      this.pageChange.emit(0);
    }
  }

  goLast(): void {
    if (this.totalPages > 0 && this.page < this.totalPages - 1) {
      this.pageChange.emit(this.totalPages - 1);
    }
  }

  previous(): void {
    if (this.page > 0) {
      this.pageChange.emit(this.page - 1);
    }
  }

  next(): void {
    if (this.page < this.totalPages - 1) {
      this.pageChange.emit(this.page + 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.size = size;
    this.sizeChange.emit(size);
  }

  jumpToPage(value: string): void {
    const page = Number(value);
    if (!isNaN(page) && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page - 1);
    }
  }

  get visiblePages(): number[] {
    if (this.totalPages <= 4) {
      return Array.from({ length: this.totalPages }, (_, i) => i);
    }

    let start = Math.max(0, this.page - 1);
    let end = start + 4;

    if (end > this.totalPages) {
      end = this.totalPages;
      start = end - 4;
    }

    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  protected readonly Math = Math;
}
