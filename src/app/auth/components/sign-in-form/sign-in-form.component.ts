import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.scss'],
})
export class SignInFormComponent implements OnDestroy {
  @Output() signUp = new EventEmitter();
  @Output() signIn = new EventEmitter();
  @Output() loginHelp = new EventEmitter();
  @Output() showForm = new EventEmitter();

  @Input() errors: any = {};
  private _unsubscribeAll: Subject<void> = new Subject();

  signInForm: FormGroup = this._initSignIpForm();
  @Input() showSignInForm: boolean = false;
  firebaseErrorMessage =
    'The email you inputted was already registered in the app. Please make sure you use correct sign-in method!';

  constructor(private _fb: FormBuilder) {}

  onSignUp() {
    this.signUp.emit(null);
  }

  onShowSignInForm() {
    this.showSignInForm = !this.showSignInForm;
    this.showForm.emit(this.showSignInForm);
  }

  onLoginHelp() {
    this.loginHelp.emit(null);
  }

  onSignIn() {
    if (this.signInForm.invalid) {
      return;
    }
    this.signIn.emit(this.signInForm.value);
  }

  private _initSignIpForm(): FormGroup {
    return this._fb.group({
      email: [null, [Validators.email, Validators.required]],
      password: [null, [Validators.required]],
    });
  }

  public ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
