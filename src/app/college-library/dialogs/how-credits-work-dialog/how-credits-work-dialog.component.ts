import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-how-credits-work-dialog',
  templateUrl: './how-credits-work-dialog.component.html',
  styleUrls: ['./how-credits-work-dialog.component.scss']
})
export class HowCreditsWorkDialogComponent {

  step = 0;
  features = [
    {id: 0, text: 'Unlock colleges across the nation'},
    {id: 1, text: 'Easily contact D1-Juco Coaches.'},
    {id: 2, text: 'Tap the star to favorite colleges.'},
    {id: 3, text: 'Tap team logo to open website.'},
    {id: 4, text: 'Access all college information.'},
    {id: 5, text: 'Sign up for camps & complete questionnaires.' }
  ]
  constructor(
    public dialogRef: MatDialogRef<HowCreditsWorkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _auth: AuthService
  ) {}

  next(): void {
    
  }

  close(): void {
    this.dialogRef.close();
    this._auth.updateUserData(this.data.user.id, {
      isShowedHowCollegeCreditWorks: true
    })
  }
}
