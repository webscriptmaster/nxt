import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { EmailAutomationService } from 'src/app/shared/email-automation.service';
import { SharedService } from 'src/app/shared/shared.service';
import { transformToCollegeSport } from 'src/app/shared/utils';
import { CollegeLibraryService } from 'src/app/college-library/college-library.service';

@Component({
  selector: 'app-campaign-sent',
  templateUrl: './campaign-sent.component.html',
  styleUrls: ['./campaign-sent.component.scss'],
})
export class CampaignSentComponent implements OnInit {
  user$: Observable<User | null>;
  user: User | null;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _unsubscribeAll = new Subject<void>();
  campaignsSent: any;
  tab: number = 0;
  collegeSport: any;
  collegesInCampaign: any = [];
  collegeHasCoachOpen: any = [];
  collegeHasCoachClick: any = [];
  numberOfSentEmail: number = 0;
  numberOfOpenEmail: number = 0;
  numberOfClicks: number = 0;
  index: number = 0;
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private libraryService: CollegeLibraryService
  ) {
    this.user$ = this._auth.user$;
    const navigation = this._router.getCurrentNavigation();
    const state = navigation?.extras.state;
    if (state && state['data']) {
      this.campaignsSent = state['data'];
    }
  }

  ngOnInit(): void {
    this.loading$.next(true);
    this._auth.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(async (res) => {
        this.collegeHasCoachOpen = [];
        this.collegeHasCoachClick = [];
        this.numberOfOpenEmail = 0;
        this.numberOfClicks = 0;
        this.user = res;
        if (this.user) {
          const currentSentCollegesLength =
            this.campaignsSent.sentColleges.length;
          this.numberOfSentEmail = this.campaignsSent.numberOfSentEmail;
          const uuid = this.user.id;
          if (!(this.user?.appSport && this.user?.appSport === 'secondary')) {
            this.collegeSport = transformToCollegeSport(this.user.primarySport);
          } else {
            this.collegeSport = transformToCollegeSport(
              this.user.secondarySport
            );
          }
          if (
            this.campaignsSent.sentColleges.length !==
              currentSentCollegesLength ||
            this.collegesInCampaign.length === 0
          ) {
            for (const college of this.campaignsSent.sentColleges) {
              const res2 = await this.libraryService
                .getCollegeInfo(college, this.collegeSport, uuid)
                .toPromise();
              this.collegesInCampaign.push(res2);
            }
          }
          const collegeIds: any[] = [];

          for (const coach of this.campaignsSent?.readCoachesList) {
            if (
              (coach.isClick || coach.isOpen) &&
              !collegeIds.includes(coach.collegeId)
            ) {
              collegeIds.push(coach.collegeId);
            }
            if (coach.isOpen) {
              this.numberOfOpenEmail++;
              const collegeHasOpen = await this.libraryService
                .getCollegeInfo(coach.collegeId, this.collegeSport, uuid)
                .toPromise();
              this.collegeHasCoachOpen.push(collegeHasOpen);
            }
            if (coach.isClick) {
              this.numberOfClicks++;
              const collegeHasClick = await this.libraryService
                .getCollegeInfo(coach.collegeId, this.collegeSport, uuid)
                .toPromise();
              this.collegeHasCoachClick.push(collegeHasClick);
            }
          }
          this.loading$.next(false);
        }
      });
  }

  selectTab(tab: number) {
    this.tab = tab;
  }
  onHome(event: boolean) {
    this._router.navigate(['/home']);
  }

  async onLogout(event: boolean) {
    await this._auth.SignOut();
    this._router.navigate(['/']);
  }

  onProfile(event: boolean) {
    this._router.navigate(['/edit-profile']);
  }

  onSettings(event: boolean) {
    this._router.navigate(['/settings']);
  }

  onEditProfile(event: boolean) {
    this._router.navigate(['/edit-profile']);
  }

  onAddOffers(event: boolean) {
    this._router.navigate(['/offers']);
  }

  onAddSport(event: boolean) {
    this._router.navigate(['/add-sport']);
  }

  onReferFriend(event: boolean) {
    this._router.navigate(['/refer']);
  }

  onContactUs(event: boolean) {
    this._router.navigate(['settings/contact-us']);
  }

  async onBack() {
    this._router.navigate(['email-automation']);
  }
}
