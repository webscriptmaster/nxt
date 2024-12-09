import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-use-credits-dialogs',
  templateUrl: './use-credits-dialogs.component.html',
  styleUrls: ['./use-credits-dialogs.component.scss']
})
export class UseCreditsDialogsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<UseCreditsDialogsComponent>
  ) { }

  ngOnInit() {
  }

}
