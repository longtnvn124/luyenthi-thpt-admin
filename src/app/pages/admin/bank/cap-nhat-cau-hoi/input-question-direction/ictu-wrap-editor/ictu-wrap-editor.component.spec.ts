import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IctuWrapEditorComponent } from './ictu-wrap-editor.component';

describe('IctuWrapEditorComponent', () => {
  let component: IctuWrapEditorComponent;
  let fixture: ComponentFixture<IctuWrapEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IctuWrapEditorComponent]
    });
    fixture = TestBed.createComponent(IctuWrapEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
