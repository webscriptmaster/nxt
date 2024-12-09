import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { BehaviorSubject, firstValueFrom, of } from 'rxjs';
import { catchError, filter, take, throttleTime } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

declare var pwaToken: any;

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  currentMessage = new BehaviorSubject<any>(null);

  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private authService: AuthService,
    private _fns: AngularFireFunctions
  ) {
    this.angularFireMessaging.messages.subscribe((msgings: any) => {
      msgings.onMessage = msgings.onMessage.bind(msgings);
      msgings.onTokenRefresh = msgings.onTokenRefresh.bind(msgings);
    });
  }

  private updateToken(token: string | null) {
    this.afAuth.authState.subscribe(async (user) => {
      if (!user) return;

      const userRef: AngularFirestoreDocument<any> = this.afs.doc(
        `Users/${user.uid}`
      );
      const tokenForUpdate = pwaToken ? pwaToken : token;
      this._fns
        .httpsCallable('subscribeToTopic')({
          token: tokenForUpdate,
          topic: 'global',
        })
        .subscribe();
      await userRef.update({ fcmToken: tokenForUpdate });
      this.authService.activeFCMToken = tokenForUpdate;
    });
  }

  requestPermission() {
    this.angularFireMessaging.requestToken
      .pipe(catchError((err) => of(null)))
      .subscribe((token) => {
        this.updateToken(token);
      });
  }

  async receiveMessage() {
    const userData = await firstValueFrom(
      this.authService.user$.pipe(filter((user) => !!user))
    );
    if (!(userData && userData.fcmToken)) {
      return;
    }
    this.angularFireMessaging.messages
      .pipe(throttleTime(1000))
      .subscribe((msg) => {
        this.currentMessage.next(msg);
      });
  }
}
