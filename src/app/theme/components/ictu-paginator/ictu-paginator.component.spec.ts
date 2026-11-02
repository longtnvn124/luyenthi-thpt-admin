import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IctuPaginatorComponent } from './ictu-paginator.component';

describe('IctuPaginatorComponent', () => {
  let component: IctuPaginatorComponent;
  let fixture: ComponentFixture<IctuPaginatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IctuPaginatorComponent]
    });
    fixture = TestBed.createComponent(IctuPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
