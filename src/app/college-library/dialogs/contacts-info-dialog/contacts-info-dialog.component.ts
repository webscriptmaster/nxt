import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { CreateEmailService } from 'src/app/create-email/create-email.service';
import { environment } from 'src/environments/environment';

export interface EmailVideoSettings {
  title: String | null;
  subtitle: String | null;
  video: String | null;
  thumbnail: String | null;
}

@Component({
  selector: 'app-college-library-contacts-info-dialog',
  templateUrl: './contacts-info-dialog.component.html',
  styleUrls: ['./contacts-info-dialog.component.scss'],
})
export class CollegeLibraryContactsInfoDialogComponent implements OnInit {
  settings: EmailVideoSettings = {
    title: null,
    subtitle: null,
    video: null,
    thumbnail: null,
  };

  constructor(
    public dialogRef: MatDialogRef<CollegeLibraryContactsInfoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _emailService: CreateEmailService,
    private _auth: AuthService
  ) {}

  ngOnInit() {
    this._emailService.getEmailVideo().subscribe((res) => {
      const baseVideoUrl = `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/Videos%2F`;
      const baseThumbnailsUrl = `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/Thumbnails%2F`;
      if (res?.title) {
        this.settings.title = res.title;
      }
      if (res?.subtitle) {
        this.settings.subtitle = res.subtitle;
      }
      if (res?.video) {
        this.settings.video = `${baseVideoUrl}${
          res.video
        }?alt=media&time=${Date.now()}`;
      }
      if (res?.thumbnail) {
        this.settings.thumbnail = `${baseThumbnailsUrl}${
          res.thumbnail
        }?alt=media&time=${Date.now()}`;
      }
    });
  }

  onClose() {
    if (this.data?.user?.id) {
      this._auth.updateUserData(this.data.user.id, {
        isShowedFirstOpenCampaigns: true,
      });
    }
    this.dialogRef.close(true);
  }
}
