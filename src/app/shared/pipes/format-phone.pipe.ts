import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPhone',
})
export class FormatPhone implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    let cleaned = value.replace(/\D/g, '');
    let match = cleaned.match(/^(\d{1,3})(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '+' + match[1] + ' (' + match[2] + ') ' + match[3] + '-' + match[4];
    }

    match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return  match[1] + '-' + match[2] + '-' + match[3];
    }

    if (cleaned.length > 10) {
      match = cleaned.match(/^(\d{3})(\d{3})(\d{4})(\d+)$/);
      if (match) {
        return '(' + match[1] + ') ' + match[2] + '-' + match[3] + '-' + match[4];
      }
    } else if (cleaned.length === 10) {
      match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return   match[1] + '-' + match[2] + '-' + match[3];
      }
    } else if (cleaned.length === 7) {
      match = cleaned.match(/^(\d{3})(\d{4})$/);
      if (match) {
        return match[1] + '-' + match[2];
      }
    }

    return value;
  }
}
