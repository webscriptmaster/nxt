import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SPORTS_STATS } from 'src/app/shared/const';
import { SportService } from '../../sport.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-prospect-sheet-info',
  templateUrl: './prospect-sheet-info.component.html',
  styleUrls: ['./prospect-sheet-info.component.scss'],
})
export class ProspectSheetInfoComponent implements OnInit, OnChanges {
  @Input() user: any;
  @Input() forPDF = false;
  @Input() view = false;

  athleticInfo: any[] = [];
  stats: any[] = [];
  youTubeLink: any;
  hudlLink: any;
  jerseyNumber: null | string = null;
  orderedStats: string[] = [];
  ACADEMIC_CATEGORY: any[];
  _unsubscribeAll = new Subject<void>();
  mixCategoryData: any[] = [];
  constructor(protected _sanitizer: DomSanitizer, private _sportService: SportService) {}

  ngOnInit() {
    if (!(this.user.completeAddSport && this.user.appSport === 'secondary')) {
      this._makeVideoLink(
        this.user.primarySportAthleticInfo['highlight_link'] as string
      );
      this.athleticInfo = this._makeAthleticInfo(
        this.user.primarySportAthleticInfo
      );
      this.stats = this._makeStats(this.user.primarySportStats);
      this.jerseyNumber = this.user.primarySportAthleticInfo['jersey_number'];
    } else {
      this._makeVideoLink(
        this.user.secondarySportAthleticInfo['highlight_link'] as string
      );
      this.athleticInfo = this._makeAthleticInfo(
        this.user.secondarySportAthleticInfo
      );
      this.stats = this._makeStats(this.user.secondarySportStats);
      this.jerseyNumber = this.user.secondarySportAthleticInfo['jersey_number'];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user']) {
      this.youTubeLink = null;
      this.hudlLink = null;
      if (!(this.user.completeAddSport && this.user.appSport === 'secondary')) {
        this._makeVideoLink(
          this.user.primarySportAthleticInfo['highlight_link'] as string
        );
        this.athleticInfo = this._makeAthleticInfo(
          this.user.primarySportAthleticInfo
        );
        this.stats = this._makeStats(this.user.primarySportStats);
        this.jerseyNumber = this.user.primarySportAthleticInfo['jersey_number'];
      } else {
        this._makeVideoLink(
          this.user.secondarySportAthleticInfo['highlight_link'] as string
        );
        this.athleticInfo = this._makeAthleticInfo(
          this.user.secondarySportAthleticInfo
        );
        this.stats = this._makeStats(this.user.secondarySportStats);
        this.jerseyNumber =
          this.user.secondarySportAthleticInfo['jersey_number'];
      }
      this._sportService
        .getAcademicCategorySettings$()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res) => {
          this.ACADEMIC_CATEGORY = res;
          this.mixCategoryData = this.ACADEMIC_CATEGORY.map(field => ({
            ...field,
            value: this.user.academicInfo[field.field]
          }));
        });
    }
  }

  private _makeVideoLink(link: string) {
    if (link) {
      const youtubeRegExp = new RegExp(
        '^(http(s)?://)?((w){3}.)?(youtu(be|.be))?(.com)?/.+'
      );
      const hudlRegExp = new RegExp(
        '^(http(s)?://)?((w){3}.)?(hudl)?(.com)?/.+'
      );
      if (youtubeRegExp.test(link)) {
        const videoId = this._getYouTubeId(link);
        this.youTubeLink = this._sanitizer.bypassSecurityTrustResourceUrl(
          `//www.youtube.com/embed/${videoId}?autoplay=1&showinfo=1&controls=1`
        );
      }
      if (hudlRegExp.test(link)) {
        const videoId = this._getHudlId(link);
        this.hudlLink = this._sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.hudl.com/embed/video/${videoId}`
        );
      }
    }
  }

  private _getYouTubeId(url: string) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return match && match[2].length === 11 ? match[2] : null;
  }

  private _getHudlId(url: string) {
    if (!url) return null;

    const regex =
      /(https?:\/\/(www\.)?)?hudl\.com\/(video|embed\/video)\/(.*)/i;
    const match = url.match(regex);
    if (match) {
      return `/${match[4]}`;
    } else {
      return null;
    }
  }

  private _makeAthleticInfo(athleticInfoObj: any) {
    return Object.keys(athleticInfoObj)
      .filter(
        (value) =>
          !['height', 'weight', 'jersey_number', 'highlight_link'].includes(
            value
          )
      )
      .sort((a, b) => {
        if (a === 'accolades') {
          return -1;
        } else if (b === 'accolades') {
          return 1;
        } else {
          return a.length - b.length;
        }
      })
      .reduce((acc: any[], val: string) => {
        const label = val.split('_').join(' ');
        const value = athleticInfoObj[val];
        acc = [...acc, { label, value }];
        return acc;
      }, [])
      .filter((info) => {
        return info.value;
      });
  }

  private _makeStats(statsObj: any) {
    this.orderedStats = this._makeOrderedStats();

    const sortedStats = Object.keys(statsObj)
      .filter((key: string) => statsObj[key])
      .sort((a, b) => {
        const orderA = this.orderedStats.indexOf(a);
        const orderB = this.orderedStats.indexOf(b);
        return orderA - orderB;
      });

    return sortedStats
      .reduce((acc: any[], val: string) => {
        const label = val.split('_').join(' ');
        const value = statsObj[val];
        acc = [...acc, { label, value }];
        return acc;
      }, [])
      .filter((info) => {
        return info.value;
      });
  }

  onTwitter(tag: string) {
    const url = `https://twitter.com/${tag}`;
    this.onLink(url);
  }

  onLink(url: string) {
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

  private _makeOrderedStats() {
    const offenseStats = Object.keys(SPORTS_STATS)
      .reduce((acc: any, val: string) => {
        const sportStats = SPORTS_STATS[val];
        if (sportStats['offense']) {
          acc = [...acc, ...sportStats['offense']];
        }
        return acc;
      }, [])
      .map((stat: any) => stat.field);

    const defenseStats = Object.keys(SPORTS_STATS)
      .reduce((acc: any, val: string) => {
        const sportStats = SPORTS_STATS[val];
        if (sportStats['defense']) {
          acc = [...acc, ...sportStats['defense']];
        }
        return acc;
      }, [])
      .map((stat: any) => stat.field);

    const otherStats = Object.keys(SPORTS_STATS)
      .reduce((acc: any, val: any) => {
        const sportStats = SPORTS_STATS[val];
        const keys = Object.keys(sportStats).filter(
          (key: string) => key !== 'offense' && key !== 'defense'
        );

        let otherStats = [];
        if (keys.length) {
          otherStats = keys.reduce((acc: any, val: string) => {
            acc = [...acc, ...sportStats[val]];
            return acc;
          }, []);
        }

        acc = [...acc, ...otherStats];
        return acc;
      }, [])
      .map((stat: any) => stat.field);

    return [...offenseStats, ...defenseStats, ...otherStats];
  }
}
