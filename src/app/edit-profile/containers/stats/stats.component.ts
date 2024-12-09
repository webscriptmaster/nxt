import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { SharedStatsComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-edit-profile-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class EditProfileStatsComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  sport: string | null = null;
  saved$ = new BehaviorSubject(false);
  showProspectSheet = false;

  _unsubscribeAll = new Subject<void>();

  @ViewChild(SharedStatsComponent) sharedStatsComponent: SharedStatsComponent;

  constructor(private _router: Router, private _auth: AuthService) {}

  async ngOnInit() {
    window.addEventListener('keyup', this.onEsc.bind(this));

    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData) {
        if (
          !(
            this.userData.completeAddSport &&
            this.userData.appSport === 'secondary'
          )
        ) {
          this.sport = this.userData.primarySport;
        } else {
          this.sport = this.userData.secondarySport;
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
    if (this.sharedStatsComponent.form.valid && this.userData) {
      if (
        !(
          this.userData.completeAddSport &&
          this.userData.appSport === 'secondary'
        )
      ) {
        const oldValues = this.userData.primarySportStats
          ? this.userData.primarySportStats
          : {};
        const newValues = {
          ...oldValues,
          ...this.sharedStatsComponent.form.value,
        };
        this._auth.updateUserData(this.userData.id, {
          primarySportStats: newValues,
        });
      } else {
        const oldValues = this.userData.secondarySportStats
          ? this.userData.secondarySportStats
          : {};
        const newValues = {
          ...oldValues,
          ...this.sharedStatsComponent.form.value,
        };
        this._auth.updateUserData(this.userData.id, {
          secondarySportStats: newValues,
        });
      }

      this.saved$.next(true);
      setTimeout(() => {
        this.saved$.next(false);
      }, 1500);
    } else {
      this.sharedStatsComponent.form.markAllAsTouched();
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
