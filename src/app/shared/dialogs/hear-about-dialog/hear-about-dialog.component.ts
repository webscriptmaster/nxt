import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { SharedService } from '../../shared.service';

@Component({
  selector: 'app-hear-about-dialog',
  templateUrl: './hear-about-dialog.component.html',
  styleUrls: ['./hear-about-dialog.component.scss'],
})
export class HearAboutDialogComponent implements OnInit {
  hearAbout: string;
  clubName: string;
  otherSpecify: string;

  constructor(
    public dialogRef: MatDialogRef<HearAboutDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _auth: AuthService,
    private _sharedService: SharedService
  ) {}

  ngOnInit() {}

  onSelect(value: string) {
    if (value != 'club') {
      this.clubName = '';
    }
    if (value != 'other') {
      this.otherSpecify = '';
    }
    this.hearAbout = value;
  }

  async onSubmit() {
    const userId = (await firstValueFrom(this._auth.user$))!.id;
    if (userId && this.hearAbout) {
      const data: any = {
        user: userId,
        hearAbout: this.hearAbout,
      };

      if (this.hearAbout === 'club') {
        data['clubName'] = this.clubName;
      }
      if (this.hearAbout === 'other') {
        data['otherSpecify'] = this.otherSpecify;
      }
      this._auth.updateUserData(userId, { showedHearAbout: true });

      this._sharedService.addHearAbout(data);
      this.dialogRef.close();
    }
  }
}
