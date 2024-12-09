import { AuthService } from './../../../auth.service';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { SharedAthleticInfoComponent } from 'src/app/shared/components';
import { SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-sign-up-athletic-information',
  templateUrl: './athletic-information.component.html',
  styleUrls: ['./athletic-information.component.scss'],
})
export class SignUpAthleticInformationComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  sport: string | null = null;
  sports: any;

  _unsubscribeAll = new Subject<void>();

  @ViewChild(SharedAthleticInfoComponent)
  sharedAthleticInfoComponent: SharedAthleticInfoComponent;

  constructor(
    private _router: Router,
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
    this._router.navigate(['/auth/academic-information']);
  }

  onContinue() {
    if (this.sharedAthleticInfoComponent.form.valid && this.userData) {
      const oldValues = this.userData.primarySportAthleticInfo
        ? this.userData.primarySportAthleticInfo
        : {};
      const newValues = {
        ...oldValues,
        ...this.sharedAthleticInfoComponent.form.value,
      };
      this._auth.updateUserData(this.userData.id, {
        primarySportAthleticInfo: newValues,
      });

      if (this.sport) {
        this._router.navigate(['/auth/stats']);
      }
    } else {
      this.sharedAthleticInfoComponent.form.markAllAsTouched();
      this.sharedAthleticInfoComponent.feetControl.markAsTouched();
    }
  }

  // private _setSport(sport: string) {
  //   const key = sport
  //     .split(' ')
  //     .filter((w) => w != 'mens' && w != 'womens' && w != '&')
  //     .join('_');
  //   return key;
  // }
}
