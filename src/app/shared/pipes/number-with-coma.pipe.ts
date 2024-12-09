import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberWithComa',
})
export class NumberWithComaPipe implements PipeTransform {
  transform(value: number | string, args?: any): any {
    if (value === 0) {
      return '0';
    }
    if (!value) {
      return '';
    }
    if (typeof value === 'number') {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      return value
        .split(',')
        .join('')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
  }
}
