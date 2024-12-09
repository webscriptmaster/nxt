import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

export type SettingsVideoSection = {
  videos: string[];
  titles: string[];
  thumbnails: string[];
};
export interface Faq {
  index: number;
  title: string;
  body: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(private _afs: AngularFirestore) {}

  getSettingsVideos(): Observable<SettingsVideoSection | undefined> {
    return this._afs
      .collection<SettingsVideoSection>('Videos')
      .doc('settings_page_section')
      .valueChanges();
  }

  getFaq(): Observable<Faq[]> {
    return this._afs.collection<Faq>('FAQ').valueChanges();
  }
}
