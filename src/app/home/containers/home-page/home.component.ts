import { SidenavService } from './../../../sidenav/sidenav.service';
import { AuthService } from './../../../auth/auth.service';
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subject, Observable, filter, takeUntil, firstValueFrom } from 'rxjs';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';
import { openLink } from 'src/app/shared/utils';
import { PLANS } from 'src/app/shared/const';
import { MatDialog } from '@angular/material/dialog';
import { PaymentDialogComponent } from 'src/app/shared/dialogs/payment-dialog/payment-dialog.component';
import { PurchaseDialogComponent } from 'src/app/shared/dialogs/purchase-dialog/purchase-dialog.component';
import { MediaPreviewComponent } from 'src/app/shared/dialogs/media-preview/media-preview.component';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  user$: Observable<User | null>;
  showTrial = false;
  private _unsubscribeAll: Subject<void> = new Subject();
  user: User | undefined | null;
  showUpgradeButton = false;
  activeTab: number;
  isRecruit: boolean;

  mediaUrls: string[] = [
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fspotlight-graphic-1.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2FStat%20Card.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fspotlight-graphic-3.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fspotlight-graphic-2.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fspotlight-graphic-5.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fgraphic-home-2.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fgraphic-home-3-66da07724f796.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fspotlight-graphic-66e35ac637a54.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fgraphic-home-4-66da07db2ea61.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fprospect-card-01.png?alt=media',
    'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/HomePageMedia%2Fspotlight-graphic-4.png?alt=media',
  ];

  constructor(
    private _auth: AuthService,
    public sidenav: SidenavService,
    private _router: Router,
    private _matDialog: MatDialog,
    private _sharedService: SharedService
  ) {
    this.user$ = this._auth.user$;
    this._auth.user$
      .pipe(
        filter((user) => user !== null),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((user: User | null) => {
        this.user = user;
        if (user) {
          if (this.user) {
            if (
              this.user.lastActivatedPlan === PLANS.TRIAL ||
              (this.user.lastActivatedPlan !== PLANS.SUBSCRIPTION &&
                this.user.credits === 0)
            ) {
              this.showUpgradeButton = true;
            } else if (
              this.user.lastActivatedPlan !== PLANS.SUBSCRIPTION ||
              this.user.credits !== 0
            ) {
              this.showUpgradeButton = false;
            } else {
              this.showUpgradeButton = true;
            }
            if (this.user.lastActivatedPlan === PLANS.SUBSCRIPTION) {
              this.showUpgradeButton = false;
            }

            this._sharedService
              .getUnicodes()
              .subscribe((res: { id: string; codes: string[] }) => {
                const exsistCode = res[0].codes ?? [];
                if (!this.user.unicode) {
                  let randomCode = this.generateUniqueUnicode();
                  while (exsistCode.includes(randomCode)) {
                    randomCode = this.generateUniqueUnicode();
                  }
                  exsistCode.push(randomCode);
                  this._auth.updateUserData(this.user.id, {
                    unicode: randomCode,
                  });
                  this._sharedService.updateUnicode(res[0].id, {
                    codes: exsistCode,
                  });
                }
                if (
                  this.user.unicode &&
                  !exsistCode.includes(this.user.unicode)
                ) {
                  exsistCode.push(this.user.unicode);
                  this._sharedService.updateUnicode(res[0].id, {
                    codes: exsistCode,
                  });
                }
              });
          } else {
            this.showUpgradeButton = false;
          }
          if (!user.completeSignUp) {
            this._router.navigate(['/auth/welcome']);
            return;
          }
          if (
            user.lastActivatedPlan === PLANS.TRIAL &&
            !user.showedTrialMessage
          ) {
            setTimeout(() => {
              this.showTrial = true;
            }, 250);
          }
        }
      });
  }

  ngOnInit() {}

  ngAfterViewInit(): void {
    this.populateMediaWrapper();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  generateUniqueUnicode(): string {
    let randomNum = Math.floor(Math.random() * 100000000);
    return randomNum.toString().padStart(8, '0');
  }

  activeTabChange(event: any) {
    this.activeTab = event;
  }

  openLink(url: string) {
    window.open(url, '_blank');
  }

  onCollegeLibrary() {
    this._router.navigate(['/college-library']);
  }

  onLiveProfile() {
    this._router.navigate([`/prospect-profile/${this.user.id}`]);
  }

  onSportEffects() {
    if (this.user.isRecruit) {
      this._router.navigate(['/media-pro/profiles-pro']);
      return;
    }
    this._router.navigate(['/media-pro/graphics-pro']);
  }
  onMyQRCode() {
    this._router.navigate(['/my-qrcode']);
  }

  onRecruitingInfo() {
    this._router.navigate(['/recruiting-info']);
  }

  onNXT1Center() {
    this._router.navigate(['/nxt1-center']);
  }

  onEmailAutomate() {
    this._router.navigate(['/email-automation']);
  }

  onTemplates() {
    this._router.navigate(['/edit-profile/templates']);
  }
  onAIBot() {
    this._router.navigate(['/ai-bot']);
  }

  onContactUs(event: boolean) {
    this._router.navigate(['settings/contact-us']);
  }

  onCommitted(event: any) {}

  async onProspectSheet() {
    const userId = (await firstValueFrom(this.user$))?.id;
    this._router.navigate(['/prospect-sheet', userId], {
      queryParams: {
        own: true,
      },
    });
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

  onAddSport() {
    this._router.navigate(['/add-sport']);
  }

  onReferFriend(event: boolean) {
    this._router.navigate(['/refer']);
  }

  async onSetAppSport(type: string) {
    const userId = (await firstValueFrom(this.user$))?.id as string;
    this._auth.updateUserData(userId, { appSport: type });
  }

  onCredits(credits: number | undefined) {
    setTimeout(() => {
      const paymentDialog = this._matDialog.open(PurchaseDialogComponent, {
        autoFocus: false,
        data: {
          user: this.user,
        },
      });
    }, 1000);
  }

  populateMediaWrapper(): void {
    const mediaWrapper = document.querySelector(
      '.media-wrapper'
    ) as HTMLDivElement;

    if (mediaWrapper) {
      this.mediaUrls.forEach((url: string) => {
        const mediaItem = document.createElement('div');
        mediaItem.classList.add('media-item');

        // Determine the type of media based on URL or file extension
        const mediaElement = document.createElement(
          url.endsWith('.mp4') ? 'video' : 'img'
        );

        mediaElement.src = url;
        if (mediaElement instanceof HTMLVideoElement) {
          mediaElement.controls = true;
        }
        mediaElement.width = 150;
        mediaElement.height = 150;

        mediaItem.appendChild(mediaElement);
        mediaWrapper.appendChild(mediaItem);

        // Add click event listener to open media preview dialog
        mediaItem.addEventListener('click', () => {
          this._matDialog.open(MediaPreviewComponent, {
            data: {
              preview: { type: url.endsWith('.mp4') ? 'video' : 'image', url },
            },
            autoFocus: false,
          });
        });
      });
    } else {
      console.error('Media wrapper element not found.');
    }
  }

  onBeta(url: string) {
    if (!url.includes('https')) {
      url = 'https://' + url;
    }
    this.openLink2(url);
  }

  openLink2(url: any) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (url) {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          link.remove();
          res(url);
        } else {
          res(null);
        }
      }, 0);
    });
  }
}
