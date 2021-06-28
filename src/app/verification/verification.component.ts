import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routerTransition } from '../router.animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AlertService } from '../_alert';
import { Subscription } from 'rxjs';
import { UserService} from '../_services';

@Component({
    selector: 'app-verification',
    templateUrl: './verification.component.html',
    styleUrls: ['./verification.component.scss'],
    animations: [routerTransition()]
})
export class VerificationComponent implements OnInit, OnDestroy {
    verificationForm: FormGroup;
    token: string;
    email: string;

    private subscription: Subscription ;

    options = {
      autoClose: true,
      keepAfterRouteChange: true
    };

    /* tslint:disable:no-string-literal */

    constructor(
      private route: ActivatedRoute,
      private router: Router,
      private formBuilder: FormBuilder,
      private userService: UserService,
      protected alertService: AlertService
      ) {
    }

    ngOnInit() {
      this.verificationForm = this.formBuilder.group({});
      this.subscription = this.route.queryParams.subscribe(params => {
        this.token = params['token'];
        this.email = params['email'];

        this.userService.verification(this.email, this.token)
        .pipe(first())
        .subscribe(

            data => {

                console.log('response: ' + data);

                setTimeout(() => {
                  this.router.navigate(['/login']);
                }, 3000);
            },
            error => {

              console.log('error: ' + error);

              this.alertService.error(error, this.options);

            });
      });
    }
    /* tslint:enable:no-string-literal */


    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
}
