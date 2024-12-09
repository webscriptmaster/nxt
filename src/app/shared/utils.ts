import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function MustMatch(
  controlName: string,
  matchingControlName: string
): ValidationErrors | null {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      // return if another validator has already found an error on the matchingControl
      return null;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
      return { mustMatch: true };
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  };
}

export function confirmPassword(): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password !== confirmPassword ? { confirmPassword: true } : null;
  };
}

export function transformToCollegeSport(userSport: string) {
  const mens = userSport?.split(' ').some((w: string) => w === 'mens');
  const womens = userSport?.split(' ').some((w: string) => w === 'womens');

  let sportValue = userSport
    ?.split(' ')
    .filter((v: string) => v !== 'mens' && v !== 'womens')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  switch (sportValue) {
    case 'Track & Field':
      sportValue = 'Track';
      break;
    case 'Swimming & Diving':
      sportValue = 'Swimming';
      break;
    default:
      break;
  }

  return mens
    ? `Men's ${sportValue}`
    : womens
    ? `Women's ${sportValue}`
    : sportValue;
}

export function splitArrayOnChunk(array: any, chunkSize = 5) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
}

export function openLink(url: string) {
  return new Promise((res, rej) => {
    if (!url) {
      rej(null);
    }
    setTimeout(() => {
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        link.remove();
        res(url);
      } else {
        res(null);
      }
    }, 0);
  });
}

export function noWhitespaceValidator(control: AbstractControl) {
  const isSpace = control.value && control.value.trim().length === 0;
  return isSpace ? { whitespace: true } : null;
}
