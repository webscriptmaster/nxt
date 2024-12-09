import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatHeight',
})
export class FormatHeightPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const feet = Math.trunc(value / 12);
    const inches = value % 12;
    return `${feet}’${inches}`;
  }
}
