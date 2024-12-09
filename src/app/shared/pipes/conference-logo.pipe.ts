import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'conferenceLogo',
})
export class ConferenceLogoPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    const name = value.conference
      ? value.conference.replace(/\s/g, '').replace('-', '')
      : null;
    return `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/Conferences%2F${name}.png?alt=media&time=${Date.now()}`;
  }
}
