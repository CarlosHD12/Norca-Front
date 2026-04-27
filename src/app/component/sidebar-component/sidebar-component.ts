import { Component, EventEmitter, Output } from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth-service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar-component',
  imports: [FormsModule],
  templateUrl: './sidebar-component.html',
  styleUrls: ['./sidebar-component.css']
})
export class SidebarComponent {

  @Output() toggleSidebar = new EventEmitter<boolean>();

  isExpanded = true;
  activeRoute = '';

  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.urlAfterRedirects;
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  expand() {
    this.isExpanded = true;
    this.toggleSidebar.emit(this.isExpanded);
  }

  collapse() {
    this.isExpanded = false;
    this.toggleSidebar.emit(this.isExpanded);
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

}
