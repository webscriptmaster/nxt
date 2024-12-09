import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, switchMap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ProspectProfile, Profile } from 'src/app/models/prospect';
import { User } from 'src/app/models/user';
@Component({
  selector: 'app-prospect-card',
  templateUrl: './prospect-card.component.html',
  styleUrls: ['./prospect-card.component.scss'],
})
export class ProspectCardComponent {
  @Input() isViewAll;
  @Input() listProfile;
  @Output() viewAllFn = new EventEmitter<string>();
  private userId: string = '';
  public user: User;
  public isLiveProfile;

  constructor(private _router: Router, private _auth: AuthService) {
    this._auth.user$
      .pipe(
        switchMap((user: any) => {
          this.user = user;
          this.userId = user?.id;
          if (this.user && this.user.ownProfiles?.length > 0) {
            this.isLiveProfile = this.user.ownProfiles.find(
              (item) => item.isLive
            );
          }
          return EMPTY;
        })
      )
      .subscribe();
  }

  viewAll(index: any): void {
    this.viewAllFn.emit(index);
    this.isViewAll = true;
  }

  goBack() {
    this.isViewAll = false;
    this.viewAllFn.emit('-1');
  }

  viewDetail(prospectProfile: ProspectProfile, card: Profile): void {
    this._router.navigate([
      `media-pro/profiles-pro/${this.userId}/${prospectProfile.documentId}/${card.id}`,
    ]);
  }
}
