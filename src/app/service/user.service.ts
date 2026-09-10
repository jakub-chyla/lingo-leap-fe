import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, tap} from "rxjs";
import {User} from "../model/user";
import {HttpClient} from "@angular/common/http";
import {LOG_IN, REFRESH_TOKEN, REGISTER} from "../shared/api-url";
import {AuthRequest} from "../model/auth-request";
import {AuthResponse} from "../model/auth-response";
import {AuthHelper} from "../shared/auth-helper";
import {PurchaseService} from "./purchase.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  domain = environment.domain;
  private userSource = new BehaviorSubject<User | null>(null);
  user$ = this.userSource.asObservable();
  user?: User;

  constructor(private httpClient: HttpClient,
              private purchaseService: PurchaseService) {
  }

  createUser(authRequest: AuthRequest): Observable<string> {
    return this.httpClient.post(this.domain + REGISTER, authRequest, {
      responseType: 'text'
    });
  }

  private setUserData(response: AuthResponse): void {
    if (!response) return;

    this.user = new User();
    this.user.id = response.id;
    this.user.username = response.userName;
    this.user.role = response.role;
    this.user.refreshToken = response.refreshToken;
    this.user.token = response.accessToken;

    localStorage.setItem('username', String(response.userName));
    localStorage.setItem('token', String(response.accessToken));
    localStorage.setItem('refresh_token', String(response.refreshToken));

    this.emitUser(this.user);
    this.isPremium();
  }

  logIn(authRequest: AuthRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.domain}${LOG_IN}`, authRequest).pipe(
      tap((response: AuthResponse) => this.setUserData(response))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    return this.httpClient.get<AuthResponse>(`${this.domain}${REFRESH_TOKEN}`, AuthHelper.getHeaderWithRefreshToken()).pipe(
      tap((response: AuthResponse) => this.setUserData(response))
    );
  }

  isPremium() {
    let isPremium = false;
    if (this.user?.id) {
      this.purchaseService.isPremium(this.user.id).subscribe(response => {
        isPremium = response;
        this.user!.premium = isPremium;
        localStorage.setItem('premium', String(isPremium));
        this.emitUser(this.user!);
      });
    }
  }

  logOut() {
    this.user = new User();
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    this.emitUser(this.user);
  }

  emitUser(user: User) {
    this.userSource.next(user);
  }
}
