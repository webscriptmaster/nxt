import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-submit-offer-dialog',
  templateUrl: './submit-offer-dialog.component.html',
  styleUrls: ['./submit-offer-dialog.component.scss']
})
export class SubmitOfferDialogComponent implements OnInit {

  constructor(    public dialogRef: MatDialogRef<SubmitOfferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
