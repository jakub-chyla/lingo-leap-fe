import {Component, HostListener, inject, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardFooter, MatCardModule} from "@angular/material/card";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {MatDividerModule} from "@angular/material/divider";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatIconModule} from "@angular/material/icon";
import {CommonModule} from "@angular/common";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {UserService} from "../../service/user.service";
import {AuthRequest} from "../../model/auth-request";
import {Router} from "@angular/router";
import {User} from "../../model/user";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatSnackBar} from "@angular/material/snack-bar";
import {SnackBarComponent} from "../../snack-bar/snack-bar.component";

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    MatCard,
    MatButton,
    MatCardContent,
    MatCardFooter,
    ReactiveFormsModule,
    MatFormField,
    MatInput,

    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatProgressSpinner
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);
  durationInSeconds = 5;
  myForm!: FormGroup;
  user?: User;
  loading = false;

  @HostListener('document:keydown.enter', ['$event'])
  onEnterPress(event: KeyboardEvent) {
    this.logIn();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapePress(event: KeyboardEvent) {
    this.navigateToMain();
  }

  constructor(private readonly formBuilder: FormBuilder,
              private readonly router: Router,
              private readonly userService: UserService
  ) {
  }

  ngOnInit() {
    this.myForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3),]],
      password: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(9)]],
    });

    this.userService.user$.subscribe((user) => {
      if (user) {
        this.user = user;
      }
    });
  }

  protected logIn(): void {
    if (this.myForm.valid) {
      this.loading = true;
      const authRequest: AuthRequest = {
        username: this.myForm.get('username')?.value,
        password: this.myForm.get('password')?.value
      }
      this.userService.logIn(authRequest).subscribe(
        () => {
          this.navigateToMain();
          this.loading = false;
        },
        (error) => {
          this.openSnackBar()
          this.loading = false;
        }
      );
    }
  }

  private openSnackBar() {
    this._snackBar.openFromComponent(SnackBarComponent, {
      duration: this.durationInSeconds * 1000,
    });
  }

  protected navigateToMain(): void {
    this.router.navigate(['/main']);
  }

  protected navigateToSingIn(): void {
    this.router.navigate(['/sign-in']);
  }

  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = (control as FormControl).value;
      const valid = /^\d+$/.test(value);
      return valid ? null : {numeric: true};
    };
  }
}
