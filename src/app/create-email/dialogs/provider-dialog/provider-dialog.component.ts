import { Component, Inject, OnInit } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {GmailImportantNoteComponent} from "../gmail-important-note/gmail-important-note.component";

@Component({
  selector: 'app-provider-dialog',
  templateUrl: './provider-dialog.component.html',
  styleUrls: ['./provider-dialog.component.scss']
})
export class ProviderDialogComponent implements OnInit {
  constructor(
    private matDialog: MatDialog,
    public dialogRef: MatDialogRef<ProviderDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  public handleClickLearnMore(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.matDialog.open(GmailImportantNoteComponent, {disableClose: true});
  }
}
