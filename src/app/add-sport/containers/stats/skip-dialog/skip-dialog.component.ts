import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-sign-up-stats-skip-dialog',
  templateUrl: './skip-dialog.component.html',
  styleUrls: ['./skip-dialog.component.scss'],
})
export class StatsSkipDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<StatsSkipDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  
}
