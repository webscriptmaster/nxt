import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class SettingsConfirmDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SettingsConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}

  onClose() {
    this.dialogRef.close();
  }

  onYes() {
    this.dialogRef.close(true);
  }
}
