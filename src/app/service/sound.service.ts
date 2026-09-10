import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audio = new Audio();
  public soundEnded$ = new Subject<void>();

  public playSound(blob: Blob) {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = URL.createObjectURL(blob);

    this.audio.onended = null;

    this.audio.onended = () => {
      this.soundEnded$.next();
    };

    this.audio.play().catch(err => {
      console.warn('Audio playback error:', err);
    });
  }
}
