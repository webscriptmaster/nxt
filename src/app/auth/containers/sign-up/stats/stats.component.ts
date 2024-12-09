import { SharedStatsComponent } from './../../../../shared/components/stats/stats.component';
import { AuthService } from 'src/app/auth/auth.service';
import { StatsSkipDialogComponent } from './skip-dialog/skip-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-sign-up-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class SignUpStatsComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  sport: string | null = null;
  sports: any;

  _unsubscribeAll = new Subject<void>();

  @ViewChild(SharedStatsComponent) sharedStatsComponent: SharedStatsComponent;

  constructor(
    private _router: Router,
    private _matDialog: MatDialog,
    private _auth: AuthService,
    private _sportService: SportService
  ) {}

  async ngOnInit() {
    this._sportService
      .getSportsSettings$()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.sports = res;
      });
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData && this.userData.primarySport) {
        this.sport = this.userData.primarySport;
        this.showSkipStatsDialog();
      } else {
        this._router.navigate(['/auth/choose-sport']);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/auth/athletic-information']);
  }

  onContinue() {
    if (this.sharedStatsComponent.form.valid && this.userData) {
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

      this._router.navigate(['/auth/offers']);
    } else {
      this.sharedStatsComponent.form.markAllAsTouched();
    }
    this._router.navigate(['/auth/offers']);
  }

  async showSkipStatsDialog() {
    if (!this._auth.signUpSkipStatsShowed) {
      this._auth.signUpSkipStatsShowed = true;
      const dialogRef = this._matDialog.open(StatsSkipDialogComponent, {
        disableClose: true,
      });
      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) {
        this._router.navigate(['/auth/offers']);
      }
    }
  }
}
