import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-up-templates',
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.scss'],
})
export class SignUpTemplatesPageComponent implements OnInit {
  constructor(private _router: Router) {}

  ngOnInit() {}

  onBack() {
    this._router.navigate(['/auth/prospect-sheet']);
  }

  onGeneralTemplate() {
    this._router.navigate(['/auth/general-template']);
  }
  onPersonalTemplate() {
    this._router.navigate(['/auth/personal-template']);
  }
  onOwnTemplate() {
    this._router.navigate(['/auth/own-template']);
  }
  onSocialTemplate() {
    this._router.navigate(['/auth/social-template']);
  }

  onContinue() {
    this._router.navigate(['/auth/how-it-works']);
  }

  onHelp() {
    const url = `https://nxt1sports.com/faqs?block=3`;
    this.openLink(url);
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
