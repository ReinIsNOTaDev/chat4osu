import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'role' })
export class RolePipe implements PipeTransform {
  OPList = [];

  constructor() { }

  transform(value: string): any {
    if (this.OPList.indexOf(value) !== -1) {
      return 'operator';
    }

    return 'normal';
  }
}
