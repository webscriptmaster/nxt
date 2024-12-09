import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sportImg',
})
export class SportImgPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const arr = value.split(' ').map((w: string) => w.toLowerCase());
    if (
      value.includes('track & field') ||
      value.includes('gymnastics') ||
      value.includes('swimming & diving')
    ) {
      const sport = arr.join('_');
      return `./assets/images/sports/${sport}.png`;
    } else {
      const sport = arr
        .filter((w: string) => w !== 'mens' && w !== 'womens')
        .join('_');
      return `./assets/images/sports/${sport}.png`;
    }
  }
}
