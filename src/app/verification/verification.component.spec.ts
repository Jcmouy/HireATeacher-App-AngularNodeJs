import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { VerificationComponent } from './verification.component';
import { VerificationModule } from './verification.module';

describe('VerificationComponent', () => {
    let component: VerificationComponent;
    let fixture: ComponentFixture<VerificationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [VerificationModule, RouterTestingModule, BrowserAnimationsModule]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(VerificationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
