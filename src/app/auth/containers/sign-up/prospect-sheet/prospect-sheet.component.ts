import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-sign-up-prospect-sheet',
  templateUrl: './prospect-sheet.component.html',
  styleUrls: ['./prospect-sheet.component.scss'],
})
export class SignUpProspectSheetComponent implements OnInit, OnDestroy {
  userData: User | null = null;
  _unsubscribeAll = new Subject<void>();

  constructor(private _router: Router, private _auth: AuthService) {}

  ngOnInit() {
    this._auth.user$.pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
      this.userData = res;
    });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    this._router.navigate(['/auth/complete']);
  }

  onHelp() {
    const url = `https://nxt1sports.com/faqs?block=2`;
    this.openLink(url)
  }

  onTemplates() {
    this._router.navigate(['/auth/templates']);
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
