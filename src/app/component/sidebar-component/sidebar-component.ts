import { Component, Input, EventEmitter, Output } from '@angular/core';
import {NgForOf, NgOptimizedImage} from '@angular/common';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';
import {FormsModule} from '@angular/forms';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-component',
  imports: [NgForOf, FormsModule],
  templateUrl: './sidebar-component.html',
  styleUrls: ['./sidebar-component.css']
})
export class SidebarComponent {
  @Output() toggleSidebar = new EventEmitter<boolean>();

  isExpanded = true;

  menuItems: MenuItem[] = [
    { icon: 'fi fi-br-house-chimney', label: 'Dashboard', route: '/home' },
    { icon: 'fi fi-br-clothes-hanger', label: 'Prendas', route: '/prendaHome' },
    { icon: 'fi fi-br-rectangle-list', label: 'Pedido', route: '/pedidoHome' },
    { icon: 'fi fi-br-tags', label: 'Ventas', route: '/ventaHome' }
  ];

  activeItem: MenuItem | null = null;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const currentRoute = event.urlAfterRedirects;
        this.activeItem =
          this.menuItems.find(item => currentRoute.includes(item.route)) || null;
      });
  }


  selectItem(item: MenuItem) {
    this.activeItem = item;
    this.router.navigate([item.route]);
  }

  isActive(item: MenuItem): boolean {
    return this.activeItem === item;
  }

  // ---------- Sidebar Hover Control ----------
  expand() {
    if (!this.isExpanded) {
      this.isExpanded = true;
      this.toggleSidebar.emit(true);
    }
  }

  collapse() {
    if (this.isExpanded) {
      this.isExpanded = false;
      this.toggleSidebar.emit(false);
    }
  }


  logout() {
    // Limpias el token o datos de sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Rediriges al login
    this.router.navigate(['/']);
  }
}
