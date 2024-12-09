import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { PLANS } from './const';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  selectedPlan$ = new BehaviorSubject<PLANS | null>(null);

  constructor(private http: HttpClient, private _afs: AngularFirestore) {}

  onStripePurchaseLink(userId: string, plan?: PLANS) {
    const subscriptionUrl = `${environment.apiPaymentURL}/stripe/subscription`;
    const minUrl = `${environment.apiPaymentURL}/stripe/minimal-price`;
    const maxUrl = `${environment.apiPaymentURL}/stripe/maximal-price`;
    let url;
    if (plan === PLANS.MIN) {
      url = minUrl;
    } else if (plan === PLANS.MAX) {
      url = maxUrl;
    } else {
      url = subscriptionUrl
    }
    return this.http.post(url, { uid: userId });
  }

  onStripePurchaseDynamicLink(userId: string, priceId?: string, planId?: number | string, subOrOneTime?: string) {
    const subscriptionUrl = `${environment.apiPaymentURL}/stripe/subscription`;
    const minUrl = `${environment.apiPaymentURL}/stripe/minimal-price`;
    const maxUrl = `${environment.apiPaymentURL}/stripe/maximal-price`;
    const paymentUrl = `${environment.apiPaymentURL}/stripe/payment-dynamic`;
    let url;
    if (subOrOneTime === 'sub') {
      url = subscriptionUrl;
    } else {
      url = paymentUrl
    }
    return this.http.post(url, { uid: userId, price: priceId, planId: planId });
  }

  onPaypalPurchaseLink(userId: string, price: number) {
    const url = `${environment.apiURL}/paypal/payment`;

    return this.http.post(url, { uid: userId, price });
  }

  onStripeUpdatePlan(userId: string) {
    const url = `${environment.apiURL}/stripe/subscription/update `;

    return this.http.post(url, { uid: userId });
  }

  getUserPaymentsLogs(userId: string): Observable<any> {
    const userDoc = this._afs.collection('Users').doc(userId);
    return userDoc
      .collection('PaymentLog', (ref) => {
        let query:
          | firebase.firestore.CollectionReference
          | firebase.firestore.Query = ref;
        query = query.where('status', '==', 'open');
        return query;
      })
      .snapshotChanges()
      .pipe(
        map((res) => {
          return res.map((action) => {
            return {
              ...action.payload.doc.data(),
              id: action.payload.doc.id,
            };
          });
        })
      );
  }

  getUserPayment(userId: string, paymentId: string) {
    const paymentDoc = this._afs
      .collection('Users')
      .doc(userId)
      .collection('PaymentLog')
      .doc(paymentId);

    return paymentDoc.valueChanges();
  }
}
