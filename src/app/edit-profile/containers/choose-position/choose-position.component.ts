import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-edit-profile-choose-position',
  templateUrl: './choose-position.component.html',
  styleUrls: ['./choose-position.component.scss'],
})
export class EditProfileChoosePositionComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  saved$ = new BehaviorSubject(false);
  showProspectSheet = false;

  sports: any;
  positions: string[] = [];
  selectedPositions: { [key: string]: boolean } = {};

  _unsubscribeAll = new Subject<void>();

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
      });
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData) {
        if (
          !(
            this.userData.completeAddSport &&
            this.userData.appSport === 'secondary'
          )
        ) {
          if (this.userData.primarySport) {
            this.positions =
              this.sports[this.userData.primarySport]['positions'];
            if (this.userData.primarySportPositions) {
              this.selectedPositions =
                this.userData.primarySportPositions.reduce((acc: any, val) => {
                  acc[val] = true;
                  return acc;
                }, {});
            }
          } else {
            this.onBack();
          }
        } else {
          if (this.userData.secondarySport) {
            this.positions =
              this.sports[this.userData.secondarySport]['positions'];
            if (this.userData.secondarySportPositions) {
              this.selectedPositions =
                this.userData.secondarySportPositions.reduce(
                  (acc: any, val) => {
                    acc[val] = true;
                    return acc;
                  },
                  {}
                );
            }
          } else {
            this.onBack();
          }
        }
      } else {
        this.onBack();
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

  onSelectPosition(position: string) {
    if (this.selectedPositions[position]) {
      delete this.selectedPositions[position];
    } else {
      if (Object.keys(this.selectedPositions).length >= 3) {
        return;
      }
      this.selectedPositions[position] = true;
    }
  }

  onBack() {
    this._router.navigate(['/edit-profile/general']);
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

  async onSave() {
    const selectedPositions = Object.keys(this.selectedPositions).filter(
      (pos) => this.selectedPositions[pos]
    );
    if (
      selectedPositions.length > 0 &&
      selectedPositions.length <= 3 &&
      this.userData
    ) {
      if (
        !(
          this.userData.completeAddSport &&
          this.userData?.appSport === 'secondary'
        )
      ) {
        await this._auth.updateUserData(this.userData.id, {
          primarySportPositions: selectedPositions,
        });
      } else {
        await this._auth.updateUserData(this.userData.id, {
          secondarySportPositions: selectedPositions,
        });
      }

      this.saved$.next(true);
      setTimeout(() => {
        this.saved$.next(false);
      }, 1500);
    }
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
