import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { PLANS } from '../../const';
import { PaymentService } from '../../payment.service';
import { BehaviorSubject, Subject, firstValueFrom, takeUntil } from 'rxjs';
import { HearAboutDialogComponent } from '../hear-about-dialog/hear-about-dialog.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
})
export class PaymentDialogComponent implements OnInit {
  loading$ = new BehaviorSubject<boolean>(false);
  PLANS = PLANS;
  exampleHighlightUrl = `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/Videos%2Fhighlight-example.mp4?alt=media&time=${Date.now()}`;

  private _unsubscribeAll: Subject<void> = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _payment: PaymentService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
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
}
