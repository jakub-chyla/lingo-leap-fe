import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CHECKOUT, PREMIUM} from "../shared/api-url";
import {ProductRequest} from "../model/product-request";
import {StripeResponse} from "../model/stripe-response";
import {AuthHelper} from "../shared/auth-helper";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  domain = environment.domain;

  constructor(private httpClient: HttpClient) {
  }

  checkout(productRequest: ProductRequest): Observable<StripeResponse> {
    return this.httpClient.post<StripeResponse>(this.domain + CHECKOUT, productRequest, AuthHelper.getHeaderWithToken());
  }

  isPremium(userId: number): Observable<boolean> {
    return this.httpClient.get<boolean>(this.domain + PREMIUM + `/${userId}`, AuthHelper.getHeaderWithToken());
  }

}

