import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MessagingService } from 'src/app/shared/messaging.service';

@Component({
  selector: 'app-sign-up-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class SignUpNotificationsComponent implements OnInit {
  options: AnimationOptions = {
    path: '/assets/images/animations/notifications.json',
  };

  _unsubscribeAll = new Subject<void>();

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _messagingService: MessagingService
  ) {}

  ngOnInit() {}

  onTurnOn() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((user) => {
      if (user) {
        this._messagingService.requestPermission();
        this._messagingService.receiveMessage();
        if (
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers['push-permission-request']
        ) {
          window.webkit.messageHandlers['push-permission-request'].postMessage(
            'push-permission-request'
          );
        }
        this._auth.updateUserData(user.id, {
          pushNotifications: true,
          completeSignUp: true,
          appSport: 'primary',
        });
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        if (user?.appSport === 'primary') {
          this._router.navigate(['/home']);
        } else {
          this._auth.updateUserData(user.id, {
            completeAddSport: true,
          });
          this._router.navigate(['/home']);
        }
      }
    });
  }

  onSkip() {
    this._router.navigate(['/home']);
  }
}
