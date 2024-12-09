
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { Subject, takeUntil } from 'rxjs';
import { SportService } from 'src/app/shared/sport.service';

@Component({
  selector: 'app-add-sport-choose-position',
  templateUrl: './choose-position.component.html',
  styleUrls: ['./choose-position.component.scss'],
})
export class AddSportChoosePositionComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  sports: any;
  positions: string[] = [];
  selectedPositions: { [key: string]: boolean } = {};

  _unsubscribeAll = new Subject<void>();

  constructor(private _router: Router, private _auth: AuthService, private _sportService: SportService) {}

  async ngOnInit() {
    this._sportService.getSportsSettings$().pipe(takeUntil(this._unsubscribeAll)).subscribe(res=> {
      this.sports = res;
    })
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
      if (this.userData && this.userData.secondarySport) {
        this.positions = this.sports[this.userData.secondarySport]['positions'];
        if (this.userData.secondarySportPositions) {
          this.selectedPositions = this.userData.secondarySportPositions.reduce(
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
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/add-sport/choose-sport']);
  }

  async onContinue() {
    const selectedPositions = Object.keys(this.selectedPositions).filter(
      (pos) => this.selectedPositions[pos]
    );
    if (
      selectedPositions.length > 0 &&
      selectedPositions.length <= 3 &&
      this.userData
    ) {
      await this._auth.updateUserData(this.userData.id, {
        secondarySportPositions: selectedPositions,
      });

      this._router.navigate(['/add-sport/general']);
    }
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
}
