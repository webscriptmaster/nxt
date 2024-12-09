import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-gmail-important-note',
  templateUrl: './gmail-important-note.component.html',
  styleUrls: ['./gmail-important-note.component.scss']
})
export class GmailImportantNoteComponent {

  constructor(
    public dialogRef: MatDialogRef<GmailImportantNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }
}
