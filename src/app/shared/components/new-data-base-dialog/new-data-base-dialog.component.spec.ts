import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDataBaseDialogComponent } from './new-data-base-dialog.component';

describe('NewDataBaseDialogComponent', () => {
  let component: NewDataBaseDialogComponent;
  let fixture: ComponentFixture<NewDataBaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewDataBaseDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewDataBaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
