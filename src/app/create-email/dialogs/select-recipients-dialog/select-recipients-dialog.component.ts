import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-recipients-dialog',
  templateUrl: './select-recipients-dialog.component.html',
  styleUrls: ['./select-recipients-dialog.component.scss'],
})
export class SelectRecipientsDialogComponent implements OnInit {
  contact = 'test@contact.com'

  selectedOption: string;

  constructor(
    public dialogRef: MatDialogRef<SelectRecipientsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.contact = this.data.contact;
    console.log(this.contact);
    
  }

  ngOnInit() {}

  onAdd() {
    if (!this.selectedOption) {
      return
    }
    this.dialogRef.close(this.selectedOption)
  }
}
