import { Injectable } from '@angular/core';
import { Howl } from 'howler';

@Injectable({ providedIn: 'root' })
export class SoundService {
  constructor() { }

  playSound(sound: string) {
    const s = new Howl({
      src: sound,
      volume: .5
    });

    s.play();
  }
}
