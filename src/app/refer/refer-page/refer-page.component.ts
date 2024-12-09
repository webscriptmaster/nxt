import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-refer-page',
  templateUrl: './refer-page.component.html',
  styleUrls: ['./refer-page.component.scss'],
})
export class ReferPageComponent implements OnInit, OnDestroy {
  showShare = false;
  _unsubscribeAll: Subject<void> = new Subject();
  shareUrl: string;
  shareDescription: string;
  shareTitle: string;
  canRefer = true;
  haveSubscription = false;

  constructor(private _router: Router, private _auth: AuthService) {
    this._auth.user$
      .pipe(
        filter((user) => user !== null),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(async (user: any) => {
        this.shareUrl = `https://nxt1sports.com?referral=${user.id}`;
        this.shareTitle = `${user.email} invited you to NXT 1!`;
        this.shareDescription = `Click the link & sign up for NXT 1 to activate my discount.`;

        if (user.createdAt) {
          const referralExpire = user.createdAt.toDate();
          referralExpire.setFullYear(referralExpire.getFullYear() + 1);
          if (referralExpire.getTime() < Date.now()) {
            this.canRefer = false;
          }
        }
        if (user.payment) {
          this.haveSubscription = true;
        }
      });
  }

  options: AnimationOptions = {
    path: '/assets/images/animations/refer.json',
    loop: true,
  };

  ngOnInit() {}

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/home']);
  }

  onHideShare() {
    if (this.showShare) {
      this.showShare = false;
    }
  }

  onInvite(e: Event) {
    if (navigator['share'] && window.innerWidth < 1280) {
      navigator.share({
        title: this.shareTitle,
        url: this.shareUrl,
        text: this.shareDescription,
      });
    } else {
      this.showShare = true;
      e.stopPropagation();
    }
   

  }

  async onLogout(event: boolean) {
    await this._auth.SignOut();
    this._router.navigate(['/']);
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

  onEditProfile(event: boolean) {
    this._router.navigate(['/edit-profile']);
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

  onMyReferrals() {
    this._router.navigate(['/my-referrals']);
  }

  copy(url: string) {
    navigator.clipboard.writeText(url);
  }
}