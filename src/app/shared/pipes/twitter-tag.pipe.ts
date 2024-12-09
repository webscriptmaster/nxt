import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'twitterTag',
})
export class TwitterTagPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const regex = /^https?:\/\/(?:www\.)?twitter\.com\/(?:#!\/)?(\w+)\/?.*$/;
    const match = value.match(regex);
    if (match) {
      return `@${match[1]}`;
    }
    return value;
  }
}
