import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/models/user';
import { OffersService } from '../../offers.service';
import { DeleteOfferDialogComponent } from '../../dialogs';
import { MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CollegeLibraryService } from 'src/app/college-library/college-library.service';

@Component({
  selector: 'app-offers-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
})
export class OffersLogComponent implements OnInit {
  @Input() embedded = false;
  user$: Observable<User | null>;

  offers: any[] = [];
  allOffers: any[] = [];

  activeTab = 0;
  xIcon = ''
  currentRouter: string = '';

  @Output() activeTabChange = new EventEmitter<any>();

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _offersService: OffersService,
    private _matDialog: MatDialog,
    private breakePoint: BreakpointObserver
  ) {
    this.user$ = this._auth.user$;
  }

  ngOnInit() {
    this.loadData();
    this.breakePoint.observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => {
        // if (result.matches) {
        //   this.xIcon = './assets/images/icons/x-icon.png'
        // } else {
          this.xIcon = './assets/images/icons/x-icon-dark.png'
        // }
      });
    this.currentRouter = this._router.url;
    if (this.currentRouter.includes('offers')) {
      this.activeTab = 3;
    }
    
  }

  async loadData() {
    this._offersService.getOffers().subscribe((res) => {
      this.allOffers = res;
      this.filterOffers();
    });
  }

  async filterOffers() {
    const user = await firstValueFrom(this.user$);
    if (this.activeTab === 4 && user) {
      this.offers = this.allOffers.filter((o) => o.userId === user?.id);
    } else if(this.activeTab === 3 && user) {
      this.offers = this.allOffers.filter((o) => o.share);
    }
  }

  onBack() {
    this._router.navigate(['home']);
  }

  onTwitter(tag: string): void {
    if (tag.includes('https://twitter.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://twitter.com/${tag}`;
    this.onLink(url);
  }

  onHudl(tag: string) {
    if (tag.includes('https://www.hudl.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://www.hudl.com/${tag}`;
    this.onLink(url);
  }

  onSport247(tag: string) {
    if (tag.includes('https://www.247sports.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://www.247sports.com/${tag}`;
    this.onLink(url);
  }

  onYoutube(tag:string) {
    if (tag.includes('https://www.youtube.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://www.youtube.com/${tag}`;
    this.onLink(url); 
  }

  onInstagram(tag:string) {
    if (tag.includes('https://www.instagram.com/')) {
      this.onLink(tag);
      return;
    }
    const url = `https://www.instagram.com/${tag}`;
    
    this.onLink(url);  
  }

  selectTab(tabIndex: number) {
    this.activeTab = tabIndex;
    this.activeTabChange.emit(this.activeTab);
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

  onAdd() {
    this._router.navigate(['/offers/add-offers']);
  }

  async onDeleteOffer(name: string) {
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

    const user = await firstValueFrom(this.user$);
    if (user) {
      this._offersService.deleteOfferByName(name, user.id);

      let existOffers;
      if (!(user.completeAddSport && user.appSport === 'secondary')) {
        existOffers = user.offers;
        const updateData = existOffers
          ?.split(',')
          .map((o) => o.trim())
          .filter((o) => o !== name)
          .join(', ');

        this._auth.updateUserData(user.id, { offers: updateData });
      } else {
        existOffers = user.secondarySportOffers;
        const updateData = existOffers
          ?.split(',')
          .map((o) => o.trim())
          .filter((o) => o !== name)
          .join(', ');
        this._auth.updateUserData(user.id, {
          secondarySportOffers: updateData,
        });
      }
    }
  }
}
