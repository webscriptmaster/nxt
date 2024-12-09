import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { PAYMENT_TYPE, PLANS } from '../../const';
import { PaymentService } from '../../payment.service';
import { HearAboutDialogComponent } from '../hear-about-dialog/hear-about-dialog.component';
import { SharedService } from '../../shared.service';
import { Plan } from 'src/app/models/plan';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-purchase-dialog',
  templateUrl: './purchase-dialog.component.html',
  styleUrls: ['./purchase-dialog.component.scss'],
  // encapsulation: ViewEncapsulation.None,
})
export class PurchaseDialogComponent implements OnInit {

  private _unsubscribeAll: Subject<void> = new Subject<void>();
  listPlan: Plan[];
  listPlanOrigin: Plan[];
  haveIt: any[] = [];
  PLANS = PLANS;
  PAYMENT_TYPE = PAYMENT_TYPE;
  numberOfStar = 15;
  currentOption: any;
  titles: any = {
    header1: '',
    header2: '',
    sales: '',
    id: ''
  }
  isActiveMonthly: boolean = false;
  isActiveYearly: boolean = true;
  loading$ = new BehaviorSubject<boolean>(false);
  constructor(
    private _payment: PaymentService,
    private shareService: SharedService,
    private _dialog: MatDialog,
    public dialogRef: MatDialogRef<PurchaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {}
  
  ngOnInit(): void {
    this.getAllPlan();
    this.getTitle();
  }

  onBack(): void {
  }

  getAllPlan(): void {
    this.shareService.getAllPlan().subscribe(res => {
      res.forEach((item: any, i: number) => {
        this.haveIt = [];
        for (const prop in item) {
          if(prop === 'features') {
            item.features = this.sanitizer.bypassSecurityTrustHtml(this.addImage(item.features));
          }
          if (prop === 'period') {
            for(const type of PAYMENT_TYPE) {
              if (item[prop] === type.id) {
                item.periodText = '/' + type.text;
              }
            }
          }
        }
        item.isActiveMonthly = false;
        item.isActiveYearly = true;
        item.currentOption = {
          price: res[i].priceId,
          planId: res[i].planId,
          paymentType: 'year'
        }
      })
      this.listPlan = res;
      this.listPlanOrigin = JSON.parse(JSON.stringify(this.listPlan));
    })
  }

  addImage(htmlContent: string ): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html')
    const ulElement = doc.querySelectorAll('ul');

    ulElement.forEach(ul => {
      const liElement = ul.querySelectorAll('li');
      liElement.forEach(li => {
        // Create a new span element
        const spanWrapper = doc.createElement('span');

        // Move existing content of the li into the new span
        while (li.firstChild) {
          spanWrapper.appendChild(li.firstChild);
        }

        const img = doc.createElement('img');
        img.setAttribute('src', `assets/images/purchase/star${this.getRandomInt(this.numberOfStar)}.svg`);
        img.setAttribute('alt', '');
        // img.setAttribute('width', '20');
        // img.setAttribute('height', '60');

        // Append the image into the li
        li.appendChild(img);

        // li.insertBefore(img, li.firstChild);
        // Append the span with existing content into the li
        li.appendChild(spanWrapper);
      })
    })
    return doc.documentElement.innerHTML
  }

  getRandomInt(max: number): any {
    let random: any = (Math.random() * max).toFixed();
    random = Number(random);
    if(!this.haveIt.includes(random)) {
      this.haveIt.push(random);
        return random;
    } else {
      if(this.haveIt.length > max) {
        return false;
      }
      return this.getRandomInt(max);
    }
  }

