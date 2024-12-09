import { ShareOffersDialog } from './../../dialogs/share-offers-dialog/share-offers-dialogcomponent';
import { SubmitOfferDialogComponent } from './../../dialogs/submit-offer-dialog/submit-offer-dialog.component';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import {
  BehaviorSubject,
  filter,
  Observable,
  Subject,
  takeUntil,
  firstValueFrom,
} from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { CollegeLibraryService } from 'src/app/college-library/college-library.service';
import { User } from 'src/app/models/user';
import { transformToCollegeSport } from 'src/app/shared/utils';
import { OffersService } from '../../offers.service';
import { ConfirmDialogComponent } from 'src/app/shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
})
export class OffersComponent implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  user: User;

  nameFilter: string | null = null;
  collegeSport: any;
  clearedFilters = true;

  colleges: any;
  loading$ = new BehaviorSubject<boolean>(false);

  existOffers: any = {};
  offers: any = {};

  options: AnimationOptions = {
    path: '/assets/images/animations/searchFilters.json',
    loop: true,
  };

  ObjectKeys = Object.keys;

  _unsubscribeALL: Subject<void> = new Subject();

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _collegeService: CollegeLibraryService,
    private _matDialog: MatDialog,
    private _offersServive: OffersService
  ) {
    this.user$ = this._auth.user$;
  }

  ngOnInit() {
    this.loading$.next(true);
    this._auth.user$
      .pipe(
        filter((user) => user !== null),
        takeUntil(this._unsubscribeALL)
      )
      .subscribe(async (user: any) => {
        this.user = user;
        if (
          !(this.user.completeAddSport && this.user.appSport === 'secondary')
        ) {
          this.existOffers = this._transformOffers(user.offers);
          this.collegeSport = transformToCollegeSport(user.primarySport);
        } else {
          this.existOffers = this._transformOffers(user.secondarySportOffers);
          this.collegeSport = transformToCollegeSport(user.secondarySport);
        }
        this.loading$.next(false);
      });
  }

  ngOnDestroy() {
    this._unsubscribeALL.next();
    this._unsubscribeALL.complete();
  }

  async onBack() {
    this._router.navigate(['home']);
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

      if (!(this.user.completeAddSport && this.user.appSport === 'secondary')) {
        this._auth.updateUserData(this.user.id, { offers: updateData });
      } else {
        this._auth.updateUserData(this.user.id, {
          secondarySportOffers: updateData,
        });
      }

      if (Object.keys(this.offers).filter((key) => this.offers[key]).length) {
        this.showShareOffersDialog();
      } else {
        this._router.navigate(['offers/congratulations']);
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
    const offers = Object.keys(this.offers).filter((u) => this.offers[u]);
    const offersData = offers.map((offer) => {
      let logo;
      let highlights;
      let sport;
      let name = `${this.user.firstName} ${this.user.lastName}`;

      if (
        !(this.user.completeAddSport && this.user.appSport === 'secondary')
      ) {
        logo = this.user.profileImg ? this.user.profileImg : null;
        highlights = this.user.primarySportAthleticInfo['highlight_link']
          ? this.user.primarySportAthleticInfo['highlight_link']
          : null;
        sport = this.user.primarySport;
      } else {
        logo = this.user.secondarySportProfileImg
          ? this.user.secondarySportProfileImg
          : null;
        highlights = this.user.secondarySportAthleticInfo['highlight_link']
          ? this.user.secondarySportAthleticInfo['highlight_link']
          : null;
        sport = this.user.secondarySport;
      }
      sport = sport
        .split(' ')
        .filter((w) => w != 'mens' && w != 'womens')
        .join(' ');

      return {
        userId: this.user.id,
        logo,
        name,
        hudlAccountLink: this.user.hudlAccountLink ? this.user.hudlAccountLink : null,
        youtubeAccountLink: this.user.youtubeAccountLink ? this.user.youtubeAccountLink : null,
        sportsAccountLink: this.user.sportsAccountLink ? this.user.sportsAccountLink : null,
        twitter: this.user.twitter ? this.user.twitter : null,
        instagram: this.user.instagram ? this.user.instagram : null,
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

      this._router.navigate(['offers/congratulations']);
    }
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

  onContactUs() {
    this._router.navigate(['settings/contact-us']);
  }
}
