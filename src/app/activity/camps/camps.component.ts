import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject, Observable, takeUntil, switchMap, tap, firstValueFrom, timer } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { DeleteDialogComponent } from 'src/app/shared/dialogs';
import { SharedService } from 'src/app/shared/shared.service';
import { SportService } from 'src/app/shared/sport.service';
import { transformToCollegeSport } from 'src/app/shared/utils';

@Component({
  selector: 'app-camps',
  templateUrl: './camps.component.html',
  styleUrls: ['./camps.component.scss']
})
export class CampsComponent {

  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _unsubscribeAll = new Subject<void>();
  user$: Observable<User | null>
  user: User | null;
  camps: any = [];
  xIcon = './assets/images/icons/x-icon-dark.png';
  collegeSport: string;
  showContainer: boolean = false;
  currentSport: any;
  constructor(
    private _auth: AuthService,
    private sharedService: SharedService,
    private _matDialog: MatDialog,
    private _sportService: SportService,
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
        return this.sharedService.getAllCampByUserId(this.user?.id!);
      }),
      tap(camps => {
        this.camps = camps;
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

  onLandingPageUrl(url: string) {
    if(!url) return;
    this.onLink(url);
  }

  onTwitter(tag: string): void {
    if (tag.includes('https://twitter.com/')) {
      this.onLink(tag);
      return;
    }
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

  async onDeleteCamp(name: string, collegeId: string) {
    const confirmDeleteDialogRef = this._matDialog.open(
      DeleteDialogComponent,
      {
        disableClose: true,
        autoFocus: false,
        data: {
          title: 'Complete Questionnaire',
          message: 'Are you sure you want to delete this camp?',
          info: 'Tracking Enabled',
          firstButtonText: 'Yes',
          secondButtonText: 'No',
          firstButtonColor: '#CCFF00',
          secondButtonColor: '#FF0303',
          firstButtonBorder: '1px solid #fff',
          secondButtonBorder: '1px solid #fff',
        },
      }
    );
    const res = await firstValueFrom(confirmDeleteDialogRef.afterClosed());

    if (!res) {
      return;
    }

    const user = await firstValueFrom(this.user$);
    if (user) {
      this.sharedService.deleteCampByName(name, user.id);
      let existCamps;
      existCamps = user.completeCamps;
      const updateData = existCamps?.filter(item => item !== collegeId)
      this._auth.updateUserData(user.id, { completeCamps: updateData });
    }
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
