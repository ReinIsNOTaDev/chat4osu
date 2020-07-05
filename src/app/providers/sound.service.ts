import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({ providedIn: 'root' })
export class SoundService {
  constructor() { }

  playSound(sound: string) {
    new Howl({
      src: sound,
      autoplay: true,
      volume: .5
    });
  }
}
