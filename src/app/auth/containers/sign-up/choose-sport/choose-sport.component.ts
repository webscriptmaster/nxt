import { AuthService } from './../../../auth.service';
import { SPORTS } from './../../../../shared/const';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { firstValueFrom, lastValueFrom, Subject, take, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { SportCell, SportService } from 'src/app/shared/sport.service';



@Component({
  selector: 'app-sign-up-choose-sport',
  templateUrl: './choose-sport.component.html',
  styleUrls: ['./choose-sport.component.scss'],
})
export class SignUpChooseSportComponent implements OnInit, OnDestroy {
  sports: any;
  sportsList:  SportCell[] | null = null;
  selectedSport: string | null = null;

  userData: User | null = null;

  _unsubscribeAll = new Subject<void>();

  constructor(private _router: Router, private _auth: AuthService, private _sportService: SportService) {}

  async ngOnInit() {
    this._sportService.getSportsSettings$().pipe(takeUntil(this._unsubscribeAll)).subscribe(res=> {
      this.sports = res;
      this.sportsList = this._sportService.getOrderedSports(res);
    })
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData && this.userData.primarySport) {
        this.selectedSport = this.userData.primarySport;
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/auth/general']);
  }

  async onContinue() {
    if (!this.selectedSport || !this.userData) {
      return;
    } else {
      await this._auth.updateUserData(this.userData.id, {
        primarySport: this.selectedSport,
        primarySportPositions:
          this.userData && this.userData['primarySport'] === this.selectedSport
            ? this.userData['primarySportPositions']
              ? this.userData['primarySportPositions']
              : []
            : [],
        primarySportAthleticInfo:
          this.userData && this.userData['primarySport'] === this.selectedSport
            ? this.userData['primarySportAthleticInfo']
              ? this.userData['primarySportAthleticInfo']
              : {}
            : {},
        primarySportStats:
          this.userData && this.userData['primarySport'] === this.selectedSport
            ? this.userData['primarySportStats']
              ? this.userData['primarySportStats']
              : {}
            : {},
      });



      if (this.selectedSport && this.sports[this.selectedSport]['positions'] && this.sports[this.selectedSport]['positions'].length == 1) {
        await this._auth.updateUserData(this.userData.id, {
          primarySportPositions: this.sports[this.selectedSport]['positions']
        })
        this._router.navigate(['/auth/contact-information']);
      } else {
        this._router.navigate(['/auth/choose-position']);
      }
    }
  }

  sportName(index: number, sport: SportCell | null) {
    return sport?.name;
  }

  onSelectSport(sport: string) {
    if (sport && this.userData) {
      this.selectedSport = sport.trim();
    }
  }
}
