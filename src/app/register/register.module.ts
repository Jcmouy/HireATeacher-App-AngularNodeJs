import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SignupRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';

@NgModule({
    imports: [CommonModule, SignupRoutingModule],
    declarations: [RegisterComponent]
})
export class SignupModule {}
