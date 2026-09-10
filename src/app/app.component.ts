import {Component} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {TopBarComponent} from "./page/top-bar/top-bar.component";
import {RouterOutlet} from "@angular/router";
import {FooterComponent} from "./page/footer/footer.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    FormsModule,
    TopBarComponent,
    RouterOutlet,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

}
