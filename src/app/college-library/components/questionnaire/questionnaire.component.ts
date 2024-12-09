import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/app/models/user';
import { CollegeLibraryService } from '../../college-library.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth/auth.service';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-college-card-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss'],
})
export class CollegeCardQuestionnairesComponent implements OnInit {
  @Input() sport: any;
  @Input() questionnaire: any;
  @Input() college: any;
  @Input() user: User;
  @Input() collegeSport: any;
  @Input() isCamp: boolean;
  showShare = false;

  constructor(
    private _collegeService: CollegeLibraryService,
    private dialog: MatDialog,
    private _auth: AuthService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {}

  async completeQuestionnaire() {
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
    if (!this.user.completeQuestionnaires?.includes(this.college._id)) {
      const confirmDeleteDialogRef = await this.dialog.open(
        ConfirmDialogComponent,
        {
          autoFocus: false,
          data: {
            title: 'Complete Questionnaire 🎓',
            message: 'Did you fill out this college questionnaire?',
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

      const completeQuestionnaire = this.user?.completeQuestionnaires || [];
      completeQuestionnaire.unshift(this.college._id);
      this._auth.updateUserData(this.user.id, {
        completeQuestionnaires: completeQuestionnaire,
      });
      if (this.user && this.user?.activityTracking) {
        const data = {
          collegeId: this.college._id,
          collegeName: this.college.name,
          date: new Date(),
          message: 'questionnaire completed.',
          sport: this.collegeSport,
          logoUrl: this.college.logoUrl,
          twitter: this.college['sportInfo'][this.collegeSport].twitter,
          division: this.college['sportInfo'][this.collegeSport].division,
          conference: this.college['sportInfo'][this.collegeSport].conference,
          conferenceLogo: this.college['sportInfo'][this.collegeSport],
          sportLandingUrl:
            this.college['sportInfo'][this.collegeSport]['sportLandingUrl'] ||
            '',
          userId: this.user?.id,
        };
        this.sharedService.addQuestionnare(data);
      }
    }
  }

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
        this.completeQuestionnaire();
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

  copy(url: string) {
    navigator.clipboard.writeText(url);
  }
}
