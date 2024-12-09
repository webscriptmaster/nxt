import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sportWrap',
})
export class SportWrapPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value) {
      const arr = value.split(' ').map((w: string) => w.toLowerCase());
      const index = arr.findIndex((w: string) => w === 'mens' || w === 'womens');
  
      if (index >= 0) {
        arr.splice(index, 0, `\n`);
      }
      const stringWithLineBreak = arr.join(' ');
  
      return stringWithLineBreak
        .split('\n')
        .map((w: string) => w.trim())
        .join(`\n`);
    } else {
      return '';
    }
   
  }
}
