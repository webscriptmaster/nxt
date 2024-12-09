import { FormGroup } from '@angular/forms';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { SharedAthleticInfoComponent } from 'src/app/shared/components';
import { AuthService } from 'src/app/auth/auth.service';
import { SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-add-sport-athletic-information',
  templateUrl: './athletic-information.component.html',
  styleUrls: ['./athletic-information.component.scss'],
})
export class AddSportAthleticInformationComponent implements OnInit, OnDestroy {
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
      if (this.userData && this.userData.secondarySport) {
        this.sport = this.userData.secondarySport;
      } else {
        this._router.navigate(['/add-sport/choose-sport']);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/add-sport/academic-info']);
  }

  onContinue() {
    if (this.sharedAthleticInfoComponent.form.valid && this.userData) {
      const oldValues = this.userData.secondarySportAthleticInfo
        ? this.userData.secondarySportAthleticInfo
        : {};
      const newValues = {
        ...oldValues,
        ...this.sharedAthleticInfoComponent.form.value,
      };
      this._auth.updateUserData(this.userData.id, {
        secondarySportAthleticInfo: newValues,
      });
      
      if (this.sport) {
        if ( Object.keys(this.sports[this.sport].stats).length) { 
          this._router.navigate(['/add-sport/stats']);
        } else {
          this._router.navigate(['/add-sport/offers']);
        }
      }
    } else {
      this.sharedAthleticInfoComponent.form.markAllAsTouched();
      this.sharedAthleticInfoComponent.feetControl.markAsTouched();
    }
  }

  private _setSport(sport: string) {
    const key = sport
      .split(' ')
      .filter((w) => w != 'mens' && w != 'womens' && w != '&')
      .join('_');
    return key;
  }
}
