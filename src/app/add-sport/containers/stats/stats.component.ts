import { AuthService } from 'src/app/auth/auth.service';
import { StatsSkipDialogComponent } from './skip-dialog/skip-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { SharedStatsComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-add-sport-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class AddSportStatsComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  sport: string | null = null;

  _unsubscribeAll = new Subject<void>();

  @ViewChild(SharedStatsComponent) sharedStatsComponent: SharedStatsComponent;

  constructor(
    private _router: Router,
    private _matDialog: MatDialog,
    private _auth: AuthService
  ) {}

  async ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData && this.userData.secondarySport) {
        this.sport = this.userData.secondarySport;
        this.showSkipStatsDialog();
      } else {
        this._router.navigate(['/add-sport/stats']);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/add-sport/athletic-info']);
  }

  onContinue() {
    if (this.sharedStatsComponent.form.valid && this.userData) {
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

      this._router.navigate(['/add-sport/offers']);
    } else {
      this.sharedStatsComponent.form.markAllAsTouched();
    }
    this._router.navigate(['/add-sport/offers']);
  }

  async showSkipStatsDialog() {
    if (!this._auth.addSportSkipStatsShowed) {
      this._auth.addSportSkipStatsShowed = true;
      const dialogRef = this._matDialog.open(StatsSkipDialogComponent, {
        disableClose: true,
      });
      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) {
        this._router.navigate(['/add-sport/offers']);
      }
    }
  }
}
