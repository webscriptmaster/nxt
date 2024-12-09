import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-college-card-socials',
  templateUrl: './socials.component.html',
  styleUrls: ['./socials.component.scss'],
})
export class CollegeCardSocialsComponent implements OnInit {
  @Input() contacts: any;
  @Input() twitter: any;
  @Input() collegeName: any;

  constructor(private _router: Router) {}

  ngOnInit() {}

  onTwitter(url: string) {
    this._router.navigate(['twitter'], { queryParams: { url } });
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
