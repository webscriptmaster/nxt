import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SportCell {
  name: string, icon: string
}

@Injectable({
  providedIn: 'root',
})
export class SportService {
  sports$: Observable<any>;

  constructor(private _afs: AngularFirestore) {}

  getSportsSettings$() {
    if (!this.sports$) {
      this.sports$ = this._afs
        .collection('Sports')
        .snapshotChanges()
        .pipe(
          map((actions: Array<any>) => {
            const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/Sports%2F`;
            const sports = actions.map((action: any) => {
              return {
                id: action.payload.doc.id,
                ...action.payload.doc.data(),
              };
            });
            return sports.reduce((acc, val) => {
              val['icon'] = `${baseUrl}${
                val['icon']
              }?alt=media&time=${Date.now()}`;
              acc[val.app_sport] = val;
              return acc;
            }, {});
          }),
          shareReplay({ bufferSize: 1, refCount: true })
        );
    }
    return this.sports$;
  }

  getAcademicCategorySettings$() {
    return this._afs
      .collection('AcademicCategories')
      .snapshotChanges()
      .pipe(
        map((actions: Array<any>) => {
          const sports = actions.map((action: any) => {
            return {
              id: action.payload.doc.id,
              ...action.payload.doc.data(),
            };
          });
          
          return sports[0].categories;
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  getOrderedSports(sports: any) {
    const sportsArray = Object.keys(sports).map((key) => sports[key]);
    const orderedSports = sportsArray.sort((a, b) => a.order - b.order);
    return orderedSports.map((s) => {
      return {
        name: s.app_sport,
        icon: s.icon,
      };
    });
  }
}
