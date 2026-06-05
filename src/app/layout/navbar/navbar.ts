import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    NgIf
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  showThemes = false;

  currentSection = 'General';
  currentPage = 'Dashboard';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateBreadcrumb();

    this.router.events.subscribe(() => {
      this.updateBreadcrumb();
    });
  }

  updateBreadcrumb(): void {

    const url = this.router.url;

    switch (url) {

      case '/home':
        this.currentSection = 'General';
        this.currentPage = 'Dashboard';
        break;

      case '/HomePrenda':
        this.currentSection = 'Gestión';
        this.currentPage = 'Prendas';
        break;

      case '/inventario':
        this.currentSection = 'Gestión';
        this.currentPage = 'Catálogo';
        break;

      case '/PrendaHome':
        this.currentSection = 'Gestión';
        this.currentPage = 'Lotes FIFO';
        break;

      case '/HomeVenta':
        this.currentSection = 'Operaciones';
        this.currentPage = 'Ventas';
        break;

      case '/reportes':
        this.currentSection = 'Operaciones';
        this.currentPage = 'Reportes';
        break;

      default:
        this.currentSection = 'General';
        this.currentPage = 'Dashboard';
    }

  }

  toggleThemes(): void {
    this.showThemes = !this.showThemes;
  }

  changeTheme(theme: string): void {

    document.body.className = theme;

    localStorage.setItem(
      'theme',
      theme
    );

    this.showThemes = false;

  }
}
