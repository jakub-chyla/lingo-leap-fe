import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {REINFORCEMENT} from "../shared/api-url";
import {AuthHelper} from "../shared/auth-helper";

@Injectable({
  providedIn: 'root'
})
export class ReinforcementService {
  domain = environment.domain;

  constructor(private httpClient: HttpClient) {
  }

  setReinforcement(userId: number, isReinforcement: boolean): Observable<boolean> {
    const body = { userId, isReinforcement };

    return this.httpClient.post<boolean>(
      this.domain + REINFORCEMENT,
      body,
      AuthHelper.getHeaderWithToken()
    );
  }

  getReinforcement(userId: number): Observable<boolean> {
    return this.httpClient.get<boolean>(this.domain + REINFORCEMENT + `/${userId}`, AuthHelper.getHeaderWithToken());
  }

}
