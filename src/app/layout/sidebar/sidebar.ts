import {Component, EventEmitter, Output} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isExpanded = false;

  constructor(private router: Router) {}

  usuario: string = '';
  rol: string = '';

  ngOnInit(): void {
    this.usuario = localStorage.getItem('usuario') || 'Usuario';
    this.rol = localStorage
      .getItem('rol')
      ?.replace('ROLE_', '')
      .toLowerCase()
      .replace(/^\w/, c => c.toUpperCase()) || 'Usuario';
  }

  goTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  @Output() sidebarToggle = new EventEmitter<boolean>();


  expand(): void {
    this.isExpanded = true;
    this.sidebarToggle.emit(true);
  }

  collapse(): void {
    this.isExpanded = false;
    this.sidebarToggle.emit(false);
  }
}
