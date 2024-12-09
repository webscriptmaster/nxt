import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private templateCollection: AngularFirestoreCollection;
  templates$: Observable<any[]>;

  private templateSource = new BehaviorSubject({});
  currentTemplate$ = this.templateSource.asObservable();

  constructor(
    private _afs: AngularFirestore
  ) {
    this.templateCollection = this._afs.collection('Templates');
  }


  getAllTemplates() {
    if (!this.templates$) {
      this.templates$ = this.templateCollection.snapshotChanges().pipe(
        map((actions) => {
          return actions
            .map((action: any) => {
              return {
                id: action.payload.doc.id,
                ...action.payload.doc.data(),
              };
            })
        })
      );
    }
    return this.templates$;
  }

  changeTemplate(template: string) {
    this.templateSource.next(template);
  }
}
