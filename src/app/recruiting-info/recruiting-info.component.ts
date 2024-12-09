import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { filter, Observable, Subject, switchMap, takeUntil } from 'rxjs';
import { User } from '../models/user';
import {
  RECRUITING_CALENDAR_D1,
  RECRUITING_CALENDAR_D2,
} from '../shared/const';
import { SportService } from '../shared/sport.service';
import * as _ from 'lodash';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-recruiting-info',
  templateUrl: './recruiting-info.component.html',
  styleUrls: ['./recruiting-info.component.scss'],
})
export class RecruitingInfoComponent implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  user: User;

  userSport: any;

  RECRUITING_CALENDAR_D1 = RECRUITING_CALENDAR_D1;
  RECRUITING_CALENDAR_D2 = RECRUITING_CALENDAR_D2;
  D1_Academic_Requirements =
    'http://fs.ncaa.org/Docs/eligibility_center/Student_Resources/DI_ReqsFactSheet.pdf';

  D2_Academic_Requirements =
    'http://fs.ncaa.org/Docs/eligibility_center/Student_Resources/DII_ReqsFactSheet.pdf';
  NCAA_Center_Eligibility_ID = 'https://web3.ncaa.org/ecwr3/register/PROFILE';
  NCAA_Center_Recruiting_Guidlines =
    'https://www.ncaa.org/sports/2014/10/8/recruiting.aspx';
  NCAA_Center_Recruiting_Facts =
    'https://ncaaorg.s3.amazonaws.com/compliance/recruiting/NCAA_RecruitingFactSheet.pdf';
  NAIA_Center_Home = 'https://www.naia.org/landing/index';
  NAIA_Center_Eligibilty_Center = 'https://play.mynaia.org/';
  NAIA_Center_Eligibilty_Guide =
    'https://www.naia.org/findyourpath/highschool/index';
  NJCAA_Center_Home = 'https://www.njcaa.org/landing/index';
  NJCAA_Center_Eligibilty_Requirements = 'https://www.njcaa.org/compete/faqs';
  NJCAA_Center_Eligibilty_Center =
    'https://www.njcaa.org/eligibility/2020-21/index';
  CCCAA_Center_Home = 'https://www.cccaasports.org/landing/index';
  CCCAA_Center_Eligibility_Info =
    'https://www.cccaasports.org/Student_Athletes/Index';

  recruitingInfo: any = [];
  sports: any;

  _unsubscribeALL: Subject<void> = new Subject();

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _sportService: SportService
  ) {
    this.user$ = this._auth.user$;
  }

  ngOnInit() {
    this._sportService
      .getSportsSettings$()
      .pipe(
        takeUntil(this._unsubscribeALL),
        switchMap((sports) => {
          this.sports = _.cloneDeep(sports);
          return this._auth.user$;
        }),

        filter((user) => user !== null),
        takeUntil(this._unsubscribeALL)
      )
      .subscribe(async (user: any) => {
        this.user = user;
        if (
          !(this.user.completeAddSport && this.user.appSport === 'secondary')
        ) {
          this.userSport = this.user.primarySport;
        } else {
          this.userSport = this.user.secondarySport;
        }
        if (this.sports) {
          const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/RecruitingInfo%2F`;
          this.recruitingInfo = this.sports[this.userSport].recruitingInfo
            .sort((a: any, b: any) => a.order - b.order)
            .map((res: any) => {
              res['links'] = res.links
                .sort((a: any, b: any) => a.order - b.order)
                .map((item: any) => {
                  item['iconUrl'] = `${baseUrl}${
                    item.icon
                  }?alt=media&time=${Date.now()}`;
                  return item;
                });
              return res;
            });
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribeALL.next();
    this._unsubscribeALL.complete();
  }

  async onBack() {
    this._router.navigate(['home']);
  }

  async onLogout(event: boolean) {
    await this._auth.SignOut();
    this._router.navigate(['/']);
  }


  onHome(event: boolean) {
    this._router.navigate(['/home']);
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

  openLink(url: any) {
    return new Promise((res, rej) => {
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
      }, 0);
    });
  }
}
