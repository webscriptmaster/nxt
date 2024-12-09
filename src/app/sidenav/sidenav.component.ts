import { AuthService } from './../auth/auth.service';
import { SidenavService } from './sidenav.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  user$: Observable<User | null>;
  @Input() activePage: String | null = null;
  @Output() logout = new EventEmitter();
  @Output() home = new EventEmitter();
  @Output() profile = new EventEmitter();
  @Output() settings = new EventEmitter();
  @Output() editProfile = new EventEmitter();
  @Output() addOffers = new EventEmitter();
  @Output() addSport = new EventEmitter();
  @Output() setAppSport = new EventEmitter();
  @Output() referFriend = new EventEmitter();
  @Output() contactUs = new EventEmitter();

  showFollowMenu = false;

  constructor(public sidenav: SidenavService, private _auth: AuthService) {
    this.user$ = this._auth.user$;
  }

  ngOnInit() {}

  onProspectCenter() {}
  onHome() {
    this.home.emit(true);
    this.sidenav.closeSidenav();
  }

  onProfile() {
    this.profile.emit(true);
    this.sidenav.closeSidenav();
  }

  onSettings() {
    this.settings.emit(true);
    this.sidenav.closeSidenav();
  }

  onEditProfile() {
    this.editProfile.emit(true);
    this.sidenav.closeSidenav();
  }

  onAddOffers() {
    this.addOffers.emit(true);
    this.sidenav.closeSidenav();
  }

  onContactUs() {
    this.contactUs.emit(true);
    this.sidenav.closeSidenav();
  }

  async onLogout() {
    this.logout.emit(true);
    this.sidenav.closeSidenav();
  }

  async onSports() {
    this.addSport.emit(true);
    this.sidenav.closeSidenav();
  }

  async onRefer() {
    this.referFriend.emit(true);
    this.sidenav.closeSidenav();
  }

  onSetAppSport(value: string) {
    this.setAppSport.emit(value);
  }

  onPrivacy() {
    const url = `https://app.termly.io/document/privacy-policy/e603559c-9483-42d0-ab85-58249660e18a`;
    this.openLink(url);
  }

  onTerms() {
    const url = `https://app.termly.io/document/terms-of-use-for-saas/15feca2e-250a-4fea-bab4-f975aa666eca`;
    this.openLink(url);
  }

  openLink(url: string) {
    return new Promise((res, rej) => {
      if (!url) {
        rej(null);
      }
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
