import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {HISTORY} from "../shared/api-url";
import {AuthHelper} from "../shared/auth-helper";
import {Answer} from "../model/answer";

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  domain = environment.domain;

  constructor(private httpClient: HttpClient) {
  }

  saveWord(wordId: number, userId: number, isCorrect: boolean): Observable<number> {
    const answer: Answer = {wordId: wordId, userId: userId, isCorrect: isCorrect};
    return this.httpClient.post<number>(this.domain + HISTORY, answer, AuthHelper.getHeaderWithToken());
  }

  getActualWrongAnswersCount(userId: number): Observable<number> {
    return this.httpClient.get<number>(this.domain + HISTORY + `/${userId}`, AuthHelper.getHeaderWithToken());
  }
}
