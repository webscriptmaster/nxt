import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subject, switchMap, takeUntil, tap, timer } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { SharedService } from 'src/app/shared/shared.service';
import { SportService } from 'src/app/shared/sport.service';
import { transformToCollegeSport } from 'src/app/shared/utils';

@Component({
  selector: 'app-questionnares',
  templateUrl: './questionnares.component.html',
  styleUrls: ['./questionnares.component.scss']
})
export class QuestionnaresComponent implements OnInit, OnDestroy {
[x: string]: any;

  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _unsubscribeAll = new Subject<void>();
  user$: Observable<User | null>
  user: User | null;
  questionnaires: any = [];
  xIcon = './assets/images/icons/x-icon-dark.png';
  showContainer: boolean = false;
  collegeSport: string;
  currentSport: any;
  constructor(
    private _auth: AuthService,
    private sharedService: SharedService,
    private _sportService: SportService
  ) {
    this.user$ = this._auth.user$;
  }
  ngOnInit(): void {
    this.loading$.next(true);
    timer(1000).subscribe(() => {
      this.showContainer = true;
    });
    this._auth.user$.pipe(
      takeUntil(this._unsubscribeAll),
      switchMap(user => {
        this.user = user;
        return this.sharedService.getAllQuestionnairesByUserId(this.user?.id!);
      }),
      tap(questionnaires => {
        this.questionnaires = questionnaires;
        if (!(this.user?.appSport && this.user.appSport === 'secondary')) {
          this.collegeSport = transformToCollegeSport(this.user?.primarySport!);
        } else {
          this.collegeSport = transformToCollegeSport(this.user?.secondarySport!);
        }
        this._sportService
          .getSportsSettings$()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((res) => {
            const sportList = this._sportService.getOrderedSports(res);
            this.currentSport = sportList.find(item => item.name === this.collegeSport.toLowerCase());
          });
      }),
      tap(() => this.loading$.next(false))
    ).subscribe();
  }

  onToggleTracking(e: any): void {
    if (this.user) {
      this._auth.updateUserData(this.user.id, {
        activityTracking: e
      })
    }
  }
  onTwitter(tag: string): void {
    if (tag.includes('https://twitter.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://twitter.com/${tag}`;
    this.onLink(url);
  }

  onLandingPageUrl(url: string) {
    if(!url) return;
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
