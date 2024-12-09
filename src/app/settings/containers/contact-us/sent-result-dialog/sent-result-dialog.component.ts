import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-contact-us-sent-result-dialog',
  templateUrl: './sent-result-dialog.component.html',
  styleUrls: ['./sent-result-dialog.component.scss'],
})
export class ContactUsSentResultDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ContactUsSentResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}
}
