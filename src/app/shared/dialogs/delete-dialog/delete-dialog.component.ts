import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.scss']
})
export class DeleteDialogComponent {

  title: string;
  message: string;
  info: string;
  firstButtonText: string;
  secondButtonText: string;
  firstButtonColor: string;
  secondButtonColor: string;
  firstButtonBorder: string;
  secondButtonBorder: string;
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.message = data.message;
    this.info = data.info;
    this.firstButtonText = data.firstButtonText;
    this.secondButtonText = data.secondButtonText;
    this.firstButtonColor = data.firstButtonColor;
    this.secondButtonColor = data.secondButtonColor;
    this.firstButtonBorder = data.firstButtonBorder;
    this.secondButtonBorder = data.secondButtonBorder;
  }
}
