import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { deleteField } from 'firebase/firestore';
import {
  BehaviorSubject,
  Observable,
  Subject,
  first,
  firstValueFrom,
  forkJoin,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CollegeLibraryService } from 'src/app/college-library/college-library.service';
import { SentResultDialogComponent } from 'src/app/college-library/dialogs/sent-result-dialog/sent-result-dialog.component';
import { CreateEmailService } from 'src/app/create-email/create-email.service';
import { User } from 'src/app/models/user';
import { SharedService } from 'src/app/shared/shared.service';
import { transformToCollegeSport } from 'src/app/shared/utils';

@Component({
  selector: 'app-emails',
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.scss'],
})
export class EmailsComponent implements OnInit, OnDestroy {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  _unsubscribeAll = new Subject<void>();
  user$: Observable<User | null>;
  user: User | null;
  emails: any = [];
  xIcon = './assets/images/icons/x-icon-dark.png';
  collegeSport: string;
  divisions: string[];
  conferences: any;
  createEmail = false;
  showCreateEmail = false;
  college: any;
  showContainer = false;
  isOpenExternalApp = false;
  constructor(
    private _auth: AuthService,
    private sharedService: SharedService,
    private _collegeService: CollegeLibraryService,
    private _matDialog: MatDialog,
    private _createEmailService: CreateEmailService
  ) {
    this.user$ = this._auth.user$;
  }
  ngOnInit(): void {
    this.loading$.next(true);
    timer(1000).subscribe(() => {
      this.showContainer = true;
    });
    this._auth.user$
      .pipe(
        takeUntil(this._unsubscribeAll),
        switchMap((user) => {
          this.user = user;
          return forkJoin({
            emails: this.sharedService.getAllSentEmailsByUserId(this.user?.id!),
            conferences: firstValueFrom(
              this._collegeService.getUserConferences(
                transformToCollegeSport(
                  this.user?.appSport === 'secondary'
                    ? this.user?.secondarySport!
                    : this.user?.primarySport!
                )
              )
            ),
          });
        }),
        tap(async ({ emails, conferences }) => {
          if (
            this.user &&
            !this.user.connectedGmailToken &&
            !this.user.connectedMicrosoftToken
          ) {
            this.isOpenExternalApp = !(
              this.user.email &&
              (this.user.email.includes('@gmail') ||
                this.user.email.includes('@hotmail') ||
                this.user.email.includes('@outlook'))
            );
          } else {
            this.isOpenExternalApp = false;
          }
          this.collegeSport = transformToCollegeSport(
            this.user?.appSport === 'secondary'
              ? this.user?.secondarySport!
              : this.user?.primarySport!
          );
          if (this.collegeSport?.toLowerCase() === 'football') {
            this.divisions = ['FBS', 'FCS', 'D2', 'D3', 'NAIA', 'JUCO'];
          }
          this.conferences = conferences
            .filter((res2: any) => res2.sports.includes(this.collegeSport))
            .map((res3: any) => res3.conference);
          this.emails = emails;
          this.loading$.next(false);
        })
      )
      .subscribe();
  }

  onClose() {
    this.showCreateEmail = false;
    setTimeout(() => {
      // this._checkSentEmailResult();
      this.createEmail = false;
    }, 300);
  }

  onToggleTracking(e: any): void {
    if (this.user) {
      this._auth.updateUserData(this.user.id, {
        activityTracking: e,
      });
    }
  }

  async connectEmailFlow(type: string) {
    const user = (await this._waitUser()) as User;
    if (!user.connectedGmailToken && !user.connectedMicrosoftToken) {
      const url = await this._createEmailService.getConnectURL(user.id, type);
      return this._openLink(url!);
    } else {
      localStorage.removeItem('contacts');
      return null;
    }
  }

  private _formatPositions(positions: string[]) {
    return positions
      .map((p: string) =>
        p
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      )
      .join('/');
  }

  async openCreateEmail(email: any) {
    const collegeDetails = await firstValueFrom(
      this._collegeService.getCollegeInfo(
        email.collegeId,
        this.collegeSport,
        this.user?.id!
      )
    );
    this.college = {
      ...this.college,
      ...collegeDetails,
    };
    this._createEmailService.setSelectedContacts([
      {
        college: this.college,
        email: email.coachEmail,
        firstName: email.coachName,
        lastName: email.coachName,
      },
    ]);
    this.sharedService.setEmailGlobalFn([]);
    if (this.isOpenExternalApp) {
      const contact = {
        email: email.coachEmail,
        subject: '',
        body: '',
      };
      if (
        !(this.user?.completeAddSport && this.user.appSport === 'secondary')
      ) {
        contact.subject = `${this.user?.firstName} ${
          this.user?.lastName
        } | ${this._formatPositions(this.user?.primarySportPositions!)} | ${
          this.user?.classOf
        }`;
      } else {
        contact.subject = `${this.user?.firstName} ${
          this.user?.lastName
        } | ${this._formatPositions(this.user?.secondarySportPositions)} | ${
          this.user?.classOf
        }`;
      }

      this.openMail(contact);
      return;
    }
    this.createEmail = true;
  }

  openMail(contact: any) {
    setTimeout(() => {
      const link = document.createElement('a');
      link.href = `mailto:${contact.email}?subject=${contact.subject}&body=${contact.body}`;
      link.style.textDecoration = 'none';
      link.style.color = 'black';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, 0);
  }

  private async _checkSentEmailResult() {
    const response = await firstValueFrom(
      this._createEmailService.sentEmailRespose$
    );

    if (response) {
      const dialogRef = this._matDialog.open(SentResultDialogComponent, {
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe((res) => {
        this._createEmailService.clearSentEmailResponse();
      });
    }
  }

  public handleCloseMailRequiredFieldPopup(): void {
    this._matDialog.closeAll();
  }

  private _openLink(url: string | null) {
    return new Promise((res, rej) => {
      setTimeout(() => {
        if (url) {
          const link = document.createElement('a');
          link.target = '_blank';
          link.href = url;
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

  private _waitUser() {
    return new Promise((res, rej) => {
      const waitUserInterval = setInterval(() => {
        if (this.user) {
          clearInterval(waitUserInterval);
          res(this.user);
        }
      }, 100);
    });
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

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
