import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-share-offers-dialog',
  templateUrl: './share-offers-dialog.component.html',
  styleUrls: ['./share-offers-dialog.component.scss'],
})
export class ShareOffersDialog implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ShareOffersDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}
}
