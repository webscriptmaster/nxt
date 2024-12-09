import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import {
  BehaviorSubject,
  Observable,
  Subject,
  firstValueFrom,
  map,
  shareReplay,
} from 'rxjs';
import { Plan } from '../models/plan';
import firebase from 'firebase/compat/app';
import { Template } from '../models/prospect';
import { NavigationEnd, Router } from '@angular/router';
import { Location } from '@angular/common';
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private partnerCode = new BehaviorSubject<any>(null);
  code$ = this.partnerCode.asObservable();

  private plansCollection: AngularFirestoreCollection;
  plans$: Observable<Plan[]>;

  private titlesCollection: AngularFirestoreCollection;
  titles$: Observable<any[]>;

  private sentEmailsCollection: AngularFirestoreCollection;
  sentEmails$: Observable<any[]>;

  private questionnairesCollection: AngularFirestoreCollection;
  questionnaires$: Observable<any[]>;

  private campsCollection: AngularFirestoreCollection;
  camps$: Observable<any[]>;

  private unicodeCollection: AngularFirestoreCollection;
  unicodeCollection$: Observable<{}>;

  private listCoachEmails = new BehaviorSubject<any>({
    recipients: 0,
    coaches: [],
  });
  emails$ = this.listCoachEmails.asObservable();

  private setEmailGlobal = new BehaviorSubject<any>([]);
  emailGolbal$ = this.setEmailGlobal.asObservable();

  private setSelectedCollege = new BehaviorSubject<any>([]);
  selectedCollege$ = this.setSelectedCollege.asObservable();

  private progressUpload = new BehaviorSubject<any>({
    progress: 0,
    thumbnai: '',
  });
  progressUpload$ = this.progressUpload.asObservable();

  private cancelPendingRequests$ = new Subject<void>();

  private viewingTemplate = new BehaviorSubject<Template>(null);
  viewingTemplate$ = this.viewingTemplate.asObservable();

  private viewingCategory = new BehaviorSubject<string>(null);
  viewingCategory$ = this.viewingCategory.asObservable();

  private history: string[] = [];
  constructor(
    private _afs: AngularFirestore,
    private router: Router,
    private location: Location
  ) {
    this.plansCollection = this._afs.collection('Plans');
    this.titlesCollection = this._afs.collection('Titles');
    this.sentEmailsCollection = this._afs.collection('SentEmails');
    this.questionnairesCollection = this._afs.collection('Questionnaires');
    this.campsCollection = this._afs.collection('Camps');
    this.unicodeCollection = this._afs.collection('Unicode');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  back(): void {
    this.history.pop();
    if (this.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  getCancelPendingRequests() {
    return this.cancelPendingRequests$.asObservable();
  }

  setProgressUpload(data: any) {
    this.progressUpload.next(data);
  }

  cancelPendingRequests() {
    this.cancelPendingRequests$.next();
    // Optional: Re-create the Subject if you need to reuse it for subsequent cancel requests
    this.cancelPendingRequests$.complete();
    this.cancelPendingRequests$ = new Subject<void>();
  }

  addHearAbout(data: any) {
    this._afs.collection('HearAbout').add(data);
  }

  setPartnerCode(data: any) {
    this.partnerCode.next(data);
  }

  setCoachEmails(data: any) {
    this.listCoachEmails.next(data);
  }

  setEmailGlobalFn(data: any) {
    this.setEmailGlobal.next(data);
  }

  setSelectedCollegeFn(data: any) {
    this.setSelectedCollege.next(data);
  }

  setViewingTemplates(data: any) {
    this.viewingTemplate.next(data);
  }

  setViewingCategory(data: any) {
    this.viewingCategory.next(data);
  }

  getAllPlan() {
    if (!this.plans$) {
      this.plans$ = this.plansCollection.snapshotChanges().pipe(
        map((actions) => {
          return actions
            .map((action: any) => {
              return {
                id: action.payload.doc.id,
                ...action.payload.doc.data(),
              };
            })
            .sort((a: any, b: any) => {
              return a.no - b.no;
            });
        })
      );
    }
    return this.plans$;
  }

  async addSentEmail(data: any) {
    const docRef = await this.sentEmailsCollection.add(data);
    return docRef.id;
  }

  addQuestionnare(data: any) {
    this.questionnairesCollection.add(data);
  }

  addCamp(data: any) {
    this.campsCollection.add(data);
  }

  getAllSentEmails(userId: string) {
    if (!this.sentEmails$) {
      this.sentEmails$ = this.sentEmailsCollection.snapshotChanges().pipe(
        map((actions) => {
          return actions.map((action: any) => {
            return {
              id: action.payload.doc.id,
              ...action.payload.doc.data(),
            };
          });
        })
      );
    }
    return this.sentEmails$;
  }

  async getAllSentEmailsByUserId(userId: string) {
    this.sentEmails$ = await firstValueFrom(
      this._afs
        .collection('SentEmails', (ref) => {
          let query:
            | firebase.firestore.CollectionReference
            | firebase.firestore.Query = ref;
          query = query.where('userId', '==', userId);
          return query;
        })
        .snapshotChanges()
        .pipe(
          map((actions: any) => {
            return actions
              .map((a: any) => {
                return {
                  ...a.payload.doc.data(),
                  id: a.payload.doc.id,
                };
              })
              .sort((a: any, b: any) => {
                return b.date.toMillis() - a.date.toMillis();
              });
          })
        )
    );

    return this.sentEmails$;
  }

  async getAllQuestionnairesByUserId(userId: string) {
    this.questionnaires$ = await firstValueFrom(
      this._afs
        .collection('Questionnaires', (ref) => {
          let query:
            | firebase.firestore.CollectionReference
            | firebase.firestore.Query = ref;
          query = query.where('userId', '==', userId);
          return query;
        })
        .snapshotChanges()
        .pipe(
          map((actions: any) => {
            return actions
              .map((a: any) => {
                return {
                  ...a.payload.doc.data(),
                  id: a.payload.doc.id,
                };
              })
              .sort((a: any, b: any) => {
                return b.date.toMillis() - a.date.toMillis();
              });
          })
        )
    );

    return this.questionnaires$;
  }

  async getAllCampByUserId(userId: string) {
    this.camps$ = await firstValueFrom(
      this._afs
        .collection('Camps', (ref) => {
          let query:
            | firebase.firestore.CollectionReference
            | firebase.firestore.Query = ref;
          query = query.where('userId', '==', userId);
          return query;
        })
        .snapshotChanges()
        .pipe(
          map((actions: any) => {
            return actions
              .map((a: any) => {
                return {
                  ...a.payload.doc.data(),
                  id: a.payload.doc.id,
                };
              })
              .sort((a: any, b: any) => {
                return b.date.toMillis() - a.date.toMillis();
              });
          })
        )
    );

    return this.camps$;
  }

  async deleteCampByName(name: string, userId: string) {
    const camp = (
      await firstValueFrom(
        this._afs
          .collection('Camps', (ref) => {
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

    console.log(camp);

    if (camp) {
      return this.campsCollection.doc(camp.id).delete();
    } else {
      return null;
    }
  }

  getTitle() {
    if (!this.titles$) {
      this.titles$ = this.titlesCollection.snapshotChanges().pipe(
        map((actions) => {
          return actions.map((action: any) => {
            return {
              id: action.payload.doc.id,
              ...action.payload.doc.data(),
            };
          });
        })
      );
    }
    return this.titles$;
  }

  getUnicodes() {
    if (!this.unicodeCollection$) {
      this.unicodeCollection$ = this.unicodeCollection.snapshotChanges().pipe(
        map((actions) => {
          return actions.map((action: any) => {
            return {
              id: action.payload.doc.id,
              ...action.payload.doc.data(),
            };
          });
        })
      );
    }
    return this.unicodeCollection$;
  }

  updateUnicode(id: string, data) {
    this.unicodeCollection.doc(id).update(data);
  }
}
