import { Component, Input, OnInit } from '@angular/core';
import { CollegeLibraryService } from '../../college-library.service';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared/shared.service';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-college-card-camp',
  templateUrl: './camp.component.html',
  styleUrls: ['./camp.component.scss'],
})
export class CollegeCardCampComponent implements OnInit {
  @Input() camp: any;
  @Input() sport: any;
  @Input() college: any;
  @Input() user: User;
  @Input() collegeSport: any;
  showShare = false;

  constructor(
    private _collegeService: CollegeLibraryService,
    private dialog: MatDialog,
    private _auth: AuthService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {}

  openLink(url: string) {
    return new Promise((res, rej) => {
      if (!url) {
        rej(null);
      }
      setTimeout(() => {
        if (url) {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          link.remove();
          res(url);
        } else {
          res(null);
        }
        this.completeCamps();
      }, 0);
    });
  }

  onShare(e: Event, url: string) {
    if (navigator['share'] && window.innerWidth < 1280) {
      navigator.share({
        url: url,
      });
    } else {
      this.showShare = true;
      e.stopPropagation();
    }
  }

  async completeCamps() {
    const collegeDetails = await firstValueFrom(
      this._collegeService.getCollegeInfo(
        this.college._id,
        this.collegeSport,
        this.user.id
      )
    );
    this.college = {
      ...this.college,
      ...collegeDetails,
    };

    if (!this.user.completeCamps?.includes(this.college._id)) {
      const confirmDeleteDialogRef = await this.dialog.open(
        ConfirmDialogComponent,
        {
          autoFocus: false,
          data: {
            title: 'Complete Camp 🛫',
            message: 'Did you sign up for this college camp?',
            info: 'Tracking Enabled',
            firstButtonText: 'Yes',
            secondButtonText: 'No',
            firstButtonColor: '#CCFF00',
            secondButtonColor: '#FF0303',
            firstButtonBorder: '1px solid #fff',
            secondButtonBorder: '1px solid #fff',
          },
        }
      );
      const result = await firstValueFrom(confirmDeleteDialogRef.afterClosed());
      if (!result) {
        return;
      }
      const completeCamps = this.user?.completeCamps || [];
      completeCamps.unshift(this.college._id);
      this._auth.updateUserData(this.user.id, {
        completeCamps: completeCamps,
      });
      if (this.user && this.user?.activityTracking) {
        const data = {
          collegeId: this.college._id,
          collegeName: this.college.name,
          date: new Date(),
          message: 'camp.',
          sport: this.collegeSport,
          logoUrl: this.college.logoUrl,
          twitter: this.college['sportInfo'][this.collegeSport].twitter,
          campLink: this.college['sportInfo'][this.collegeSport].camp || '',
          division: this.college['sportInfo'][this.collegeSport].division,
          conference: this.college['sportInfo'][this.collegeSport].conference,
          conferenceLogo: this.college['sportInfo'][this.collegeSport],
          sportLandingUrl:
            this.college['sportInfo'][this.collegeSport]['sportLandingUrl'] ||
            '',
          userId: this.user?.id,
        };
        this.sharedService.addCamp(data);
      }
    }
  }

  copy(url: string) {
    navigator.clipboard.writeText(url);
  }
}
