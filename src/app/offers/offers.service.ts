import { Injectable } from '@angular/core';
import {
  AngularFirestoreCollection,
  AngularFirestore,
} from '@angular/fire/compat/firestore';
import { Observable, firstValueFrom, map, shareReplay } from 'rxjs';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root',
})
export class OffersService {
  private offersCollection: AngularFirestoreCollection;
  offers$: Observable<any[]>;

  constructor(private _afs: AngularFirestore) {
    this.offersCollection = this._afs.collection('Offers');
  }

  addOffer(offer: any) {
    this.offersCollection.add(offer);
  }

  getOffers() {
    if (!this.offers$) {
      this.offers$ = this.offersCollection.snapshotChanges().pipe(
        map((actions) => {
          return actions
            .map((action: any) => {
              return {
                id: action.payload.doc.id,
                ...action.payload.doc.data(),
              };
            })
            .sort((a: any, b: any) => {
              return b.date.toMillis() - a.date.toMillis();
            });
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
    }
    return this.offers$;
  }

  updateAllOffersByUserId(userId: string, updateData: any): Promise<any> {
    return this._afs.collection('Offers', ref => ref.where('userId', '==', userId)).get().toPromise()
      .then(querySnapshot => {
        const batch = this._afs.firestore.batch();
        querySnapshot?.forEach(doc => {
          const docRef = this.offersCollection.doc(doc.id).ref;
          batch.update(docRef, updateData);
        });
        return batch.commit();
      })
      .catch(error => {
        console.error("Error updating offers: ", error);
        throw error;
      });
  }

  async deleteOfferByName(name: string, userId: string) {
    const offer = (
      await firstValueFrom(
        this._afs
          .collection('Offers', (ref) => {
            let query:
              | firebase.firestore.CollectionReference
              | firebase.firestore.Query = ref;
            query = query.where('collegeName', '==', name);
            query = query.where('userId', '==', userId);
            query = query.limit(1);
            return query;
          })
          .snapshotChanges()
          .pipe(
            map((actions: any) => {
              return actions.map((a: any) => {
                return {
                  ...a.payload.doc.data(),
                  id: a.payload.doc.id,
                };
              });
            })
          )
      )
    )[0];

    if (offer) {
      return this.offersCollection.doc(offer.id).delete();
    } else {
      return null;
    }
  }
}
