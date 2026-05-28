import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {

  const router = inject(Router);

  const userText = localStorage.getItem('user');

  if (!userText) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(userText);

  const userType =
    user.userTypeName ||
    user.userType ||
    user.role ||
    '';

  const allowedRoles = route.data?.['roles'] as string[] | undefined;

  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  if (allowedRoles.includes(userType)) {
    return true;
  }

  alert('You are not authorized to access this page.');
  router.navigate(['/dashboard']);
  return false;
};