  async onPay(plan: PLANS) {
    let paymentLink;
    let currentTransaction;
    let transactionId;
    const userId = this.data.user.id;

    if (!userId) {
      return;
    }

    this.loading$.next(true);
    const logs = await firstValueFrom(
      this._payment.getUserPaymentsLogs(userId)
    );

    if (logs) {
      currentTransaction = logs
        .filter((log: any) => log.type === plan)
        .filter((log: any) => {
          return Date.now() < log.expires_at.toDate().getTime();
        })
        .find((log: any) => {
          return log.provider === 'Stripe';
        });
    }

    if (currentTransaction) {
      paymentLink = currentTransaction.link;
      transactionId = currentTransaction.id;
    } else {
      const transaction: any = await firstValueFrom(
        this._payment.onStripePurchaseLink(userId, plan!)
      );
      paymentLink = transaction.link;
      transactionId = transaction.doc;
    }

    if (paymentLink && transactionId) {
      this._payment
        .getUserPayment(userId, transactionId)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: any) => {
          if (res.status === 'completed') {
            this.dialogRef.close();
            if (this.data.user.showedHearAbout) {
              return;
            }
            this._dialog.open(HearAboutDialogComponent);
          }
        });

      this.openLink(paymentLink);
      this.loading$.next(false);
    }
  }
  async onPayDynamic(price: string, period: string | undefined, planId: string | undefined, paymentType: string, currentOption: any) {
    let paymentLink;
    let currentTransaction;
    let transactionId;
    const userId = this.data.user.id;

    if (!userId) {
      return;
    }

    this.loading$.next(true);
    const logs = await firstValueFrom(
      this._payment.getUserPaymentsLogs(userId)
    );

    if (logs) {
      currentTransaction = logs
        .filter((log: any) => log.type === price)
        .filter((log: any) => {
          return Date.now() < log.expires_at.toDate().getTime();
        })
        .find((log: any) => {
          return log.provider === 'Stripe';
        });
    }

    if (currentTransaction) {
      paymentLink = currentTransaction.link;
      transactionId = currentTransaction.id;
    } else {
      const currentPrice = currentOption.price;
      console.log(currentOption);
      
      if (['/per year', '/per month'].includes(paymentType.toLowerCase())) {
        const transaction: any = await firstValueFrom(
          this._payment.onStripePurchaseDynamicLink(userId, period === 'year' ? currentPrice! : price!, planId, 'sub')
        );
        paymentLink = transaction.link;
        transactionId = transaction.doc;
      } else {
        const transaction: any = await firstValueFrom(
          this._payment.onStripePurchaseDynamicLink(userId, period === 'year' ? currentPrice! : price, planId, '')
        );
        paymentLink = transaction.link;
        transactionId = transaction.doc;
      }
    }

    if (paymentLink && transactionId) {
      this._payment
        .getUserPayment(userId, transactionId)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res: any) => {
          if (res.status === 'completed') {
            this.dialogRef.close();
            if (this.data.user.showedHearAbout) {
              return;
            }
            this._dialog.open(HearAboutDialogComponent);
          }
        });

      this.openLink(paymentLink);
      this.loading$.next(false);
    }
  }

  changeOption(index: number, price: string, planId: string | undefined, paymentType: string) {
    if (paymentType === PAYMENT_TYPE[1].id) {
      this.listPlan[index].isActiveMonthly = true;
      this.listPlan[index].isActiveYearly = false;
      this.listPlan[index].oldPrice = (this.parseToNumber(this.listPlan[index].oldPrice) / 12).toFixed(2);
      this.listPlan[index].price = (this.parseToNumber(this.listPlan[index].price) / 12).toFixed(2);
      this.listPlan[index].periodText = '/per month';
      this.listPlan[index].currentOption = {price, planId, paymentType};
    } 
    if (paymentType === PAYMENT_TYPE[2].id) {
      this.listPlan[index].isActiveMonthly = false;
      this.listPlan[index].isActiveYearly = true;
      this.listPlan[index] = JSON.parse(JSON.stringify(this.listPlanOrigin[index]));
    }
    console.log(this.listPlan[index]);
    
    // this.currentOption = {price, planId, paymentType};
  }

  parseToNumber(input: any) {
    return parseInt(input);
  }

  openLink(url: any) {
    return new Promise((res, rej) => {
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

  getTitle(): void {
    this.shareService.getTitle().subscribe(res => {
      this.titles = res[0];
      this.titles.header1 = this.sanitizer.bypassSecurityTrustHtml(this.titles.header1);
      this.titles.header2 = this.sanitizer.bypassSecurityTrustHtml(this.titles.header2);
      this.titles.sales = this.sanitizer.bypassSecurityTrustHtml(this.titles.sales);
    })
  }

}
