import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/auth/auth.service';
import { SPORTS } from 'src/app/shared/const';
import { SportCell, SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-add-sport-choose-sport',
  templateUrl: './choose-sport.component.html',
  styleUrls: ['./choose-sport.component.scss'],
})
export class AddSportChooseSportComponent implements OnInit, OnDestroy {
  sports: any;
  sportsList: SportCell[] | null = null;
  selectedSport: string | null = null;
  firstSport: string | null = null;

  userData: User | null = null;

  _unsubscribeAll = new Subject<void>();

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
        this.sportsList = this._sportService.getOrderedSports(res);
      });
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData && this.userData.primarySport) {
        this.firstSport = this.userData.primarySport;
      }
      if (this.userData && this.userData.secondarySport) {
        this.selectedSport = this.userData.secondarySport;
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['home']);
  }

  async onContinue() {
    if (!this.selectedSport || !this.userData) {
      return;
    } else {
      await this._auth.updateUserData(this.userData.id, {
        secondarySport: this.selectedSport,
        secondarySportPositions:
          this.userData &&
          this.userData['secondarySport'] === this.selectedSport
            ? this.userData['secondarySportPositions']
              ? this.userData['secondarySportPositions']
              : []
            : [],
        secondarySportAthleticInfo:
          this.userData &&
          this.userData['secondarySport'] === this.selectedSport
            ? this.userData['secondarySportAthleticInfo']
              ? this.userData['secondarySportAthleticInfo']
              : {}
            : {},
        secondarySportStats:
          this.userData &&
          this.userData['secondarySport'] === this.selectedSport
            ? this.userData['secondarySportStats']
              ? this.userData['secondarySportStats']
              : {}
            : {},
      });

      if (
        this.selectedSport &&
        this.sports[this.selectedSport]['positions'] &&
        this.sports[this.selectedSport]['positions'].length == 1
      ) {
        await this._auth.updateUserData(this.userData.id, {
          secondarySportPositions:
            this.sports[this.selectedSport]['positions'],
        });
        this._router.navigate(['/add-sport/general']);
      } else {
        this._router.navigate(['/add-sport/positions']);
      }
    }
  }

  sportName(index: number, sport: SportCell | null) {
    return sport?.name;
  }

  onSelectSport(sport: string) {
    if (sport && this.userData && sport !== this.firstSport) {
      this.selectedSport = sport.trim();
    }
  }
}
