import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routerTransition } from '../router.animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AlertService } from '../_alert';
import { AuthenticationService } from '../_services';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;

    options = {
      autoClose: true,
      keepAfterRouteChange: true
    };

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        protected alertService: AlertService,
        public translate: TranslateService
    ) {
        translate.addLangs([localStorage.getItem('translationCurrentLang')]);
        translate.setDefaultLang(localStorage.getItem('translationCurrentLang'));
        // redirect to home if already logged in
        /*
        if (this.authenticationService.currentUserValue) {
            this.router.navigate(['/']);
        }
        */
    }
    ngOnInit() {
      this.loginForm = this.formBuilder.group({
          username: ['', Validators.required],
          password: ['', Validators.required]
      });

      this.authenticationService.logout();

      // get return url from route parameters or default to '/'
      /* tslint:disable:no-string-literal */
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      /* tslint:enable:no-string-literal */

    }

    /*
    onLoggedin() {
        localStorage.setItem('isLoggedin', 'true');
    }
    */

    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;

        const response = this.authenticationService.login(this.f.username.value, this.f.password.value, false);
        response.pipe(first()).subscribe(
            data => {

              localStorage.setItem('translationCurrentLang', this.translate.getDefaultLang());

              console.log('response: ' + data);
              this.router.navigate(['/teacher']);
            },
            error => {

              console.log(error);

              const textError = this.translate.instant(error);

              console.log(textError);

              this.alertService.error(this.translate.instant(error), this.options);
              // this.alertService.error(error, this.options);
              this.loading = false;

            });
    }
}
