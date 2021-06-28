import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { VerificationComponent } from './verification/verification.component';
import { AuthGuard } from './_helpers';
import { LoggedInAuthGuard } from './_helpers';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [LoggedInAuthGuard]},

     {
      path: 'teacher',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: '',
      component: AdminLayoutComponent,
      canActivate: [AuthGuard],
      children: [{
        path: '',
        loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
      }]
    },

    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'verification', component: VerificationComponent },

    // otherwise redirect to home

    { path: '**', redirectTo: '' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
