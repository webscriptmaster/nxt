import { Component, HostBinding, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MessagingService } from 'src/app/shared/messaging.service';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnDestroy {
  errors: any = {};
  showResetPasswordMessage = false;
  showForm: boolean = false;
  @HostBinding('style.backgroundImage') backgroundImage: string;
  private _unsubscribeAll: Subject<void> = new Subject();

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _messagingService: MessagingService
  ) {
    this._auth.resetPasswordEmailSended$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        this.showResetPasswordMessage = res;
        if (res) {
          if (window.innerWidth < 1280) {
            setTimeout(() => {
              this._auth.resetPasswordEmailSended$.next(false);
            }, 5000);
          }
        }
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
      this.backgroundImage =
        'url("../../../../../assets/images/sign-up/bg-mask-desktop.png")';
    } else {
      this.backgroundImage =
        'url("../../../../../assets/images/sign-up/bg-mask.png")';
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onSignUp() {
    this._router.navigate(['auth/sign-up']);
  }

  onLoginHelp() {
    this._router.navigate(['auth/login-help']);
  }

  onShowForm(data: boolean) {
    this.showForm = data;
  }

  showEmaiForm() {
    this.showForm = !this.showForm;
  }

  async onSignIn({ email, password }: { email: string; password: string }) {
    try {
      this.errors = {};
      const result = await this._auth.SignIn({ email, password });
      if (result && result.user) {
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

              if (res.completeSignUp) {
                this._router.navigate(['/home']);
              } else {
                this._router.navigate(['/auth/welcome']);
              }

              this._unsubscribeAll.next();
              this._unsubscribeAll.complete();
            }
          });
      }
    } catch (err: any) {
      this.errors[err.code as keyof typeof this.errors] = true;
      console.log(err.code);
    }
  }

  // onPayment(userId: string) {
  //   openLink(
  //     `https://nxt1sports.com/landing/pricing?step=2&time=${Date.now()}&user=${userId}`
  //   );
  // }
}
