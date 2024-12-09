import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';
import { Profile, ProspectProfile } from '../models/prospect';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private prospectProfileCollection: AngularFirestoreCollection;
  prospectProfileCollection$: Observable<ProspectProfile[]>;

  constructor(
    private _afs: AngularFirestore,
    private http: HttpClient,
    private storage: AngularFireStorage
  ) {
    this.prospectProfileCollection = this._afs.collection('ProspectProfiles');
  }

  getProspectProfiles(): Observable<ProspectProfile[]> {
    if (!this.prospectProfileCollection$) {
      this.prospectProfileCollection$ = this.prospectProfileCollection
        .snapshotChanges()
        .pipe(
          map((actions) => {
            return actions
              .map((action: any) => {
                const data = {
                  id: action.payload.doc.id,
                  ...action.payload.doc.data(),
                };

                if (data.profiles && Array.isArray(data.profiles)) {
                  data.profiles = data.profiles.sort(
                    (a: any, b: any) => a.order - b.order
                  );
                }
                return data;
              })
              .sort((a: any, b: any) => {
                return a.order - b.order;
              });
          })
        );
    }
    return this.prospectProfileCollection$;
  }

  getDefaultProfile(): Observable<Profile | null> {
    return this.prospectProfileCollection.snapshotChanges().pipe(
      map((actions) => {
        for (let action of actions) {
          const data: any = {
            id: action.payload.doc.id,
            ...action.payload.doc.data(),
          };

          if (data.profiles && Array.isArray(data.profiles)) {
            const foundProfile = data.profiles.find(
              (profile: Profile) => profile.isStarting
            );
            if (foundProfile) {
              return foundProfile;
            }
          }
        }
        return null;
      })
    );
  }

  getProfileById(profileId: string): Observable<Profile | null> {
    return this.prospectProfileCollection.snapshotChanges().pipe(
      map((actions) => {
        for (let action of actions) {
          const data: any = {
            id: action.payload.doc.id,
            ...action.payload.doc.data(),
          };

          if (data.profiles && Array.isArray(data.profiles)) {
            const foundProfile = data.profiles.find((profile: Profile) => {
              return profile.id === profileId;
            });
            if (foundProfile) {
              foundProfile.categoryName = data.name;
              return foundProfile;
            }
          }
        }
        return null;
      })
    );
  }

  getUserDataByCode(code: string, emailCode: string): Observable<any> {
    const url = `${environment.apiURL}/prospect-profile/user`;
    return this.http.post(url, { code, emailCode });
  }

  crawlData(code: string): Observable<any> {
    const url = `${environment.apiURL}/prospect-profile/user/${code}`;
    return this.http.get(url);
  }

  getUserData(userId: string): Observable<any> {
    const url = `${environment.apiURL}/prospect-profile/${userId}`;
    return this.http.get(url);
  }

  fetchSVGContent(queryUrl: string): Observable<string> {
    const url = `${environment.apiURL}/prospect-profile/fetch-svg`;
    return this.http.post<string>(url, { queryUrl });
  }

  createOwnProfileThumbnail(
    userId: string,
    isLive: boolean,
    svgString: string,
    bgUrl: string
  ): Observable<{ thumbnailUrl: string }> {
    const url = `${environment.apiURL}/prospect-profile/thumbnail`;
    return this.http.post<{ thumbnailUrl: string }>(url, {
      userId,
      isLive,
      svgString,
      bgUrl,
    });
  }

  markAsFavorited(cateId: string, data: ProspectProfile) {
    this.prospectProfileCollection.doc(cateId).update(data);
  }

  async convertImageToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'));
      };
      reader.readAsDataURL(blob);
    });
  }

  deleteFilebyUrl(url: string): Promise<void> {
    const gcsBaseUrl =
      'https://storage.googleapis.com/nxt-1-staging.appspot.com/';
    const firebaseBaseUrl =
      'https://firebasestorage.googleapis.com/v0/b/nxt-1-staging.appspot.com/o/';

    let filePath: string | undefined;

    if (url.includes(gcsBaseUrl)) {
      const pathWithEncodedCharacters = url.split(gcsBaseUrl)[1]?.split('?')[0];
      filePath = decodeURIComponent(pathWithEncodedCharacters || '');
    } else if (url.includes(firebaseBaseUrl)) {
      const pathWithEncodedCharacters = url
        .split(firebaseBaseUrl)[1]
        ?.split('?')[0];
      filePath = decodeURIComponent(pathWithEncodedCharacters || '');
    }

    const whiteList = [
      'UserTemplates',
      'UserProspectProfiles',
      'HighLightVideos',
    ];

    if (
      filePath &&
      whiteList.some((allowedPath) => filePath.startsWith(allowedPath))
    ) {
      const fileRef = this.storage.ref(filePath);
      return fileRef
        .delete()
        .toPromise()
        .catch((error) => {
          if (error.code === 'storage/object-not-found') {
            console.warn(
              `File '${filePath}' does not exist, skipping deletion.`
            );
            return Promise.resolve();
          } else {
            return Promise.reject(error);
          }
        });
    } else {
      return Promise.reject('Invalid URL');
    }
  }
}
