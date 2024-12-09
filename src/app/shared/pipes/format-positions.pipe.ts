import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatPositions',
})
export class FormatPositionsPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value
      .map((p: string) =>
        p
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      )
      .join('/');
  }
}
