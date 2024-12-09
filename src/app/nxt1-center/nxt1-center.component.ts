import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Nxt1CenterService } from '../shared/nxt1-center.service';
import { SettingsService } from '../settings/settings.service';
import { User } from '../models/user';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

interface SettingsVideo {
  title: String;
  url: String;
  thumbnail: String;
}

@Component({
  selector: 'app-nxt1-center',
  templateUrl: './nxt1-center.component.html',
  styleUrls: ['./nxt1-center.component.scss'],
})
export class Nxt1CenterComponent implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  user: User;
  userSport: any;
  sports: any;
  nxt1Center: any[] = [];
  videos: SettingsVideo[] = [];
  activeVideoIndex = 0;
  _unsubscribeALL: Subject<void> = new Subject();

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private _nxt1CenterService: Nxt1CenterService,
    private _settings: SettingsService
  ) {
    this.user$ = this._auth.user$;
  }

  ngOnInit() {
    this._nxt1CenterService
      .getAllNxt1Center()
      .pipe(takeUntil(this._unsubscribeALL))
      .subscribe((res) => {
        this.nxt1Center = res;
      });

    this._settings
      .getSettingsVideos()
      .pipe(takeUntil(this._unsubscribeALL))
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
                title: null,
                // res.titles[index]
              };
              return [...acc, video];
            },
            []
          );
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeALL.next();
    this._unsubscribeALL.complete();
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

  async onBack() {
    this._router.navigate(['home']);
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
}
function sort(arg0: (a: any, b: any) => number) {
  throw new Error('Function not implemented.');
}
