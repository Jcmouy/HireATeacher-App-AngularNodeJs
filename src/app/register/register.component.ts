import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { UserService, AuthenticationService } from '../_services';
import { AlertService } from '../_alert';
import { MustMatch } from '../_helpers/must-match.validator';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss'],
    animations: [routerTransition()]
})
export class RegisterComponent implements OnInit {
    registerForm: FormGroup;
    loading = false;
    submitted = false;

    options = {
      autoClose: true,
      keepAfterRouteChange: true
    };

    constructor(
      private formBuilder: FormBuilder,
      private router: Router,
      private authenticationService: AuthenticationService,
      private userService: UserService,
      protected alertService: AlertService,
      public translate: TranslateService
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.currentUserValue) {
          this.router.navigate(['/']);
        }
    }

    ngOnInit() {
        this.registerForm = this.formBuilder.group({
            username: ['', Validators.required],
            completeName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            check_password: ['', [Validators.required, Validators.minLength(6)]]
        }, {
          validator: MustMatch('password', 'check_password')
        });
    }

    // convenience getter for easy access to form fields
    get f() { return this.registerForm.controls; }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.registerForm.invalid) {
            return;
        }

        this.loading = true;

        this.userService.register(this.registerForm.value)
            .pipe(first())
            .subscribe(

                data => {

                    console.log('response: ' + data);

                    this.alertService.success(this.translate.instant('SuccessSignUp'), this.options);
                    this.alertService.success(this.translate.instant('SuccessMessageSignUp'), this.options);
                    setTimeout(() => {
                      this.router.navigate(['/login']);
                    }, 5000);
                },
                error => {
                  this.alertService.error(error, this.options);
                  this.loading = false;
                });

    }
}
