import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'collegeDivision',
})
export class CollegeDivisionPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value === 'NCAA D1') {
      return 'D1';
    }
    if (value === 'NCAA DII') {
      return 'D2';
    }
    if (value === 'NCAA DIII') {
      return 'D3';
    }
    if (value === 'NAIA') {
      return 'NAIA';
    }
    if (value.includes('JC')) {
      return 'JUCO';
    }

    return value;
  }
}
