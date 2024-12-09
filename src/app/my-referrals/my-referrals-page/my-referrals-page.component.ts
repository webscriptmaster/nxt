import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { PaymentService } from 'src/app/shared/payment.service';

@Component({
  selector: 'app-my-referrals-page',
  templateUrl: './my-referrals-page.component.html',
  styleUrls: ['./my-referrals-page.component.scss'],
})
export class MyReferralsPageComponent implements OnInit, OnDestroy {
  _unsubscribeAll: Subject<void> = new Subject();

  canRefer = true;
  canUpdate = false;
  referrals: any = [];
  userId: string;
  alreadyUsed = false;

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _payment: PaymentService
  ) {
    this._auth.user$
      .pipe(
        filter((user) => user !== null),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(async (user: any) => {
        this.userId = user.id;
        this.alreadyUsed = user.usedReferralSystem
          ? user.usedReferralSystem
          : false;

        this.referrals = user.referrals
          ? user.referrals
              .sort((a: any, b: any) => a.date.toMillis() - b.date.toMillis())
              .map((referral: any, index: number) => {
                const discountEnd = referral.date.toDate();
                discountEnd.setFullYear(
                  discountEnd.getFullYear() + (index + 1)
                );

                return {
                  discount: `-$30`,
                  discountEnd: discountEnd.getFullYear(),
                  status: referral.status,
                };
              })
          : [];

        if (user.createdAt) {
          const referralExpire = user.createdAt.toDate();
          referralExpire.setFullYear(referralExpire.getFullYear() + 1);
          if (referralExpire.getTime() < Date.now()) {
            this.canRefer = false;
         
          }

          const now: any = new Date();
          const remainDays = Math.round(
            Math.abs((now - referralExpire) / (24 * 60 * 60 * 1000))
          );
          if (remainDays <= 20 && this.referrals.length) {
            this.canUpdate = true;
          }
        }
      });
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    history.back();
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

  onContactUs() {
    this._router.navigate(['settings/contact-us']);
  }


  onUpdatePlan() {
    if (this.canUpdate && !this.alreadyUsed) {
      this._payment.onStripeUpdatePlan(this.userId).subscribe();
    }
  }
}
