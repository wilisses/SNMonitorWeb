import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigDropboxDialogComponent } from './config-dropbox-dialog.component';

describe('ConfigDropboxDialogComponent', () => {
  let component: ConfigDropboxDialogComponent;
  let fixture: ComponentFixture<ConfigDropboxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigDropboxDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigDropboxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
