import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'collegeLogo',
})
export class CollegeLogoPipe implements PipeTransform {
  transform(path: any, args?: any): any {
    return `https://firebasestorage.googleapis.com/v0/b/${environment.firebase.storageBucket}/o/Colleges%2F${path}?alt=media&time=${Date.now()}`;
  }
}
