import {
  BehaviorSubject,
  firstValueFrom,
  map,
  Observable,
  shareReplay,
  Subject,
} from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export type EmailVideo = {
  video: string;
  title: string;
  thumbnail: string;
  subtitle: string;
};

@Injectable({
  providedIn: 'root',
})
export class CreateEmailService {
  sentEmailRespose$ = new BehaviorSubject<any>(null);
  selectedContacts$ = new BehaviorSubject<any>([]);

  drafts$: Observable<any[]>;

  sentEmailResults$ = new Subject();

  constructor(private _afs: AngularFirestore, private http: HttpClient) {}

  setSelectedContacts(contacts: any) {
    this.selectedContacts$.next(contacts);
  }

  saveDrafts(userId: any, templates: any) {
    this._afs
      .collection('Users')
      .doc(userId)
      .collection('Drafts')
      .add({ templates });
  }

  getDrafts(userId: any) {
    if (!this.drafts$) {
      this.drafts$ = this._afs
        .collection('Users')
        .doc(userId)
        .collection('Drafts')
        .snapshotChanges()
        .pipe(
          map((actions) => {
            return actions.map((action: any) => {
              return {
                id: action.payload.doc.id,
                ...action.payload.doc.data(),
              };
            });
          }),
          shareReplay({ bufferSize: 1, refCount: true })
        );
    }
    return this.drafts$;
  }

  updateDraft(userId: any, draftId: any, templates: any) {
    this._afs
      .collection('Users')
      .doc(userId)
      .collection('Drafts')
      .doc(draftId)
      .update({ templates });
  }

  deleteDraft(userId: any, draftId: any) {
    this._afs
      .collection('Users')
      .doc(userId)
      .collection('Drafts')
      .doc(draftId)
      .delete();
  }

  setSentEmailResponse() {
    this.sentEmailRespose$.next(true);
  }

  clearSentEmailResponse() {
    this.sentEmailRespose$.next(null);
  }

  async getConnectURL(id: string, provider: string) {
    let url;
    if (provider === 'microsoft') {
      url = await firstValueFrom(
        this.http.get<string>(
          `${environment.apiURL}/microsoft/code?id=${id}&time=${Date.now()}`
        )
      );
    } else if (provider === 'gmail') {
      url = await firstValueFrom(
        this.http.get<string>(
          `${environment.apiURL}/gmail/code?id=${id}&time=${Date.now()}`
        )
      );
    }

    return url;
  }

  async getTokenFromCode(code: string) {
    const url = `${window.location.origin}/connect`;

    return firstValueFrom(
      this.http.post(`${environment.apiURL}/gmail/token`, { code: code, url })
    );
  }

  sendMessage(data: any, provider: 'gmail' | 'microsoft') {
    console.log(data);
    return this.http.post(`${environment.apiURL}/${provider}/message`, {
      data,
    });
  }

  getEmailVideo(): Observable<EmailVideo | undefined> {
    return this._afs
      .collection<EmailVideo>('Videos')
      .doc('email_page_section')
      .valueChanges();
  }
}
