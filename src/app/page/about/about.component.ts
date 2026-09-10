import {Component, HostListener, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardFooter} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {Router} from "@angular/router";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatIcon,
    MatIconButton,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: KeyboardEvent) {
    this.navigateToMain();
  }

  constructor(private router: Router) {
  }

  ngOnInit() {

  }

  navigateToMain(): void {
    this.router.navigate(['/main']);
  }
}
