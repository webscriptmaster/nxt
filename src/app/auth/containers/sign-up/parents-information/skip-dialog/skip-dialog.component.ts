import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sign-up-parents-skip-dialog',
  templateUrl: './skip-dialog.component.html',
  styleUrls: ['./skip-dialog.component.scss'],
})
export class ParentsSkipDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ParentsSkipDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}
}
