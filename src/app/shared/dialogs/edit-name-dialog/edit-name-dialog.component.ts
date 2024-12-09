import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-name-dialog',
  templateUrl: './edit-name-dialog.component.html',
  styleUrls: ['./edit-name-dialog.component.scss']
})
export class EditNameDialogComponent {

  title: string;
  graphicName: string;
  info: string;
  firstButtonText: string;
  firstButtonColor: string;
  firstButtonBorder: string;
  isShowLogo: boolean | undefined | null = true;
  titleColor: string | undefined | null = '';
  constructor(
    public dialogRef: MatDialogRef<EditNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.title = data.title;
    this.info = data.info;
    this.firstButtonText = data.firstButtonText;
    this.firstButtonColor = data.firstButtonColor;
    this.firstButtonBorder = data.firstButtonBorder;
    this.isShowLogo = data.isShowLogo;
    this.titleColor = data.titleColor;
    this.graphicName = data.graphicName;
  }
}
