import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-sport-templates',
  templateUrl: './templates-page.component.html',
  styleUrls: ['./templates-page.component.scss'],
})
export class AddSportTemplatesPageComponent implements OnInit {
  constructor(private _router: Router) {}

  ngOnInit() {}

  onBack() {
    this._router.navigate(['/add-sport/prospect-sheet']);
  }

  onGeneralTemplate() {
    this._router.navigate(['/add-sport/general-template']);
  }
  onPersonalTemplate() {
    this._router.navigate(['/add-sport/personal-template']);
  }
  onOwnTemplate() {
    this._router.navigate(['/add-sport/own-template']);
  }
  onSocialTemplate() {
    this._router.navigate(['/add-sport/social-template']);
  }

  onContinue() {
    this._router.navigate(['/home']);
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
