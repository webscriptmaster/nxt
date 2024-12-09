import { User } from './../../../models/user';
import { SentResultDialogComponent } from './../../dialogs/sent-result-dialog/sent-result-dialog.component';
import { CreateEmailService } from './../../../create-email/create-email.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  filter,
  Subject,
  takeUntil,
  BehaviorSubject,
  firstValueFrom,
} from 'rxjs';
import { CollegeLibraryService } from './../../college-library.service';
import {
  Component,
  OnDestroy,
  OnInit,
  AfterViewInit,
  Inject,
} from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import * as _ from 'lodash';
import { transformToCollegeSport } from 'src/app/shared/utils';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { AnimationOptions } from 'ngx-lottie';
import { ShareModule } from 'ngx-sharebuttons';
import { ALPHABET, PLANS, STATES } from 'src/app/shared/const';
import {
  PaymentDialogComponent,
  PurchaseDialogComponent,
} from 'src/app/shared/dialogs';
import { HowCreditsWorkDialogComponent } from '../../dialogs';
import { SharedService } from 'src/app/shared/shared.service';
import { SaveCampaignDialogComponent } from 'src/app/create-email/dialogs/save-campaign-dialog/save-campaign-dialog.component';

@Component({
  selector: 'app-college-library',
  templateUrl: './college-library.component.html',
  styleUrls: ['./college-library.component.scss'],
})
export class CollegeLibraryComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  PLANS = PLANS;

  states = STATES;
  divisions = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];
  conferences: any = [];

  alphabet = ALPHABET;

  options: AnimationOptions = {
    path: '/assets/images/animations/searchFilters.json',
    loop: true,
  };

  nameFilter: string | null = null;
  stateFilter: string | null = null;
  divisionFilter: string | null = null;
  conferenceFilter: string | null = null;
  taggedFilter = false;
  clearedFilters = true;

  colleges: any;
  collegesLeft: any;
  collegesRight: any;

  user: User | undefined;

  taggedColleges: any;

  openedContacts: any = {};

  ObjectKeys = Object.keys;

  selectedContacts: any = {};

  drafts: any = [];

  collegeSport: any;

  createEmail = false;
  showCreateEmail = false;
  type = '';
  showColleges = false;
  showUpgradeButton = false;
  loading$ = new BehaviorSubject<boolean>(false);
  _unsubscribeALL: Subject<void> = new Subject();
  _unsubscribeFilter: Subject<void> = new Subject();
  totalSelectedCoach = 0;
  constructor(
    private _collegeService: CollegeLibraryService,
    private _auth: AuthService,
    private _router: Router,
    private _createEmailService: CreateEmailService,
    private _matDialog: MatDialog,
    private route: ActivatedRoute,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.type = params['type'];
    });

    this.loading$.next(true);
    this._auth.user$
      .pipe(
        filter((user) => user !== null),
        takeUntil(this._unsubscribeALL)
      )
      .subscribe(async (user: any) => {
        this.user = user;
        if (!this.type && !this.user?.isShowedHowCollegeCreditWorks) {
          this._matDialog.open(HowCreditsWorkDialogComponent, {
            disableClose: true,
            data: {
              user: this.user,
            },
          });
        }
        if (
          this.user?.lastActivatedPlan === PLANS.SUBSCRIPTION &&
          this.user?.lastActivePlan === PLANS.SUBSCRIPTION
        ) {
          this.showColleges = true;
          this.showUpgradeButton = false;
        }
        if (
          this.user &&
          this.user?.lastActivatedPlan !== PLANS.SUBSCRIPTION &&
          this.user?.lastActivePlan !== PLANS.SUBSCRIPTION &&
          this.user.credits === 0
        ) {
          this.showColleges = false;
          this.showUpgradeButton = true;
        }
        if (
          this.user &&
          this.user?.lastActivatedPlan !== PLANS.SUBSCRIPTION &&
          this.user?.lastActivePlan !== PLANS.SUBSCRIPTION &&
          this.user.credits !== 0
        ) {
          this.showColleges = true;
          this.showUpgradeButton = false;
        }
        if (!(user.appSport && user.appSport === 'secondary')) {
          this.collegeSport = transformToCollegeSport(user.primarySport);
        } else {
          this.collegeSport = transformToCollegeSport(user.secondarySport);
        }

        if (this.collegeSport?.toLowerCase() === 'football') {
          this.divisions = ['FBS', 'FCS', 'D2', 'D3', 'NAIA', 'JUCO'];
        }

        this.conferences = (
          await firstValueFrom(
            this._collegeService.getUserConferences(this.collegeSport)
          )
        )
          .filter((res) => {
            return res.sports.includes(this.collegeSport);
          })
          .map((res) => res.conference);

        this.loading$.next(false);

        this.taggedColleges = this.user?.taggedColleges
          ? this.user?.taggedColleges.reduce((acc: any, val: any) => {
              acc[val] = true;
              return acc;
            }, {})
          : {};

        if (this.user?.id) {
          this._createEmailService
            .getDrafts(this.user?.id)
            .subscribe((res: any) => {
              this.drafts = res;
            });
        }
      });

    this.sharedService.emails$.subscribe((res: any) => {
      this.totalSelectedCoach = res.coaches.length;
    });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this._unsubscribeALL.next();
    this._unsubscribeALL.complete();
    this._unsubscribeFilter.next();
    this._unsubscribeFilter.complete();
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

  createEmailForAutomate() {
    this._router.navigate(['/email-automation']);
  }

  onSearchByName(e: any) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      this.onFilter();
    }
  }

  onLetter(letter: string) {
    const college = this.colleges.filter((college: any) =>
      college.name.toLowerCase().startsWith(letter)
    )[0];
    if (college) {
      const collegeEl = document.getElementById(college.name) as HTMLElement;
      if (collegeEl) {
        collegeEl.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    } else {
      const nextLetter = this.alphabet[this.alphabet.indexOf(letter) + 1];
      if (nextLetter) {
        this.onLetter(nextLetter);
      }
    }
  }

  onFilter() {
    if (
      !this.nameFilter &&
      this.stateFilter === null &&
      this.divisionFilter === null &&
      this.conferenceFilter === null &&
      this.taggedFilter === false
    ) {
      this.colleges = [];
      this.collegesLeft = [];
      this.collegesRight = [];
      this.clearedFilters = true;
      return;
    }

    this.clearedFilters = false;

    if (this.nameFilter) {
      this.conferenceFilter = null;
      this.stateFilter = null;
      this.divisionFilter = null;
      this.taggedFilter = false;
    }

    this.getColleges(
      {
        sport: this.collegeSport,
        conference: this.conferenceFilter,
        state: this.stateFilter,
        division: this.divisionFilter,
        word: this.nameFilter,
        tagged: this.taggedFilter,
      },
      this.taggedColleges
    );
  }

  onTagFilter() {
    this.taggedFilter = !this.taggedFilter;
    this.conferenceFilter = null;
    this.stateFilter = null;
    this.divisionFilter = null;
    this.nameFilter = null;
    this.onFilter();
  }

  onClearFilters() {
    this.nameFilter = null;
    this.stateFilter = null;
    this.divisionFilter = null;
    this.conferenceFilter = null;
    this.taggedFilter = false;
    this.colleges = [];
    this.clearedFilters = true;
  }

  getColleges(filters: any, taggedColleges: any) {
    this.loading$.next(true);
    if (filters.tagged && !Object.keys(taggedColleges).length) {
      this.colleges = [];
      this.collegesLeft = [];
      this.collegesRight = [];
      this.loading$.next(false);
      return;
    }
    this._collegeService
      .getFilteredColleges(filters, taggedColleges)
      .pipe(takeUntil(this._unsubscribeALL))
      .subscribe((res) => {
        this.colleges = res
          .sort((a: any, b: any) => {
            if (a.name < b.name) {
              return -1;
            }
            if (a.name > b.name) {
              return 1;
            }
            return 0;
          })
          // .map((college: any) => {
          //   return {
          //     ...college,
          //     contacts: college.contacts.filter((contact: any) => {
          //       return (
          //         contact.sport === this.collegeSport || contact.sport === 'any'
          //       );
          //     }),
          //   };
          // })
          .filter((college: any) => {
            return college['sportInfo'][this.collegeSport];
          });
        const dividedArrays = this._divideArrayByOddEven(this.colleges);
        this.collegesLeft = dividedArrays[0];
        this.collegesRight = dividedArrays[1];

        this.loading$.next(false);
      });
  }

  onTag(collegeId: string) {
    if (this.taggedColleges[collegeId]) {
      delete this.taggedColleges[collegeId];
    } else {
      this.taggedColleges[collegeId] = true;
    }
    const taggedCollegesArr = Object.keys(this.taggedColleges);
    if (this.user) {
      this._auth.updateUserData(this.user.id, {
        taggedColleges: taggedCollegesArr,
      });
    }
    if (this.taggedFilter) {
      this.colleges = this.colleges.filter((c: any) => {
        return c.id !== collegeId;
      });
      const dividedArrays = this._divideArrayByOddEven(this.colleges);
      this.collegesLeft = dividedArrays[0];
      this.collegesRight = dividedArrays[1];
    }
  }

  onOpenContactsTab(id: string) {
    if (this.openedContacts[id]) {
      delete this.openedContacts[id];
      this.removeClosedContacts(id);
    } else {
      this.openedContacts[id] = true;
    }
    if (Object.keys(this.openedContacts).length === 0) {
      this.selectedContacts = {};
    }
  }

  onCloseContactsTab(id: string) {
    delete this.openedContacts[id];
    this.removeClosedContacts(id);
    if (Object.keys(this.openedContacts).length === 0) {
      this.selectedContacts = {};
    }
  }

  removeClosedContacts(collegeId: string) {
    const arr = Object.keys(this.selectedContacts).map(
      (contact) => this.selectedContacts[contact]
    );
    const contactsToRemove = arr
      .filter((contact) => contact.college.id === collegeId)
      .map((contact) => contact.email);

    contactsToRemove.forEach((email) => {
      delete this.selectedContacts[email];
    });
  }

  onToggleContact({ email, firstName, lastName, college, id }: any) {
    if (this.selectedContacts[id]) {
      delete this.selectedContacts[id];
    } else {
      if (Object.keys(this.selectedContacts).length < 6) {
        this.selectedContacts[id] = {
          email,
          college,
          firstName,
          lastName,
        };
        const contactsArr = Object.keys(this.selectedContacts).map(
          (contact: any) => this.selectedContacts[contact]
        );
        this._createEmailService.setSelectedContacts(contactsArr);
      }
    }
  }

  onCreateEmail() {
    const contactsArr = Object.keys(this.selectedContacts).map(
      (contact: any) => this.selectedContacts[contact]
    );
    this._createEmailService.setSelectedContacts(contactsArr);
    this.createEmail = true;
    setTimeout(() => {
      this.showCreateEmail = true;
    }, 100);
  }

  onDrafts() {
    this._router.navigate(['drafts']);
  }

  async onBack() {
    if (this.type === 'automate') {
      if (this.totalSelectedCoach !== 0) {
        const dialogRef = this._matDialog.open(SaveCampaignDialogComponent, {
          disableClose: true,
        });
        const result = await firstValueFrom(dialogRef.afterClosed());
        if (!result) {
          this.sharedService.setSelectedCollegeFn([]);
          this.sharedService.setCoachEmails({
            recipients: 0,
            coaches: [],
          });
        }
      }
      this._router.navigate(['email-automation']);
      return;
    }
    this._router.navigate(['home']);
  }

  identify(index: any, item: any) {
    return item.id;
  }

  onClose() {
    this.showCreateEmail = false;
    this.selectedContacts = {};
    setTimeout(() => {
      this._checkSentEmailResult();
      this.createEmail = false;
    }, 300);
  }

  onHome(event: boolean) {
    this._router.navigate(['/home']);
  }

  onProfile(event: boolean) {
    this._router.navigate(['/edit-profile']);
  }

  onSettings(event: boolean) {
    this._router.navigate(['/settings']);
  }

  onEditProfile(event: boolean) {
    this._router.navigate(['/edit-profile']);
  }

  onAddOffers(event: boolean) {
    this._router.navigate(['/offers']);
  }

  onAddSport(event: boolean) {
    this._router.navigate(['/add-sport']);
  }

  onReferFriend(event: boolean) {
    this._router.navigate(['/refer']);
  }

  onContactUs(event: boolean) {
    this._router.navigate(['settings/contact-us']);
  }

  onCredits(credits: number | undefined) {
    setTimeout(() => {
      if (credits === 0) {
        const paymentDialog = this._matDialog.open(PurchaseDialogComponent, {
          autoFocus: false,
          data: {
            user: this.user,
          },
        });
      }
    }, 1000);
  }

  _divideArrayByOddEven(inputArray: any[]) {
    var oddArray = [];
    var evenArray = [];

    for (var i = 0; i < inputArray.length; i++) {
      if (i % 2 === 0) {
        oddArray.push(inputArray[i]);
      } else {
        evenArray.push(inputArray[i]);
      }
    }

    return [oddArray, evenArray];
  }
}
