import {Component, OnDestroy, OnInit} from '@angular/core';
import {Word} from "../../model/word";
import {MatButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {AttachmentService} from "../../service/attachment.service";
import {WordService} from "../../service/word.service";
import {Progress} from "../../model/progress";
import {StorageService} from "../../service/storage.service";
import {MatProgressBar} from "@angular/material/progress-bar";
import {Attachment} from "../../model/attachment";
import {UserService} from "../../service/user.service";
import {User} from "../../model/user";
import {Settings} from "../../model/settings";
import {StorageKey} from "../../enum/storage-key";
import {SoundService} from "../../service/sound.service";
import {HistoryService} from "../../service/history.service";
import {Subscription} from "rxjs";
import {ReinforcementService} from "../../service/reinforcement.service";


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    MatSlideToggle,
    NgForOf,
    NgIf,
    FormsModule,
    NgClass,
    MatProgressBar
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {
  private MAX_CACHE_SIZE = 4;
  private audioCache = new Map<string, Uint8Array>();
  private soundSub?: Subscription;
  polishBlobSound = new Blob();
  englishBlobSound = new Blob();
  user?: User | null;
  answers: string[] = [];
  currentWord!: Word;
  displayWord = '';
  correctAnswerCounter: number = 0;
  inCorrectAnswerCounter: number = 0;
  allAnswerCounter: number = 0;
  startCount: number = 3;
  isReinforcement = false;
  count!: number;
  settings = false;
  autoNext = true;
  autoRead = true;
  isLoading = false;
  newShuffle = false;
  buttonStatuses: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  reinforcementRepetitionCount: number = 10
  actualWrongAnswersCount: number = 0
  englishToPolish = true;
  progressValue = 0;
  buttonRows: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8]
  ];

  constructor(private readonly attachmentService: AttachmentService,
              private readonly wordService: WordService,
              private readonly userService: UserService,
              private readonly storageService: StorageService,
              private readonly historyService: HistoryService,
              private readonly reinforcementService: ReinforcementService,
              private readonly soundService: SoundService) {
  }

  ngOnInit() {
    this.getUser();
    this.settingInit();
    this.getRandom();
  }

  ngOnDestroy() {
    this.soundSub?.unsubscribe();
  }

  getUser() {
    this.userService.user$.subscribe((user) => {
      this.user = user;
      this.getActualWrongAnswersCount();
    });
  }

  getActualWrongAnswersCount() {
    if (this.user!.id! > 0) {
      this.historyService.getActualWrongAnswersCount(this.getUserId()).subscribe(res => {
        this.actualWrongAnswersCount = res;
        this.setProgressBarValue();
      })
    }
  }

  getRandom() {
    this.setRandLanguage();
    this.getWord()
  }

  private getCount() {
    const progress = this.storageService.getProgress();

    if (!progress) return;
    this.correctAnswerCounter = progress.correct;
    this.inCorrectAnswerCounter = progress.inCorrect;
    this.allAnswerCounter = progress.allAnswerCounter;

    const today = new Date().toISOString().split('T')[0];
    if (today > progress.date) {
      this.storageService.removeProgress();
    }

  }

  private getWord() {
    this.wordService.getRandomWords(this.getUserId(), this.reinforcementRepetitionCount).subscribe((words: Word[]) => {
      this.currentWord = words[0];
      this.setWords(words);
      this.getSounds();
      this.getCount();
      this.getReinforcement();
    });
    this.wordService.getMostCommonWrongHistoryByUser(this.getUserId()).subscribe((words: Word[]) => {
      console.log(words)
    });
    this.newShuffle = true;
  }

  private getUserId() {
    let userId = 0;
    if (this.user?.id) {
      userId = this.user.id;
    }
    return userId;
  }

  private setWords(words: Word[]) {
    const isEnglishToPolish = this.englishToPolish;
    const answerKey = isEnglishToPolish ? 'polish' : 'english';
    const attachmentKey = isEnglishToPolish ? 'englishAttachment' : 'polishAttachment';
    const displayKey = isEnglishToPolish ? 'english' : 'polish';

    this.answers = words.slice(0, 9).map(word => word[answerKey]);
    this.justifyAnswers();
    this.clearButtonsState();

    const attachment = this.currentWord[attachmentKey];
    if (attachment && attachment.id) {
      this.displayWord = this.currentWord[displayKey];
    }
  }

  private getSounds() {
    this.download(this.currentWord.englishAttachment!, 'polishAttachment');
    this.download(this.currentWord.polishAttachment!, 'englishAttachment');
  }

  private download(attachment: Attachment, targetKey: 'englishAttachment' | 'polishAttachment') {
    if (attachment?.id) {
      this.attachmentService.download(attachment.id.toString()).subscribe((blob) => {
        this.convertBlobToUint8Array(blob, (data) => {
          if (data) {
            const targetAttachment = this.currentWord[targetKey] as Attachment;
            targetAttachment.data = data;
            this.addToCache(attachment.id!.toString(), data);
            const blobSound = new Blob([data], {type: 'audio/mp3'});

            if (targetKey === 'polishAttachment') {
              this.polishBlobSound = blobSound;
            } else if (targetKey === 'englishAttachment') {
              this.englishBlobSound = blobSound;
            }

            if (this.autoRead) {
              this.readQuestion();
            }
          }
        });
      });
    }
  }

  private addToCache(key: string, data: Uint8Array) {
    if (this.audioCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.audioCache.keys().next().value;
      this.audioCache.delete(oldestKey);
    }

    this.audioCache.set(key, data);
  }

  private clearButtonsState() {
    for (let i = 0; i < this.buttonStatuses.length; i++) {
      this.buttonStatuses[i] = 0;
    }
  }

  private convertBlobToUint8Array(blob: Blob, callback: (data: Uint8Array | null) => void): void {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        callback(new Uint8Array(reader.result));
      } else {
        callback(null);
      }
    };
    reader.onerror = () => callback(null);
    reader.readAsArrayBuffer(blob);
  }

  private settingInit() {
    const settings = this.storageService.getSettings();
    if (!settings) return;
    this.autoNext = settings.autoNext;
    this.autoRead = settings.autoRead;
  }

  private saveAnswersToLocalStorage() {
    const today = new Date().toISOString().split('T')[0]; // Formats as "YYYY-MM-DD"

    let username = ''
    if (this.user?.username) {
      username = this.user?.username;
    }

    const progress: Progress = {
      username: username,
      correct: this.correctAnswerCounter,
      inCorrect: this.inCorrectAnswerCounter,
      allAnswerCounter: this.allAnswerCounter,
      date: today
    };
    this.storageService.saveObject(StorageKey.Progress, progress);
  }

  private getRandomIndex(length: number): number {
    return Math.floor(Math.random() * length);
  }

  private setRandLanguage() {
    this.englishToPolish = this.getRandomIndex(100) % 2 === 0;
  }

  protected settingChanged() {
    this.setSettings();
  }

  setSettings() {
    const settings: Settings = {
      autoNext: this.autoNext,
      autoRead: this.autoRead
    };
    this.storageService.saveObject(StorageKey.Settings, settings);
  }

  private countdownAfterAnswer() {
    this.count = this.startCount;
    const interval = setInterval(() => {
      if (this.count > 0) {
        this.count--;
      } else {
        clearInterval(interval);
        this.getRandom();
      }
    }, 10);
  }

  private justifyAnswers() {
    const sortAnswer = this.answers.sort((a, b) => a.length - b.length);
    this.answers = [sortAnswer[0], sortAnswer[3], sortAnswer[8], sortAnswer[1], sortAnswer[4], sortAnswer[7], sortAnswer[2], sortAnswer[5], sortAnswer[6]];
  }

  protected readQuestion() {
    if (this.englishToPolish) {
      this.soundService.playSound(this.polishBlobSound);
    } else {
      this.soundService.playSound(this.englishBlobSound);
    }
  }

  private readAnswer() {
    if (this.englishToPolish) {
      this.soundService.playSound(this.englishBlobSound);
    } else {
      this.soundService.playSound(this.polishBlobSound);
    }
  }

  protected checkAnswer(answer: string, clickedButton: number) {
    if (this.newShuffle) {
      this.readAnswer();
      const currentWord = this.englishToPolish ? this.currentWord.polish : this.currentWord.english;
      const isCorrect = (word: string, answer: string) => word === answer;
      for (let i = 0; i < this.answers.length; i++) {
        if (isCorrect(currentWord, this.answers[i])) {
          this.updateButtonState(i, clickedButton);
          break;
        }
      }
      if (this.newShuffle) {
        this.countAnswer(answer);
        this.newShuffle = false;
      }

      if (this.autoNext) {
        const sub = this.soundService.soundEnded$.subscribe(() => {
          this.countdownAfterAnswer();
          sub.unsubscribe(); // prevent memory leaks
        });
      }
    }
  }

  private updateButtonState(correctIndex: number, clickedButton: number) {
    for (let i = 0; i < this.buttonStatuses.length; i++) {
      if (i === correctIndex) {
        this.buttonStatuses[i] = 1; // Correct answer
      } else if (i === clickedButton && clickedButton !== correctIndex) {
        this.buttonStatuses[i] = 2; // Wrong answer
      } else {
        this.buttonStatuses[i] = 3; // Disabled
      }
    }
  }

  private countAnswer(answer: string) {
    const currentWord = this.englishToPolish ? this.currentWord.polish : this.currentWord.english;

    if (currentWord === answer) {
      this.correctAnswerCounter++;
      this.saveAnswerToHistoryIfLoggedIn(true);
    } else {
      this.inCorrectAnswerCounter++;
      this.saveAnswerToHistoryIfLoggedIn(false);
    }
    this.allAnswerCounter++;
    this.saveAnswersToLocalStorage();
  }

  private setProgressBarValue() {
    this.progressValue = this.actualWrongAnswersCount / this.reinforcementRepetitionCount * 100;
  }

  saveAnswerToHistoryIfLoggedIn(isCorrect: boolean) {
    if (this.user?.id) {
      const id = this.currentWord.id;
      if (id) {
        this.historyService.saveWord(id, this.user.id, isCorrect).subscribe((res) => {
          this.actualWrongAnswersCount = res;
          this.setProgressBarValue();
        });
      }
    }
  }

  protected settingsToggle() {
    this.settings = !this.settings;
  }

  protected setReinforcement() {
    this.reinforcementService.setReinforcement(this.user!.id!, true).subscribe((res) => {
      this.isReinforcement = res
    });
  }

  protected getReinforcement() {
    if (this.user?.id) {
      this.reinforcementService.getReinforcement(this.user!.id!).subscribe((res) => {
        this.isReinforcement = res
      });
    }
  }
}
