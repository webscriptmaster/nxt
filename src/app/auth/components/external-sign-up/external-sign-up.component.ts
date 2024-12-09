import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  browserLocalPersistence,
  fetchSignInMethodsForEmail,
  getRedirectResult,
  GoogleAuthProvider,
  OAuthProvider,
  setPersistence,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  getAuth,
  browserSessionPersistence,
} from 'firebase/auth';

import { NavigationEnd, Router } from '@angular/router';
import { SocialLoginService } from '../../../shared/social-login.service';
import { SharedService } from '../../../shared/shared.service';
import { AuthService } from '../../auth.service';
import { MessagingService } from '../../../shared/messaging.service';
import { MatDialog } from '@angular/material/dialog';
import {
  catchError,
  filter,
  from,
  mergeMap,
  Observable,
  of,
  Subject,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { UpcomingComponent } from '../../containers';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-external-sign-up',
  templateUrl: './external-sign-up.component.html',
  styleUrls: ['./external-sign-up.component.scss'],
})
export class ExternalSignUpComponent implements OnInit, OnDestroy {
  @Input()
  public firebaseErrorMessage = '';

  shouldShowError = false;
  partnerCode: string = '';
  private _unsubscribeAll: Subject<void> = new Subject();
  isMobile: boolean = false;
  constructor(
    private _router: Router,
    private socialService: SocialLoginService,
    private sharedService: SharedService,
    private _auth: AuthService,
    private _messagingService: MessagingService,
    public dialog: MatDialog,
    private breakePoint: BreakpointObserver
  ) {}

  ngOnInit() {
    const auth = getAuth();
    this.sharedService.code$.subscribe((res: string) => {
      this.partnerCode = res?.toUpperCase();
    });
    this.breakePoint
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe((result) => {
        this.isMobile = result.matches;
      });
    getRedirectResult(auth)
      .then((result) => {
        console.log('Redirect result:', result);
        if (result) {
          this.hookUserObservable().subscribe();
        }
      })
      .catch((error) => {
        if (error.message.indexOf('ALREADY_EXISTS') !== -1) {
          this.shouldShowError = true;
        } else {
          console.error('Error during getRedirectResult:', error);
        }
      });
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
    provider.addScope('https://www.googleapis.com/auth/userinfo.email');
    provider.setCustomParameters({
      access_type: 'offline',
      prompt: 'consent',
    });
    this.shouldShowError = false;
    const auth = getAuth();
    if (this.isMobile) {
      setPersistence(auth, browserSessionPersistence)
        .then(() => {
          console.log('Starting sign-in with redirect');
          return signInWithRedirect(auth, provider);
        })
        .catch((error) => {
          console.error('Error setting persistence:', error);
        });
      return;

      from(signInWithRedirect(auth, provider)).subscribe((res) => {
        console.log(res);
      });
      return;
    }

    from(signInWithPopup(auth, provider))
      .pipe(
        mergeMap((_) => {
          this.socialService.setSignUpdata(_);
          return this.hookUserObservable();
        }),
        catchError((err: any) => {
          if (err.message.indexOf('ALREADY_EXISTS') !== -1) {
            this.shouldShowError = true;
          } else if (err.code === 'auth/popup-closed-by-user') {
            console.warn('Popup closed before completing sign-in');
          } else if (err.code === 'auth/cancelled-popup-request') {
            console.warn('Cancelled due to another popup already open.');
          } else {
            console.error('Unexpected error during Google sign-in:', err);
          }
          return of(null);
        })
      )
      .subscribe();
  }

  loginWithMicrosoft() {
    const provider = new OAuthProvider('microsoft.com');
    provider.addScope('Mail.Send');
    provider.addScope('email');
    provider.addScope('User.Read');
    provider.addScope('offline_access');
    provider.setCustomParameters({
      prompt: 'consent',
    });
    this.shouldShowError = false;
    from(signInWithPopup(getAuth(), provider))
      .pipe(
        mergeMap((_) => {
          this.socialService.setSignUpdata(_);
          return this.hookUserObservable();
        }),
        catchError((err: any) => {
          if (err.message.indexOf('ALREADY_EXISTS') !== -1) {
            this.shouldShowError = true;
          }
          return of(null);
        })
      )
      .subscribe();
  }

  async loginWithApple() {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    provider.setCustomParameters({
      locale: 'en',
    });

    this.shouldShowError = false;

    from(signInWithPopup(getAuth(), provider))
      .pipe(
        mergeMap((_) => {
          this.socialService.setSignUpdata(_);
          return this.hookUserObservable();
        }),
        catchError((err: any) => {
          if (err.message.indexOf('ALREADY_EXISTS') !== -1) {
            this.shouldShowError = true;
          }
          console.error('Apple Sign In Error:', err);
          return of(null);
        })
      )
      .subscribe();
  }

  private hookUserObservable(): Observable<any> {
    this.socialService.data$.subscribe((data) => {
      const { uid, providerData } = data.user;
      const email = providerData[0].email;

      this._auth
        .userExists(uid)
        .pipe(take(1), takeUntil(this._unsubscribeAll))
        .subscribe((exists) => {
          if (!exists) {
            this._auth.createFbUser({ uid, email });
          }

          const updateUserToken = (providerId: string, token: string) => {
            this._auth.updateUserData(uid, {
              connectedEmail: email,
              ...(token && { connectedToken: token }),
            });
          };

          if (
            data.providerId === 'google.com' ||
            data.providerId === 'microsoft.com' ||
            data.providerId === 'apple.com'
          ) {
            updateUserToken(
              data.providerId,
              data._tokenResponse.oauthAccessToken
            );
          }
        });
    });

    return this._auth.user$.pipe(
      filter(Boolean),
      takeUntil(this._unsubscribeAll),
      tap((user) => {
        if (user.pushNotifications) {
          this._messagingService.requestPermission();
          this._messagingService.receiveMessage();
          if (window.webkit?.messageHandlers?.['push-permission-request']) {
            window.webkit.messageHandlers[
              'push-permission-request'
            ].postMessage('push-permission-request');
          }
        }

        if (!user.completeSignUp) {
          this._router.navigate(['/auth/welcome']);
        } else {
          this._router.navigate(['/home']);
        }
      })
    );
  }

  openDialog(data: {
    icon: string;
    iconSize: number;
    title: string;
    description: string;
  }) {
    return this.dialog.open(UpcomingComponent, {
      data,
    });
  }

  private isInApp() {
    const userAgent = window.navigator.userAgent.toLowerCase();
    console.log(userAgent);

    const isWebView =
      /webview|iphone|ipad|ipod/.test(userAgent) && !/safari/.test(userAgent);
    return isWebView;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
