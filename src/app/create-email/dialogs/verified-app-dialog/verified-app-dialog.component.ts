import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-verified-app-dialog',
  templateUrl: './verified-app-dialog.component.html',
  styleUrls: ['./verified-app-dialog.component.scss']
})
export class VerifiedAppDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<VerifiedAppDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

}
