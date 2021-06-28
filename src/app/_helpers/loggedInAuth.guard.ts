import { Injectable } from '@angular/core';
import { Router, CanActivate} from '@angular/router';

import { AuthenticationService } from '../_services';

@Injectable({ providedIn: 'root' })
export class LoggedInAuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService
    ) {}

    canActivate() {
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser) {
          console.log('entra aqui');
          this.router.navigate(['/dashboard']);
          return false;
        } else {
          return true;
        }
    }
}
