import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Observable, from, map } from 'rxjs';
import { MustMatch, confirmPassword } from 'src/app/shared/utils';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.scss'],
})
export class SignUpFormComponent implements OnInit {
  @Output() signUp = new EventEmitter();

  @Input() errors: any = {};

  signUpForm: FormGroup;

  isPasswordLengthValid = false;
  isPasswordHasUppercase = false;
  isPasswordHasNumber = false;
  isShowPassword = false;
  isShowConfirmPassword = false;

  // showProviderMessage = false;
  // canCloseProvider = false;
  wrongPasswordError = false;

  constructor(private _fb: FormBuilder, private _auth: AuthService) {}

  ngOnInit() {
    this._initSignUpForm();
  }

  onSignUp(checked = false) {
    if (this.signUpForm.invalid) {
      return;
    }
    // if (
    //   !checked &&
    //   !(
    //     this.signUpForm.value['email'].includes('@gmail') ||
    //     this.signUpForm.value['email'].includes('@hotmail') ||
    //     this.signUpForm.value['email'].includes('@outlook')
    //   )
    // ) {
    //   this.showProviderMessage = true;
    //   setTimeout(() => {
    //     this.canCloseProvider = true;
    //   }, 500);
    //   return;
    // }
    // if (checked) {
    //   this.closeProviderDialog()
    // }
    this.signUp.emit(this.signUpForm.value);
  }

  private _initSignUpForm() {
    this.signUpForm = new FormGroup(
      {
        email: new FormControl('', {
          validators: [Validators.required, Validators.email],
          asyncValidators: this.validate.bind(this),
        }),
        password: new FormControl('', [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{6,}$/),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      confirmPassword()
    );
    this.signUpForm.controls['password'].valueChanges.subscribe((res) => {
      this.isPasswordLengthValid = res.length >= 6;
      this.isPasswordHasNumber = /\d/.test(res);
      this.isPasswordHasUppercase = /[A-Z]/.test(res);
    });
  }

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return from(this._auth.isEmailUniq(control.value.trim())).pipe(
      map((result) => {
        if (result) {
          return null;
        } else {
          return { existEmail: true };
        }
      })
    );
  }

  // closeProviderDialog() {
  //   if (this.canCloseProvider) {
  //     this.showProviderMessage = false;
  //     this.canCloseProvider = false;
  //   }
  // }
}
