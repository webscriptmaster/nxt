import { User } from '../models/user';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import {
  BehaviorSubject,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
} from 'rxjs';
import firebase from 'firebase/compat/app';
import { PLANS } from '../shared/const';
import { getAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection;
  private codesCollection: AngularFirestoreCollection;

  user$ = new BehaviorSubject<User | null>(null);
  userData$: Observable<User>;
  private authState$ = new BehaviorSubject<any | null>(null);
  resetPasswordEmailSended$ = new BehaviorSubject<boolean>(false);

  signUpEmail: string | null = null;

  referralId: string;

  signUpSkipStatsShowed = false;
  signUpSkipOffersShowed = false;
  signUpSkipParentShowed = false;
  addSportSkipStatsShowed = false;
  addSportSkipOffersShowed = false;

  authToken: string | undefined;
  activeFCMToken: string | undefined | null;

  constructor(
    private _afAuth: AngularFireAuth,
    private _afs: AngularFirestore
  ) {
    this.usersCollection = _afs.collection('Users');
    this.codesCollection = _afs.collection('Codes');

    this.authState$
      .asObservable()
      .pipe(
        switchMap((user) => {
          if (user) {
            this.userData$ = this.getUserById(user.uid).pipe(
              shareReplay({ bufferSize: 1, refCount: true })
            );
            return this.userData$;
          } else {
            return of(null);
          }
        })
      )
      .subscribe((userData) => {
        if (userData) {
          this.user$.next(userData);
          localStorage.setItem(
            'user',
            JSON.stringify({
              email: userData.email,
              id: userData.id,
            })
          );
        } else {
          localStorage.setItem('user', '');
          this.user$.next(null);
        }
      });

    getAuth().onAuthStateChanged(
      async (user) => {
        this.authState$.next(user);
        this.authToken = await user?.getIdToken();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getUserById(id: string) {
    const userRef: AngularFirestoreDocument<any> = this._afs.doc(`Users/${id}`);
    return userRef.snapshotChanges().pipe(
      map((actions: any) => {
        if (actions && actions.payload.exists) {
          return {
            ...actions.payload.data(),
            id: actions.payload.id,
          };
        } else {
          return null;
        }
      })
    );
  }

  getAllUsers() {
    return this._afs
      .collection('Users')
      .snapshotChanges()
      .pipe(
        map((actions: any) => {
          return actions.map((action: any) => {
            return {
              ...action.payload.doc.data(),
              id: action.payload.doc.id,
            };
          });
        })
      );
  }

  async getUserByConnectedEmail(email: string) {
    const user = (
      await firstValueFrom(
        this._afs
          .collection('Users', (ref) => {
            let query:
              | firebase.firestore.CollectionReference
              | firebase.firestore.Query = ref;
            query = query.where('connectedEmail', '==', email);
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

    return user;
  }

  async getUserByEmail(email: string) {
    const user = (
      await firstValueFrom(
        this._afs
          .collection('Users', (ref) => {
            let query:
              | firebase.firestore.CollectionReference
              | firebase.firestore.Query = ref;
            query = query.where('email', '==', email);
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

    return user;
  }

  // Sign in with email/password
  SignIn({ email, password }: { email: string; password: string }) {
    return this._afAuth.signInWithEmailAndPassword(email, password);
  }

  // Sign up with email/password
  SignUp({ email, password }: { email: string; password: string }) {
    return this._afAuth.createUserWithEmailAndPassword(email, password);
  }

  // Sign out
  async SignOut() {
    return this._afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.user$.next(null);
    });
  }

  // Create User
  createFbUser({ uid, email }: { uid: string; email: string }) {
    return this.usersCollection.doc(uid).set({
      email,
      createdAt: new Date(),
      credits: 3,
      lastActivatedPlan: PLANS.TRIAL,
    });
  }

  createFbCode({ uid, partnerCode }: { uid: string; partnerCode: string }) {
    return this.codesCollection.doc(uid).set({
      startDate: new Date(),
      expireDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      partnerCode,
    });
  }

  getAllCodes() {
    return this._afs
      .collection('Codes')
      .snapshotChanges()
      .pipe(
        map((actions: any) => {
          return actions.map((action: any) => {
            return {
              ...action.payload.doc.data(),
              id: action.payload.doc.id,
            };
          });
        })
      );
  }

  updateUserData(uid: string, data: any) {
    return this.usersCollection.doc(uid).update(data);
  }

  // Send Reset Passwod Email
  resetPasswordEmail(email: string) {
    return this._afAuth.sendPasswordResetEmail(email);
  }

  get isLoggedIn(): boolean {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user !== null ? true : false;
    } else {
      return false;
    }
  }

  isEmailUniq(email: string) {
    return firstValueFrom(
      this._afs
        .collection('Users', (ref) => {
          let query:
            | firebase.firestore.CollectionReference
            | firebase.firestore.Query = ref;
          query = query.where('email', '==', email);
          query = query.limit(1);
          return query;
        })
        .valueChanges()
        .pipe(
          map((arr: any[]) => {
            if (arr.length) {
              return false;
            } else {
              return true;
            }
          })
        )
    );
  }

  isEmailUniq$(email: string) {
    return this._afs
      .collection('Users', (ref) => {
        let query:
          | firebase.firestore.CollectionReference
          | firebase.firestore.Query = ref;
        query = query.where('email', '==', email);
        query = query.limit(1);
        return query;
      })
      .valueChanges()
      .pipe(
        map((arr: any[]) => {
          if (arr.length) {
            return false;
          } else {
            return true;
          }
        })
      );
  }

  async updateUserByEmail(email: string, token: string) {
    const user = (
      await firstValueFrom(
        this._afs
          .collection('Users', (ref) => {
            let query:
              | firebase.firestore.CollectionReference
              | firebase.firestore.Query = ref;
            query = query.where('email', '==', email);
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

    if (user) {
      return this.usersCollection
        .doc(user.id)
        .update({ connectedGmailToken: token });
    } else {
      return null;
    }
  }

  async addReferral(referralId: string, userId: string) {
    const candidate: User = await firstValueFrom(
      (
        this._afs
          .collection('Users')
          .doc(referralId)
          .valueChanges() as Observable<User>
      ).pipe(take(1))
    );
    if (candidate) {
      const data = {
        userId,
        date: new Date(),
        status: 'pending',
      };
      let referrals = [];
      if (candidate.referrals) {
        referrals = [...candidate.referrals, data];
      } else {
        referrals = [data];
      }

      this._afs.collection('Users').doc(referralId).update({ referrals });
    }
  }

  userExists(uid: string): Observable<boolean> {
    const userRef: AngularFirestoreDocument<any> = this._afs.doc(
      `Users/${uid}`
    );
    return userRef
      .snapshotChanges()
      .pipe(map((actions: any) => actions.payload.exists));
  }
}
