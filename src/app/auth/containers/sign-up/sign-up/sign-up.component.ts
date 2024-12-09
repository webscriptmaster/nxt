import {Component, HostBinding, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';
import {AuthService} from 'src/app/auth/auth.service';
import {MessagingService} from 'src/app/shared/messaging.service';
import {SharedService} from 'src/app/shared/shared.service';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit, OnDestroy {
  @HostBinding('style.backgroundImage') backgroundImage: string;
  loading$ = new BehaviorSubject<boolean>(false);
  private _unsubscribeAll: Subject<void> = new Subject();
  firebaseErrorMessage = 'The email you inputted was already registered in the app.';
  partnerCode: string = '';
  constructor(
    private _auth: AuthService,
    private _router: Router,
    public dialog: MatDialog,
    private _messagingService: MessagingService,
    private sharedService: SharedService,
  ) {
  }

  ngOnInit() {
    this.sharedService.code$.subscribe((res: string) => {
      this.partnerCode = res?.toUpperCase();
    });
    this.setBackgroundImage();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setBackgroundImage();
  }

  setBackgroundImage() {
    const screenWidth = window.innerWidth;
    if (screenWidth > 768) {
      this.backgroundImage = 'url("../../../../../assets/images/sign-up/bg-mask-desktop.png")';
    } else {
      this.backgroundImage = 'url("../../../../../assets/images/sign-up/bg-mask.png")';
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async onCreateAccount(data: any) {
    this.loading$.next(true);
    try {
      const signUpResult = await this._auth.SignUp(data);
      if (
        signUpResult &&
        signUpResult.user &&
        signUpResult.user.uid &&
        signUpResult.user.email
      ) {
        await this._auth.createFbUser({
          uid: signUpResult.user.uid,
          email: signUpResult.user.email,
        });

        if (this.partnerCode) {
          await this._auth.updateUserData(signUpResult.user.uid, {
            partnerCode: this.partnerCode,
          });
        }

        this._auth.user$
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((res) => {
            if (res) {
              if (res.pushNotifications) {
                this._messagingService.requestPermission();
                this._messagingService.receiveMessage();
                if (
                  window.webkit &&
                  window.webkit.messageHandlers &&
                  window.webkit.messageHandlers['push-permission-request']
                ) {
                  window.webkit.messageHandlers[
                    'push-permission-request'
                    ].postMessage('push-permission-request');
                }
              }

              this._router.navigate(['/auth/welcome']);

              this._unsubscribeAll.next();
              this._unsubscribeAll.complete();
            }
          });
      }
      this.loading$.next(false);
    } catch (err: any) {
    }
  }
}
