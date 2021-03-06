import { Component } from '@angular/core';
import { Router} from '@angular/router';
import { AuthenticationService } from './_services';

@Component({
          selector: 'app-root',
          templateUrl: 'app.component.html',
          styleUrls: ['./app.component.css']
 })
export class AppComponent {
    currentUser: any;

    constructor(private router: Router, private authenticationService: AuthenticationService) {
        this.router.errorHandler = (error: any) => {
          this.router.navigate(['404']); // or redirect to default route
          };
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    }

    logout() {
        this.authenticationService.logout();
        this.router.navigate(['/login']);
    }
}
