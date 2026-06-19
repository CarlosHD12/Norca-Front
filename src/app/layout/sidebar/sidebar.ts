import {Component, EventEmitter, Output} from '@angular/core';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgIf
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  isExpanded = false;

  usuario: string = '';
  rol: string = '';

  @Output() sidebarToggle = new EventEmitter<boolean>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.usuario = localStorage.getItem('usuario') || 'Usuario';
    this.rol = localStorage
      .getItem('rol')
      ?.replace('ROLE_', '')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase()) || 'Usuario';
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.sidebarToggle.emit(this.isExpanded);
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    const pageSize = localStorage.getItem('prendas-page-size');

    localStorage.clear();

    if (pageSize) {
      localStorage.setItem('prendas-page-size', pageSize);
    }

    this.router.navigate(['/']);
  }

}
