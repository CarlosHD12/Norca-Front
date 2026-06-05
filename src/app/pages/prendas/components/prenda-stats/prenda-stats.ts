import {Component, OnInit} from '@angular/core';
import {PrendaKpiResponse} from '../../../../model/PrendaKpiResponse';
import {PrendaService} from '../../../../services/prenda-service';
import {DecimalPipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-prenda-stats',
  imports: [
    DecimalPipe,
    MatIcon
  ],
  templateUrl: './prenda-stats.html',
  styleUrl: './prenda-stats.css',
})
export class PrendaStats implements OnInit {

  kpis!: PrendaKpiResponse;

  constructor(
    private prendaService: PrendaService
  ) {}

  ngOnInit(): void {
    this.obtenerKpis();
  }

  obtenerKpis(): void {
    this.prendaService.obtenerKpis()
      .subscribe({
        next: (data) => {
          this.kpis = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}
