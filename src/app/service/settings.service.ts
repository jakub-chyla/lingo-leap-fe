import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {AuthHelper} from "../shared/auth-helper";
import {SETTINGS} from "../shared/api-url";

export interface UserSettings {
  userId: number;
  mostWrong: number;
  leastAnswered: number;
}

@Injectable({providedIn: 'root'})
export class SettingsService {
  private readonly domain = environment.domain;

  constructor(private readonly httpClient: HttpClient) {}

  getSettings(): Observable<UserSettings> {
    return this.httpClient.get<UserSettings>(this.domain + SETTINGS, AuthHelper.getHeaderWithToken());
  }

  updateSettings(settings: Pick<UserSettings, 'mostWrong' | 'leastAnswered'>): Observable<UserSettings> {
    return this.httpClient.put<UserSettings>(this.domain + SETTINGS, settings, AuthHelper.getHeaderWithToken());
  }
}
