import {Component, OnInit} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {Router} from "@angular/router";
import {User} from "../../model/user";
import {UserService} from "../../service/user.service";
import {NgIf} from "@angular/common";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    MatToolbar,
    MatIconButton,
    MatIcon,
    MatTooltip,
    NgIf,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent implements OnInit {
  user?: User | null;
  isAdmin = false;
  darkMode = false;

  constructor(private readonly router: Router,
              private readonly userService: UserService,
  ) {
  }

  ngOnInit() {
    this.switchMode();
    this.userService.refreshToken().subscribe();

    this.userService.user$.subscribe((user) => {
      if (user) {
        this.user = user;
        this.isAdmin = user?.isAdmin();
      }
      if (this.user === null) {
        this.user = new User();
        this.user.username = localStorage.getItem('username') ?? undefined;
        this.user.token = localStorage.getItem('token') ?? undefined;
      }
    });
  }

  protected logOut() {
    this.userService.logOut();
  }

  protected switchMode(): void {
    const body = document.body;
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      body.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
    }
  }

  protected navigateToLogin(): void {
    this.router.navigate(['/log-in']);
  }

  protected navigateToMain(): void {
    this.router.navigate(['/main']);
  }

  protected navigateToPricing(): void {
    this.router.navigate(['/pricing']);
  }

  protected navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  protected navigateToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
