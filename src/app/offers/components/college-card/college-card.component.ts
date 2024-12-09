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
import { COLLEGE_DETAILS_TYPE } from 'src/app/shared/const';
import { OffersService } from '../../offers.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteOfferDialogComponent } from '../../dialogs';

@Component({
  selector: 'app-offers-college-card',
  templateUrl: './college-card.component.html',
  styleUrls: ['./college-card.component.scss'],
})
export class OffersCollegeCardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() college: any;

  @Input() user: User;
  @Input() collegeSport: any;

  @Input() offers: any = {};
  @Input() existOffers: any = {};

  @ViewChild('card') card: ElementRef;

  COLLEGE_DETAILS_TYPE = COLLEGE_DETAILS_TYPE;
  detailsMode: string | null = null;

  needToShow$ = new BehaviorSubject<boolean>(false);
  _unsubscribeAll: Subject<void> = new Subject();

  constructor(
    private _offersService: OffersService,
    private _auth: AuthService,
    private _matDialog: MatDialog
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this._checkShowCard();
  }

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
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

  onOffer(id: string) {
    if (this.offers[id]) {
      this.offers[id] = false;
    } else {
      this.offers[id] = true;
    }
  }

  async onRemoveExist(id: string) {
    const confirmDeleteDialogRef = this._matDialog.open(
      DeleteOfferDialogComponent,
      {
        disableClose: true,
      }
    );
    const res = await firstValueFrom(confirmDeleteDialogRef.afterClosed());

    if (!res) {
      return;
    }


    delete this.existOffers[id];
    const updateData = Object.keys(this.existOffers).join(', ');
    if (!(this.user.completeAddSport && this.user.appSport === 'secondary')) {
      this._auth.updateUserData(this.user.id, { offers: updateData });
    } else {
      this._auth.updateUserData(this.user.id, {
        secondarySportOffers: updateData,
      });
    }

    const result = await this._offersService.deleteOfferByName(
      id,
      this.user.id
    );
  }
}
