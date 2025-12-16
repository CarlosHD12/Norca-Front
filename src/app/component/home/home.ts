import { Component } from '@angular/core';
import {SidebarComponent} from '../sidebar-component/sidebar-component';

@Component({
  selector: 'app-home',
  imports: [
    SidebarComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
