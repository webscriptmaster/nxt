import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { User } from '../models/user';

@Component({
  selector: 'app-ai-bot',
  templateUrl: './ai-bot.component.html',
  styleUrls: ['./ai-bot.component.scss'],
})
export class AiBotComponent implements OnInit {
  user$: Observable<User | null>;
  user: User | null;
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isChatBotLoaded: boolean = false;
  _unsubscribeAll = new Subject<void>();
  constructor(private _router: Router, private _auth: AuthService) {
    this.user$ = this._auth.user$;
  }

  ngOnInit() {
    this.loading$.next(true);
    timer(1200).subscribe(() => {
      this.isChatBotLoaded = true;
    });
    timer(3000).subscribe(() => {
      this.loading$.next(false);
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
