import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-college-card-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class CollegeCardInfoComponent implements OnInit {
  @Input() college: any;

  showShare = false;
  shareLanding = false;
  shareMajor = false;

  constructor() {}

  ngOnInit() {
    if (this.college?.acceptanceRate?.includes('%')) {
      this.college.acceptanceRate = this.college.acceptanceRate.replace('%', '');
    }
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

  onShare(e: Event, url: string) {
    if (navigator['share'] && window.innerWidth < 1280) {
      navigator.share({
        url: url,
      });
    } else {
      this.showShare = true;
      e.stopPropagation();
    }
  }

  copy(url: string) {
    navigator.clipboard.writeText(url);
  }
}
