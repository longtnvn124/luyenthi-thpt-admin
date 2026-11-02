import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDelete2Component } from './confirm-delete2.component';

describe('ConfirmDelete2Component', () => {
  let component: ConfirmDelete2Component;
  let fixture: ComponentFixture<ConfirmDelete2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmDelete2Component]
    });
    fixture = TestBed.createComponent(ConfirmDelete2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
