import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { filter, map, Observable, shareReplay } from 'rxjs';
import * as _ from 'lodash';
import firebase from 'firebase/compat/app';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CollegeLibraryService {
  colleges$: Observable<any[]>;
  conferences$: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private _afs: AngularFirestore,
    private _fns: AngularFireFunctions
  ) {}

  getFilteredColleges(filters: any, taggedColleges: any) {
    const url = `${environment.apiURL}/college/filter`;

    // let params = new HttpParams().set('sport', filters.sport);
    let params = new HttpParams().set('sport', filters.sport);

    if (filters.tagged && taggedColleges) {
      for (const name of Object.keys(taggedColleges)) {
        params = params.append('name[]', name);
      }
    } else {
      if (filters.word) {
        params = params.set('text', filters.word);
      } else {
        if (filters.state) {
          params = params.set('state', filters.state);
        }
        if (filters.conference) {
          params = params.set('conference', filters.conference);
        }
        if (filters.division) {
          let divisions: any = [];
          switch (filters.division) {
            case 'D1':
              divisions = ['NCAA D1'];
              break;
            case 'FBS':
              divisions = ['FBS'];
              break;
            case 'FCS':
              divisions = ['FCS'];
              break;
            case 'D2':
              divisions = ['NCAA DII'];
              break;
            case 'D3':
              divisions = ['NCAA DIII'];
              break;
            case 'NAIA':
              divisions = ['NAIA'];
              break;
            case 'JUCO':
              divisions = ['JC', 'JC-D1', 'JC-D2', 'JC-D3'];
              break;
          }
          for (const division of divisions) {
            params = params.append('division[]', division);
          }
        }
      }
    }

    return this.http.get(url, { params }).pipe(
      map((res: any) => {
        return res.colleges.map((college: any) => {
          return {
            ...college,
            id: college.name,
          };
        });
      })
    );
  }

  getCollegeInfo(collegeId: string, sport: string, uid: string) {
    const url = `${environment.apiURL}/college/${collegeId}`;
    let params = new HttpParams().set('sport', sport).set('uid', uid);

    return this.http.get(url, { params }).pipe(
      map((college: any) => {
        return {
          ...college,
          id: college.name,
        };
      })
    );
  }

  getUserConferences(sport: any) {
    if (!this.conferences$) {
      this.conferences$ = this._afs
        .collection('Conferences')
        .snapshotChanges()
        .pipe(
          map((actions) => {
            return actions.map((action: any) => {
              return {
                ...action.payload.doc.data(),
              };
            });
          }),
          shareReplay({ bufferSize: 1, refCount: true })
        );
    }
    return this.conferences$;
  }
}
