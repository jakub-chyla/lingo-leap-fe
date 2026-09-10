import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {MOST_WRONG, RANDOM, SOUNDS_FOR_EMPTY_WORDS, WORD} from "../shared/api-url";
import {AuthHelper} from "../shared/auth-helper";
import {Word} from "../model/word";

@Injectable({
  providedIn: 'root'
})
export class WordService {
  domain = environment.domain;

  constructor(private httpClient: HttpClient) {
  }

  saveWord(word: Word): Observable<Word> {
    return this.httpClient.post<Word>(this.domain + WORD, word, AuthHelper.getHeaderWithToken());
  }

  getAllWords(): Observable<Word[]> {
    return this.httpClient.get<Word[]>(this.domain + WORD, AuthHelper.getHeaderWithToken());
  }

  getRandomWords(userId: number, reinforcementRepetitionCount: number): Observable<Word[]> {
    const params = {userId: userId, reinforcementRepetitionCount: reinforcementRepetitionCount}
    return this.httpClient.get<Word[]>(this.domain + RANDOM, {params});
  }

  getMostCommonWrongHistoryByUser(userId: number): Observable<Word[]> {
    return this.httpClient.get<Word[]>(this.domain + MOST_WRONG + `/${userId}`, AuthHelper.getHeaderWithToken());
  }

  getSoundsForEmptyWords(): Observable<boolean> {
    return this.httpClient.get<boolean>(this.domain + SOUNDS_FOR_EMPTY_WORDS , AuthHelper.getHeaderWithToken());
  }

  deleteWordById(wordId: string): Observable<number> {
    return this.httpClient.delete<number>(this.domain + WORD + `/${wordId}`, AuthHelper.getHeaderWithToken());
  }
}
