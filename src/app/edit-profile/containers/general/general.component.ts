import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from 'src/app/models/user';
import { Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { noWhitespaceValidator } from 'src/app/shared/utils';
import { SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-edit-profile-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class EditProfileGeneralComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  saved$ = new BehaviorSubject(false);
  showProspectSheet = false;

  clases = [
    2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031,
    2032, 2033, 2034, 2035,
  ];
  athleteOrParentOrCoach = ['Athlete', 'Parent', 'Coach'];

  generalForm: FormGroup;
  secondaryGeneralForm: FormGroup;

  hidePositions = false;

  _unsubscribeAll = new Subject<void>();
  noRecruitForm: FormGroup;

  sport: string;
  public sports: any;
  public sportsList: any[] = [];
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _sportService: SportService
  ) {}

  async ngOnInit() {
    window.addEventListener('keyup', this.onEsc.bind(this));
    this._sportService
      .getSportsSettings$()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.sports = res;
        this.sportsList = this._sportService.getOrderedSports(res);
      });
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData) {
        if (!this.userData?.isRecruit) {
          this.makeNoRecruitForm(this.userData);
          return;
        }
        if (
          !(
            this.userData.completeAddSport &&
            this.userData.appSport === 'secondary'
          )
        ) {
          if (this.userData.primarySport) {
            this.sport = this._setSport(this.userData.primarySport);
          } else {
            // this.onBack();
          }
        } else {
          if (this.userData.secondarySport) {
            this.sport = this._setSport(this.userData.secondarySport);
          } else {
            // this.onBack();
          }
        }

        if (
          this.sport &&
          (this.sport.includes('golf') ||
            this.sport.includes('wrestling') ||
            this.sport.includes('tennis'))
        ) {
          this.hidePositions = true;
        }
      }

      if (
        !(
          this.userData?.completeAddSport &&
          this.userData.appSport === 'secondary'
        )
      ) {
        this.makeGeneralForm(this.userData);
      } else {
        this.makeSecondaryGeneralForm(this.userData);
      }
    });
  }
  ngOnDestroy(): void {
    window.removeEventListener('keyup', this.onEsc.bind(this));
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  public goToProfile() {
    const email = this.userData.email.split('@')[0];
    let provider = this.userData.email.split('@')[1];
    if (['gmail.com', 'hotmail.com', 'outlook.com'].includes(provider)) {
      provider = provider.charAt(0);
    }
    const code = `${email}-${provider}`;

    this._router.navigate([`/prospect-profile/${code}`]);
  }

  makeNoRecruitForm(user: User | null) {
    this.noRecruitForm = new FormGroup({
      firstName: new FormControl(
        user && user.firstName ? user.firstName : this.userData?.firstName,
        [Validators.required, noWhitespaceValidator]
      ),
      lastName: new FormControl(
        user && user.lastName ? user.lastName : this.userData?.lastName,
        [Validators.required, noWhitespaceValidator]
      ),
      email: new FormControl(
        user && user.email
          ? user.email
          : this.userData.email
          ? this.userData?.email
          : null,
        [Validators.required, noWhitespaceValidator]
      ),
      sport: new FormControl(user && user.sport ? user.sport : null, [
        Validators.required,
        noWhitespaceValidator,
      ]),
      organization: new FormControl(
        user && user.organization ? user.organization : null
      ),
      secondOrganization: new FormControl(
        user && user.secondOrganization ? user.secondOrganization : null
      ),
      coachTitle: new FormControl(
        user && user.coachTitle ? user.coachTitle : null
      ),
    });
  }

  makeGeneralForm(user: User | null) {
    this.generalForm = new FormGroup({
      firstName: new FormControl(
        user && user.firstName ? user.firstName : null,
        [Validators.required]
      ),
      lastName: new FormControl(user && user.lastName ? user.lastName : null, [
        Validators.required,
      ]),
      athleteOrParentOrCoach: new FormControl(
        user && user.athleteOrParentOrCoach
          ? user.athleteOrParentOrCoach
          : null,
        [Validators.required]
      ),
      highSchool: new FormControl(
        user && user.highSchool ? user.highSchool : null,
        [Validators.required]
      ),
      highSchoolSuffix: new FormControl(
        user && user.highSchoolSuffix ? user.highSchoolSuffix : 'High School',
        [Validators.required]
      ),
      classOf: new FormControl(user && user.classOf ? user.classOf : null, [
        Validators.required,
      ]),
      club: new FormControl(user && user.club ? user.club : null),
    });
  }

  makeSecondaryGeneralForm(user: User | null) {
    this.secondaryGeneralForm = new FormGroup({
      firstName: new FormControl(
        user && user.firstName ? user.firstName : null,
        [Validators.required]
      ),
      lastName: new FormControl(user && user.lastName ? user.lastName : null, [
        Validators.required,
      ]),
      secondaryHighSchool: new FormControl(
        user && user.secondaryHighSchool ? user.secondaryHighSchool : null,
        [Validators.required]
      ),
      secondaryHighSchoolSuffix: new FormControl(
        user && user.secondaryHighSchoolSuffix
          ? user.secondaryHighSchoolSuffix
          : 'High School',
        [Validators.required]
      ),
      classOf: new FormControl(user && user.classOf ? user.classOf : null, [
        Validators.required,
      ]),
    });
  }

  onBack() {
    this._router.navigate(['/edit-profile']);
  }

  onEditProfile() {
    this._router.navigate(['edit-profile']);
  }

  onSwitchPositions() {
    this._router.navigate(['edit-profile/positions']);
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

  onSave() {
    if (this.userData) {
      if (this.noRecruitForm && this.noRecruitForm.valid) {
        this._auth.updateUserData(this.userData.id, {
          ...this.noRecruitForm.value,
        });

        this.saved$.next(true);
        setTimeout(() => {
          this.saved$.next(false);
        }, 1500);

        return;
      }
      if (
        !(
          this.userData.completeAddSport &&
          this.userData.appSport === 'secondary'
        )
      ) {
        if (this.generalForm.valid) {
          this._auth.updateUserData(this.userData.id, this.generalForm.value);
        }
      } else {
        if (this.secondaryGeneralForm.valid) {
          this._auth.updateUserData(
            this.userData.id,
            this.secondaryGeneralForm.value
          );
        }
      }

      this.saved$.next(true);
      setTimeout(() => {
        this.saved$.next(false);
      }, 1500);
    } else {
      this.generalForm.markAllAsTouched();
    }
  }

  private _setSport(sport: string) {
    const key = sport
      .split(' ')
      .filter((w) => w != 'mens' && w != 'womens' && w != '&')
      .join('_');
    return key;
  }

  onCloseProspectSheet(event: MouseEvent) {
    if (window.innerWidth >= 1280 && this.showProspectSheet) {
      const target = event.target as HTMLElement;
      if (target.classList.contains('prospect-sheet-container')) {
        this.showProspectSheet = false;
      }
    }
  }

  onEsc(event: KeyboardEvent) {
    if (this.showProspectSheet && event.key === 'Escape') {
      this.showProspectSheet = false;
    }
  }
}
