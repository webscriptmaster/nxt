import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-offer-dialog',
  templateUrl: './delete-offer-dialog.component.html',
  styleUrls: ['./delete-offer-dialog.component.scss'],
})
export class DeleteOfferDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeleteOfferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}
}
