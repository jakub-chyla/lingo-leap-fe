import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {AuthHelper} from "../shared/auth-helper";

@Injectable({
  providedIn: 'root'
})
export class BuildService {
  domain = environment.domain;

  constructor(private httpClient: HttpClient) {
  }

  getBuildTime(): Observable<string> {
    return this.httpClient.get<string>(this.domain +'/build');
  }

  kafkaTest(): Observable<string>{
    return this.httpClient.get<string>(this.domain + '/build/kafka-test');
  }
}
