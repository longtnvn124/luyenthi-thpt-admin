import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IctuDeleteAnimationComponent } from './ictu-delete-animation.component';

describe('IctuDeleteAnimationComponent', () => {
  let component: IctuDeleteAnimationComponent;
  let fixture: ComponentFixture<IctuDeleteAnimationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IctuDeleteAnimationComponent]
    });
    fixture = TestBed.createComponent(IctuDeleteAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
