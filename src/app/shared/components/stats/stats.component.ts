import { FormGroup, FormControl } from '@angular/forms';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { User } from 'src/app/models/user';
import { SportService } from 'src/app/shared/sport.service';
import { Subject, takeUntil } from 'rxjs';
import { prefix } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-shared-stats-component',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class SharedStatsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() sport: string;
  @Input() userData: User | null;
  @Input() edit = false;
  @Input() isSecondarySport = false;

  selectedTab = '';
  tabs: string[] = [];

  form: FormGroup;
  SPORTS_STATS: any = null;

  _unsubscribeAll = new Subject<void>();

  constructor(private _sportService: SportService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes['sport'] || changes['userData']) &&
      this.sport &&
      this.userData
    ) {

      this._sportService
      .getSportsSettings$()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        if (this.sport && this.userData) {
          this.SPORTS_STATS = Object.keys(res).reduce((acc, val) => {
            acc[val] = res[val].stats;
            const keys = Object.keys(acc[val]);
            for(let i = 0; i < keys.length; i++) {
              if (acc[val][keys[i]]) {
                acc[val][keys[i]] = this.sortStats(acc[val][keys[i]], keys[i]);
              }
              if (acc[val]['Special Teams']) {
                acc[val]['Special Teams'] = this.sortStats(acc[val]['Special Teams'], 'team');
              }
            }
            return acc;
          }, {} as any);
          this._setData(
            this.sport,
            this.SPORTS_STATS,
            this.userData,
            this.isSecondarySport
          );
        }

      });
    }
  }

  private _setData(
    sport: string,
    sportStats: any,
    userData: User,
    isSecondarySport: boolean
  ) {
    this.tabs = Object.keys(sportStats[sport]).sort((a,b) => this._sortOrder(a) - this._sortOrder(b));
    this.selectedTab = this.tabs[0];
    const form_fields = this.tabs.reduce((acc: any, val) => {
      acc = [...acc, ...sportStats[sport][val]];
      return acc
    }, []);
    const formControls = form_fields.reduce((acc: any, val: any) => {
      let value = null;
      if (!isSecondarySport) {
        if (
          userData &&
          userData.primarySportStats &&
          userData.primarySportStats[val.field]
        ) {
          value = userData.primarySportStats[val.field];
        }
      } else {
        if (
          userData &&
          userData.secondarySportStats &&
          userData.secondarySportStats[val.field]
        ) {
          value = userData.secondarySportStats[val.field];
        }
      }
      acc[val.field] = new FormControl(value);
      return acc;
    }, {});
    this.form = new FormGroup(formControls);
  }

  sortStats(statsArray: any[], prefix: string): any[] {
    return statsArray.sort((a, b) => {
      if (a.field === prefix + '_title_stats' && b.field !== prefix + '_title_stats') {
        return -1;
      } else if (a.field !== prefix + '_title_stats' && b.field === prefix + '_title_stats') {
        return 1;
      } else {
        return 0;
      }
    });
  }

  private _sortOrder(tab: string) {
    let value = tab.toLowerCase();
    if (value === "offense") {
      return 0;
    } else if (value === "defense") {
      return 1;
    } else {
      return 2;
    }
  }
}
