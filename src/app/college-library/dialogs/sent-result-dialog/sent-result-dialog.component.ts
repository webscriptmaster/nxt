import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sent-result-dialog',
  templateUrl: './sent-result-dialog.component.html',
  styleUrls: ['./sent-result-dialog.component.scss'],
})
export class SentResultDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SentResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}
}
