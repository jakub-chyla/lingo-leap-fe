import {Routes} from '@angular/router';
import {LogInComponent} from "./page/log-in/log-in.component";
import {MainComponent} from "./page/main/main.component";
import {SignInComponent} from "./page/sign-in/sign-in.component";
import {AdminComponent} from "./page/admin/admin.component";
import {AboutComponent} from "./page/about/about.component";
import {PricingComponent} from "./page/pricing/pricing.component";
import {Role} from "./enum/role";
import {AuthGuard} from "./AuthGuard";

export const routes: Routes = [
  {path: '', redirectTo: 'main', pathMatch: 'full'},
  {path: 'main', component: MainComponent, title: 'Home page'},
  {path: 'log-in', component: LogInComponent, title: 'Log in'},
  {path: 'sign-in', component: SignInComponent, title: 'Sign in'},
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Admin',
    canActivate: [AuthGuard],
    data: {requiredRole: Role.ADMIN},
  },
  {path: 'about', component: AboutComponent, title: 'About'},
  {path: 'pricing', component: PricingComponent, title: 'Pricing'},
  {path: '**', redirectTo: 'main'}
];
