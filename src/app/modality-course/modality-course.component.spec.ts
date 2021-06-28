import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalityCourseComponent } from './modality-course.component';

describe('ModalityCourseComponent', () => {
  let component: ModalityCourseComponent;
  let fixture: ComponentFixture<ModalityCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalityCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalityCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
