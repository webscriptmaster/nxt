import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, map } from 'rxjs';

export type SettingsVideoSection = {
  videos: string[];
  titles: string[];
  thumbnails: string[];
};

@Injectable({
  providedIn: 'root',
})
export class Nxt1CenterService {
  private nxt1CenterCollection: AngularFirestoreCollection;
  nxt1Center$: Observable<any[]>;

  private nxt1CenterSource = new BehaviorSubject([]);
  currentCenter$ = this.nxt1CenterSource.asObservable();
  constructor(private _afs: AngularFirestore) {
    this.nxt1CenterCollection = this._afs.collection('NXT1Center');
  }

  getAllNxt1Center() {
    if (!this.nxt1Center$) {
      this.nxt1Center$ = this.nxt1CenterCollection.snapshotChanges().pipe(
        map((item) => {
          return item.map((action: any) => {
            return {
              id: action.payload.doc.id,
              ...action.payload.doc.data(),
            };
          });
        })
      );
    }
    return this.nxt1Center$;
  }

  changeNXT1Center(nxt1Center: any) {
    this.nxt1CenterSource.next(nxt1Center);
  }

  getSettingsVideos(): Observable<SettingsVideoSection | undefined> {
    return this._afs
      .collection<SettingsVideoSection>('Videos')
      .doc('settings_page_section')
      .valueChanges()
      .pipe(
        map((data) => {
          console.log('Settings videos data:', data);
          return data;
        })
      );
  }
}
