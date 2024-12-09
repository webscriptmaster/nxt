import {Injectable} from '@angular/core';
import {HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {AuthService} from './auth/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { SharedService } from './shared/shared.service';

@Injectable()
export class BackendInterceptor implements HttpInterceptor {
  token: null | string;
  private cancelPendingRequests$ = new Subject<void>();

  constructor(private _auth: AuthService, private apiCancelService: SharedService) {

  }

 intercept(request: HttpRequest<unknown>, next: HttpHandler) {
    if (this._auth.authToken) {
      const cloned = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${this._auth.authToken}`),
      });
      // return next.handle(cloned);

      return next.handle(cloned).pipe(
        takeUntil(this.apiCancelService.getCancelPendingRequests())
      );
    } else {
      // return next.handle(request);
      return next.handle(request).pipe(
        takeUntil(this.apiCancelService.getCancelPendingRequests())
      );
    }
  }
}
