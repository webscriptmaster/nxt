import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Observable, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { User } from 'src/app/models/user';
import { MessagingService } from 'src/app/shared/messaging.service';
import packageJson from '../../../../../package.json';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { SettingsService } from '../../settings.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { deleteField } from 'firebase/firestore';
import { CreateEmailService } from 'src/app/create-email/create-email.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ProviderDialogComponent } from 'src/app/create-email/dialogs/provider-dialog/provider-dialog.component';
interface SettingsVideo {
  title: String;
  url: String;
  thumbnail: String;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  videos: SettingsVideo[] = [];

  activeVideoIndex = 0;
  user$: Observable<User | null>;
  appVersion = packageJson.version;
  productionMode: boolean = environment.production;
  _unsubscribeAll: Subject<void> = new Subject();
  labelProvider = '';
  userData: any;
  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _messagingService: MessagingService,
    private _fns: AngularFireFunctions,
    private _settings: SettingsService,
    private _matDialog: MatDialog,
    private _createEmailService: CreateEmailService,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.user$ = this._auth.user$;
    this._auth.user$.subscribe((res) => {
      this.userData = res;
      if (
        this.userData &&
        !this.userData.connectedGmailToken &&
        !this.userData.connectedMicrosoftToken
      ) {
        this.labelProvider = 'Connect Provider';
      } else {
        this.labelProvider = 'Disconnect Provider';
      }
    });
    this._settings
      .getSettingsVideos()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        if (res) {
          const baseVideoUrl = `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/Videos%2F`;
          const baseThumbnailsUrl = `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/Thumbnails%2F`;

          this.videos = res.videos.reduce(
            (acc: SettingsVideo[], val: string, index: number) => {
              const video: SettingsVideo = {
                url: `${baseVideoUrl}${val}?alt=media&time=${Date.now()}`,
                thumbnail: `${baseThumbnailsUrl}${
                  res.thumbnails[index]
                }?alt=media&time=${Date.now()}`,
                title: res.titles[index],
              };
              return [...acc, video];
            },
            []
          );
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  openLink(url: any) {
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

  onAccountInfo() {
    this._router.navigate(['settings/account-info']);
  }

  onRecruitingProcess() {
    // this._router.navigate(['settings/recruiting-process']);
    const url = `https://nxt1sports.com/faqs`;
    this.openLink(url);
  }

  onContactUs() {
    this._router.navigate(['settings/contact-us']);
  }

  onMyRefferals() {
    this._router.navigate(['/my-referrals']);
  }

  onFaq() {
    this._router.navigate(['settings/faq']);
  }

  onBack() {
    this._router.navigate(['/home']);
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

  async onConnectProvider() {
    if (
      this.userData &&
      !this.userData.connectedGmailToken &&
      !this.userData.connectedMicrosoftToken
    ) {
      this.connect();
      return;
    }
    this.disconnect();
  }

  async connect() {
    this.connectEmailFlow();
  }

  async disconnect() {
    const dialogRef = this._matDialog.open(ConfirmDialogComponent, {
      disableClose: true,
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result) {
      if (this.userData) {
        await this._auth.updateUserData(this.userData.id, {
          connectedEmail: deleteField(),
          connectedGmailToken: deleteField(),
          connectedMicrosoftToken: deleteField(),
        });
        this.labelProvider = 'Connect Provider';
      }
    }
  }

  async connectEmailFlow() {
    const user = (await this._waitUser()) as User;
    if (!user.connectedGmailToken && !user.connectedMicrosoftToken) {
      const provider = await this.openProviderDialog();
      const url = await this._createEmailService.getConnectURL(
        user.id,
        provider
      );
      return this._openLink(url!);
    } else {
      localStorage.removeItem('contacts');
      return null;
    }
  }

  openProviderDialog(): Promise<any> {
    const dialogRef = this._matDialog.open(ProviderDialogComponent, {
      disableClose: false,
    });

    return firstValueFrom(dialogRef.afterClosed());
  }

  private _openLink(url: string | null) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (url) {
          const link = document.createElement('a');
          link.target = '_blank';
          link.href = url;
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

  private _waitUser() {
    return new Promise((res, rej) => {
      const waitUserInterval = setInterval(() => {
        if (this.userData) {
          clearInterval(waitUserInterval);
          res(this.userData);
        }
      }, 100);
    });
  }

  async onToggleNotifications(e: boolean) {
    const user = await firstValueFrom(this.user$);
    if (user) {
      if (e) {
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
        this._auth.updateUserData(user.id, { pushNotifications: true });
      } else {
        this._fns
          .httpsCallable('unsubscribeFromTopic')({
            topic: 'global',
            token: user.fcmToken,
          })
          .subscribe();
        this._auth.updateUserData(user.id, {
          fcmToken: null,
          pushNotifications: false,
        });
      }
    }
  }

  async onToggleActivityTracking(e: boolean) {
    this._auth.updateUserData(this.userData.id, {
      activityTracking: e,
    });
  }
}
