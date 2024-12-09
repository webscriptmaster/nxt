import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GmailImportantNoteComponent } from './gmail-important-note.component';

describe('GmailImportantNoteComponent', () => {
  let component: GmailImportantNoteComponent;
  let fixture: ComponentFixture<GmailImportantNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GmailImportantNoteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GmailImportantNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
