import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../service/user.service";
import {AuthRequest} from "../../model/auth-request";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent, MatCardFooter} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {Router} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatCard,
    MatCardContent,
    MatCardFooter,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatIcon,
    MatIconButton,
    MatProgressSpinner,
    NgIf
  ],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
  myForm!: FormGroup;
  loading = false;

  constructor(private readonly formBuilder: FormBuilder,
              private readonly userService: UserService,
              private readonly router: Router
  ) {
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(9)]],
      password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(9)]],
      email: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]]
    });
  }

  protected signIn() {
    if (this.myForm.valid) {
      this.loading = true;
      const authRequest: AuthRequest = {
        username: this.myForm.get('username')?.value,
        password: this.myForm.get('password')?.value,
        email: this.myForm.get('email')?.value
      }

      this.userService.createUser(authRequest).subscribe(() => {
          this.navigateToLogin();
          this.loading = false;
        },
      );
    }
  }

  protected navigateToLogin(): void {
    this.router.navigate(['/log-in']);
  }

  protected navigateToLMain(): void {
    this.router.navigate(['/main']);
  }

}
