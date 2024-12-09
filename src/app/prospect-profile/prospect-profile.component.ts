import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, filter, of, switchMap, takeUntil } from 'rxjs';
import { User } from '../models/user';
import { SharedService } from '../shared/shared.service';

@Component({
  selector: 'app-prospect-profile',
  templateUrl: './prospect-profile.component.html',
  styleUrls: ['./prospect-profile.component.scss'],
})
export class ProspectProfileComponent implements OnInit {
  user$: Observable<User | null>;
  user: User;
  guideLink: string;
  activeTab = '0';
  _unsubscribeAll: Subject<void> = new Subject();
  showComingSoon = false;
  listTab: any[] = [];

  constructor(
    private _router: Router,
    private _auth: AuthService,
    private route: ActivatedRoute,
    private _sharedService: SharedService
  ) {
    this.user$ = this._auth.user$;
    this.route.data.subscribe((data) => {
      this.activeTab = data['activeTab'].toString();
    });
  }

  ngOnInit(): void {
    this._auth.user$
      .pipe(
        takeUntil(this._unsubscribeAll),
        switchMap((user: any) => {
          this.user = user;
          return of(this.user);
        })
      )
      .subscribe();
  }

  changeTab(tabIndex: string) {
    switch (tabIndex) {
      case '0':
        this._router.navigate(['/media-pro/profiles-pro']);
        break;
      case '1':
        this._router.navigate(['/media-pro/mixtapes-pro']);
        break;
      case '2':
        this._router.navigate(['/media-pro/graphics-pro']);
        this._sharedService.setViewingTemplates(null);
        break;
      case '3':
        this._router.navigate(['/media-pro/media']);
        break;
      case '4':
      default:
        break;
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

  async onBack() {
    this._router.navigate(['home']);
  }

  onHelp(url: string) {
    if (!url.includes('https')) {
      url = 'https://' + url;
    }
    this.openLink(url);
  }

  onDataChange(data: string) {
    this.guideLink = data;
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
