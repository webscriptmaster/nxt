import { User } from 'src/app/models/user';
import {
  Component,
  Input,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, Subject, firstValueFrom } from 'rxjs';
import { COLLEGE_DETAILS_TYPE, PLANS } from 'src/app/shared/const';
import { openLink } from 'src/app/shared/utils';
import { CollegeLibraryService } from '../../college-library.service';
import { MatDialog } from '@angular/material/dialog';
import { UseCreditsDialogsComponent } from '../../dialogs/use-credits-dialogs/use-credits-dialogs.component';
import { AuthService } from 'src/app/auth/auth.service';
import {
  ConfirmDialogComponent,
  PurchaseDialogComponent,
} from 'src/app/shared/dialogs';
import { NotEnoughDialogsComponent } from '../../dialogs/not-enough-dialogs/not-enough-dialogs.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared/shared.service';

@Component({
  selector: 'app-college-card',
  templateUrl: './college-card.component.html',
  styleUrls: ['./college-card.component.scss'],
})
export class CollegeCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() college: any;
  @Input() isTagged: boolean = false;
  @Input() selectedContacts: any;
  @Input() user: User;
  @Input() collegeSport: any;
  @Input() type: string = '';
  @Input() isCamp: boolean;

  @Output() toggleTag = new EventEmitter();
  @Output() openContactsTab = new EventEmitter();
  @Output() closeContactsTab = new EventEmitter();
  @Output() toggleContact = new EventEmitter();

  @ViewChild('card') card: ElementRef;

  listEmails: string[] = [];
  COLLEGE_DETAILS_TYPE = COLLEGE_DETAILS_TYPE;
  detailsMode: string | null = null;

  needToShow$ = new BehaviorSubject<boolean>(false);
  _unsubscribeAll: Subject<void> = new Subject();

  hasDetails = false;
  countCollege = 0;
  selectedCollege: string[] = [];
  constructor(
    private _collegeService: CollegeLibraryService,
    private dialog: MatDialog,
    private _auth: AuthService,
    private route: ActivatedRoute,
    private sharedService: SharedService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.type = params['type'];
    });
    this.sharedService.emails$.subscribe((emails) => {
      this.listEmails = emails.coaches;
      this.countCollege = emails.recipients;
    });
    this.sharedService.selectedCollege$.subscribe((selectedCollege) => {
      this.selectedCollege = selectedCollege;
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    this._checkShowCard();
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  async chooseCollege(college: any) {
    const availableColleges = this.user.availableColleges
      ? this.user.availableColleges
      : [];

    if (!availableColleges.includes(this.college._id)) {
      if (
        (this.user.lastActivatedPlan !== PLANS.SUBSCRIPTION &&
          this.user.lastActivePlan !== PLANS.SUBSCRIPTION) ||
        ((this.user.lastActivatedPlan == PLANS.SUBSCRIPTION ||
          this.user.lastActivePlan == PLANS.SUBSCRIPTION) &&
          this.user.payment &&
          this.user.payment.expiresIn &&
          this.user.payment.expiresIn.toMillis() < Date.now())
      ) {
        if (this.user.credits > 0) {
          const useCreditsDialog = this.dialog.open(
            UseCreditsDialogsComponent,
            {
              disableClose: true,
            }
          );
          const result = await firstValueFrom(useCreditsDialog.afterClosed());
          if (!result) {
            return;
          } else {
            this._auth.updateUserData(this.user.id, {
              availableColleges: [...availableColleges, this.college._id],
              credits: this.user.credits - 1,
            });
          }
        } else {
          const paymentDialog = this.dialog.open(NotEnoughDialogsComponent, {
            autoFocus: false,
            data: {
              user: this.user,
            },
          });
          return;
        }
      }
    }

    if (!this.hasDetails) {
      const collegeDetails = await firstValueFrom(
        this._collegeService.getCollegeInfo(
          this.college._id,
          this.collegeSport,
          this.user.id
        )
      );
      this.college = {
        ...this.college,
        ...collegeDetails,
      };
      this.hasDetails = true;
    }
    const tempEmail = this.getAllEmailsFromContacts(this.college);
    if (!this.selectedCollege.includes(college._id)) {
      this.countCollege++;
      this.listEmails = [...this.listEmails, ...tempEmail];
      this.selectedCollege.push(this.college._id);
    } else {
      this.countCollege--;
      this.listEmails = this.removeEmailsToRemove(
        this.listEmails,
        tempEmail,
        'email'
      );
      this.selectedCollege = this.selectedCollege.filter(
        (collegeId) => collegeId !== this.college._id
      );
    }
    this.sharedService.setSelectedCollegeFn(this.selectedCollege);
    this.listEmails = this.removeDuplicateObjects(this.listEmails);
    if (this.countCollege === 0) {
      this.listEmails = [];
    }
    this.sharedService.setCoachEmails({
      recipients: this.countCollege,
      coaches: this.listEmails,
    });
  }

  getAllEmailsFromContacts(data: any): string[] {
    const result: any[] = [];
    data.contacts.forEach((contact: any) => {
      if (contact.email && contact.email.trim() !== '') {
        const emailAndContact: any = {
          email: contact.email.trim(),
          college: data,
          firstName: contact.firstName,
          lastName: contact.lastName,
        };

        result.push(emailAndContact);
      }
    });
    return result;
  }

  removeEmailsToRemove(
    originalObjects: any[],
    objectsToRemove: any[],
    key: string
  ): any[] {
    const filteredObjects = originalObjects.filter((obj) => {
      return !objectsToRemove.some((removeObj) => removeObj[key] === obj[key]);
    });
    return filteredObjects;
  }

  removeDuplicateObjects(originalObjects: any[]): any[] {
    const uniqueObjects = originalObjects.filter(
      (obj, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.email === obj.email &&
            t.firstName === obj.firstName &&
            t.lastName === obj.lastName
        )
    );
    return uniqueObjects;
  }

  onTag() {
    this.toggleTag.emit(this.college.id);
  }

  async setMode(mode: COLLEGE_DETAILS_TYPE) {
    const availableColleges = this.user.availableColleges
      ? this.user.availableColleges
      : [];

    if (!availableColleges.includes(this.college._id)) {
      if (
        (this.user.lastActivatedPlan !== PLANS.SUBSCRIPTION &&
          this.user.lastActivePlan !== PLANS.SUBSCRIPTION) ||
        ((this.user.lastActivatedPlan == PLANS.SUBSCRIPTION ||
          this.user.lastActivePlan == PLANS.SUBSCRIPTION) &&
          this.user.payment &&
          this.user.payment.expiresIn &&
          this.user.payment.expiresIn.toMillis() < Date.now())
      ) {
        if (this.user.credits > 0) {
          const useCreditsDialog = this.dialog.open(
            UseCreditsDialogsComponent,
            {
              disableClose: true,
            }
          );
          const result = await firstValueFrom(useCreditsDialog.afterClosed());
          if (!result) {
            return;
          } else {
            this._auth.updateUserData(this.user.id, {
              availableColleges: [...availableColleges, this.college._id],
              credits: this.user.credits - 1,
            });
          }
        } else {
          const paymentDialog = this.dialog.open(NotEnoughDialogsComponent, {
            autoFocus: false,
            data: {
              user: this.user,
            },
          });
          return;
        }
      }
    }

    if (!this.hasDetails) {
      const collegeDetails = await firstValueFrom(
        this._collegeService.getCollegeInfo(
          this.college._id,
          this.collegeSport,
          this.user.id
        )
      );
      this.college = {
        ...this.college,
        ...collegeDetails,
      };
      this.hasDetails = true;
    }

    if (mode === COLLEGE_DETAILS_TYPE.CONTACTS) {
      this.openContactsTab.emit(this.college.id);
    } else {
      this.closeContactsTab.emit(this.college.id);
    }
    if (this.detailsMode === mode) {
      this.detailsMode = null;
    } else {
      this.detailsMode = mode;
    }
  }

  scrollCardTop() {
    this.card.nativeElement.scroll(0, 0);
  }

  private _checkShowCard() {
    if (window && 'IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(({ isIntersecting }) => {
          if (isIntersecting) {
            this.needToShow$.next(true);
            obs.unobserve(this.card.nativeElement);
          }
        });
      });
      obs.observe(this.card.nativeElement);
    } else {
      this.needToShow$.next(true);
    }
  }

  async onToggleContact({
    email,
    firstName,
    lastName,
    id,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    id: string;
  }) {
    this.toggleContact.emit({
      email,
      firstName,
      lastName,
      college: this.college,
      id,
    });
  }

  async openLink(url: string) {
    if (
      this.user.lastActivatedPlan !== PLANS.TRIAL ||
      this.user.lastActivePlan !== PLANS.TRIAL
    ) {
      const availableColleges = this.user.availableColleges
        ? this.user.availableColleges
        : [];
      if (!availableColleges.includes(this.college._id)) {
        if (
          (this.user.lastActivatedPlan &&
            this.user.credits > 0 &&
            this.user.lastActivatedPlan !== PLANS.SUBSCRIPTION) ||
          (this.user.lastActivePlan &&
            this.user.credits > 0 &&
            this.user.lastActivePlan !== PLANS.SUBSCRIPTION)
        ) {
          const useCreditsDialog = this.dialog.open(
            UseCreditsDialogsComponent,
            {
              disableClose: true,
            }
          );
          const result = await firstValueFrom(useCreditsDialog.afterClosed());
          if (!result) {
            return;
          } else {
            this._auth.updateUserData(this.user.id, {
              availableColleges: [...availableColleges, this.college._id],
              credits: this.user.credits - 1,
            });
          }
          return;
        }

        if (
          this.user.credits <= 0 &&
          this.user.lastActivatedPlan !== PLANS.SUBSCRIPTION
        ) {
          this.dialog.open(PurchaseDialogComponent, {
            autoFocus: false,
            data: {
              user: this.user,
            },
          });
          return;
        }
      }

      const collegeDetails = await firstValueFrom(
        this._collegeService.getCollegeInfo(
          this.college._id,
          this.collegeSport,
          this.user.id
        )
      );
      this.college = {
        ...this.college,
        ...collegeDetails,
      };
      url = this.college['sportInfo'][this.collegeSport]['sportLandingUrl'];
      setTimeout(() => {
        openLink(url);
      }, 0);
    }
  }
}
