import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  showSidenav$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  openSideNav() {
    this.showSidenav$.next(true);
  }

  closeSidenav() {
    this.showSidenav$.next(false);
  }
}
