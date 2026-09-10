import {CanActivateFn, Router} from '@angular/router';
import {inject} from "@angular/core";
import {map, take} from "rxjs";
import {UserService} from "./service/user.service";

export const AuthGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);
  const requiredRole = route.data?.['requiredRole'];

  return userService.user$.pipe(
    take(1),
    map(user => {
      if (user && user.role === requiredRole) {
        return true;
      }
      router.navigate(['/unauthorized']);
      return false;
    })
  );
};
