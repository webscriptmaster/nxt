import { OffersSkipDialogComponent } from './skip-dialog/skip-dialog.component';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, filter, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { FormControl } from '@angular/forms';
import { SportService } from 'src/app/shared/sport.service';
import { AnimationOptions } from 'ngx-lottie';
import { OffersService } from 'src/app/offers/offers.service';
import { CollegeLibraryService } from 'src/app/college-library/college-library.service';
import { transformToCollegeSport } from 'src/app/shared/utils';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-add-sport-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class AddSportOffersComponent implements OnInit, OnDestroy {
  hideTooltip = true;
  userData: any;
  sport: string | null = null;
  offersControl = new FormControl(null as string | null, []);
  sports: any;
  nameFilter: string | null = null;
  colleges: any;
  loading$ = new BehaviorSubject<boolean>(false);
  clearedFilters = true;
  existOffers: any = {};
  offers: any = {};
  _unsubscribeAll = new Subject<void>();
  collegeSport: any;
  _unsubscribeALL: Subject<void> = new Subject();
  
  options: AnimationOptions = {
    path: '/assets/images/animations/searchFilters.json',
    loop: true,
  };
  ObjectKeys = Object.keys;
  constructor(
    private _router: Router,
    private _matDialog: MatDialog,
    private _auth: AuthService,
    private _sportService: SportService,
    private _offersServive: OffersService,
    private _collegeService: CollegeLibraryService,
  ) {}

  async ngOnInit() {
    this._sportService
    .getSportsSettings$()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((res) => {
      this.sports = res;
    });
    this._auth.user$
    .pipe(
      filter((user) => user !== null),
      takeUntil(this._unsubscribeAll)
      )
      .subscribe((res: any) => {
      this.userData = res;
      if (
        !(this.userData?.completeAddSport && this.userData.appSport === 'secondary')
      ) {
        this.existOffers = this._transformOffers(res?.offers);
        this.collegeSport = transformToCollegeSport(res?.primarySport);
      } else {
        this.existOffers = this._transformOffers(res?.secondarySportOffers);
        this.collegeSport = transformToCollegeSport(res?.secondarySport);
      }
      if (this.userData && this.userData.primarySport) {
        this.sport = this.userData.primarySport;
        if (this.userData.offers) {
          this.offersControl.setValue(this.userData.offers);
        }
        this.showSkipOffersDialog();
      } else {
        this._router.navigate(['/auth/choose-sport']);
      }
    });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onBack() {
    if (this.sport) {
      if ( Object.keys(this.sports[this.sport].stats).length) {
        this._router.navigate(['/auth/stats']);
      } else {
        this._router.navigate(['/auth/athletic-information']);
      }
    } else {
      this._router.navigate(['/auth/athletic-information']);
    }
  }

  onContinue() {
    if (this.offersControl.valid && this.userData) {
      this._auth.updateUserData(this.userData.id, {
        offers: this.offersControl.value,
      });
      this._router.navigate(['/auth/notifications']);
    } else {
      this.offersControl.markAllAsTouched();
    }
  }

  textAreaAdjust(element: HTMLElement) {
    element.style.height = '1px';
    element.style.height = 25 + element.scrollHeight + 'px';
  }

  async showSkipOffersDialog() {
    if (!this._auth.signUpSkipOffersShowed) {
      this._auth.signUpSkipOffersShowed = true;
      const dialogRef = this._matDialog.open(OffersSkipDialogComponent, {
        disableClose: true,
      });
      const result = await firstValueFrom(dialogRef.afterClosed());
      if (!result) {
        this._router.navigate(['/auth/notifications']);
      }
      this.hideTooltip = false;
    } else {
      this.hideTooltip = false;
    }
  }

  onSearchByName(e: any) {
    if (e.key === 'Enter' || e.keyCode === 13) {
      this.onFilter();
    }
  }

  onFilter() {
    if (!this.nameFilter) {
      this.colleges = [];
      this.clearedFilters = true;
      return;
    }
    this.clearedFilters = false;

    this.getColleges({
      sport: this.collegeSport,
      word: this.nameFilter,
    });
  }

  getColleges(filters: any) {
    this.loading$.next(true);
    this._collegeService
      .getFilteredColleges(filters, null)
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
          // });
        this.loading$.next(false);
      });
  }

  async onSubmit() {
    if (!this.ObjectKeys(this.offers).length) {
      return;
    }

    const confirmSubmitDialogRef = await this._matDialog.open(ConfirmDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Are You Sure You Want To Submit Offer?',
        message: '',
        info: '',
        firstButtonText: 'Yes',
        secondButtonText: 'No',
        firstButtonColor: '#CCFF00',
        secondButtonColor: '#FF0303',
        firstButtonBorder: '1px solid #fff',
        secondButtonBorder: '1px solid #fff',
      },
    });
    const res = await firstValueFrom(confirmSubmitDialogRef.afterClosed());
    if (!res) {
      return;
    }
    if (res) {
      const offersToUpdate = Object.keys(this.offers);
      offersToUpdate.forEach((offer: string) => {
        if (this.offers[offer]) {
          if (!this.existOffers[offer]) {
            this.existOffers[offer] = true;
          }
        } else {
          if (this.existOffers[offer]) {
            delete this.existOffers[offer];
          }
        }
      });

      const updateData = Object.keys(this.existOffers).join(', ');

      if (this.userData && !(this.userData?.completeAddSport && this.userData.appSport === 'secondary')) {
        this._auth.updateUserData(this.userData.id, { offers: updateData });
      } else {
        this._auth.updateUserData(this.userData.id, {
          secondarySportOffers: updateData,
        });
      }

      if (Object.keys(this.offers).filter((key) => this.offers[key]).length) {
        this.showShareOffersDialog();
      }
    }
  }

  private _transformOffers(offers: any) {
    if (offers) {
      const offersArr = offers.split(',').map((o: string) => o.trim());
      return offersArr.reduce((acc: any, val: any) => {
        acc[val] = true;
        return acc;
      }, {});
    } else {
      return {};
    }
  }

  async showShareOffersDialog() {
    const confirmShareDialogRef = await this._matDialog.open(ConfirmDialogComponent, {
      autoFocus: false,
      data: {
        title: 'Great Job! Offer Added.',
        message: 'Share this great accomplishment with others on NXT 1?',
        info: 'Inspire other athletes!',
        firstButtonText: 'Yes',
        secondButtonText: 'No',
        firstButtonColor: '#CCFF00',
        secondButtonColor: '#FF0303',
        firstButtonBorder: '1px solid #fff',
        secondButtonBorder: '1px solid #fff',
      },
    });
    const res = await firstValueFrom(confirmShareDialogRef.afterClosed());
    if (!res) {
      return;
    }
    const offers = Object.keys(this.offers).filter((u) => this.offers[u]);
    const offersData = offers.map((offer) => {
      let logo;
      let highlights;
      let sport;
      let name = `${this.userData.firstName} ${this.userData.lastName}`;

      if (
        !(this.userData.completeAddSport && this.userData.appSport === 'secondary')
      ) {
        logo = this.userData.profileImg ? this.userData.profileImg : null;
        highlights = this.userData.primarySportAthleticInfo['highlight_link']
          ? this.userData.primarySportAthleticInfo['highlight_link']
          : null;
        sport = this.userData.primarySport;
      } else {
        logo = this.userData.secondarySportProfileImg
          ? this.userData.secondarySportProfileImg
          : null;
        highlights = this.userData.secondarySportAthleticInfo['highlight_link']
          ? this.userData.secondarySportAthleticInfo['highlight_link']
          : null;
        sport = this.userData.secondarySport;
      }
      sport = sport
        .split(' ')
        .filter((w: string) => w != 'mens' && w != 'womens')
        .join(' ');

      return {
        userId: this.userData.id,
        logo,
        name,
        twitter: this.userData.twitter ? this.userData.twitter : null,
        highlights,
        sport,
        message: `received an offer from ${offer}`,
        date: new Date(),
        collegeName: offer,
        share: true
      };
    });


    if (res) {
      offersData.forEach((offer) => {
        this._offersServive.addOffer(offer);
      });
      this.offers = [];
    } else {
      offersData.forEach((offer) => {
        offer['share'] = false;
        this._offersServive.addOffer(offer);
      });
    }
  }
}
