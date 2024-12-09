import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-save-campaign-dialog',
  templateUrl: './save-campaign-dialog.component.html',
  styleUrls: ['./save-campaign-dialog.component.scss']
})
export class SaveCampaignDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<SaveCampaignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {}
}
