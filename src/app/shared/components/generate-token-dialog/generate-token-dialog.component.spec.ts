import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateTokenDialogComponent } from './generate-token-dialog.component';

describe('GenerateTokenDialogComponent', () => {
  let component: GenerateTokenDialogComponent;
  let fixture: ComponentFixture<GenerateTokenDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerateTokenDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenerateTokenDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
