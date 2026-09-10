import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {Language} from "../enum/Language";
import {Attachment} from "../model/attachment";
import {ATTACHMENT, WORD} from "../shared/api-url";
import {AuthHelper} from "../shared/auth-helper";

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  domain = environment.domain;

  constructor(private httpClient: HttpClient) {
  }

  download(wordId: string): Observable<Blob> {
    return this.httpClient.get(this.domain + ATTACHMENT + `/download/${wordId}`, {
      responseType: 'blob',
    });
  }

  downloadAll(): Observable<Blob> {
    return this.httpClient.get(this.domain + ATTACHMENT + '/download-all', {
      ...AuthHelper.getHeaderWithToken(),
      responseType: 'blob',
    });
  }

  upload(wordId: string, language: Language, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<Attachment>(`${this.domain}/at/upload/${wordId}/${Language[language]}`, formData, AuthHelper.getHeaderWithToken());
  }

  deleteAttachmentById(attachmentId: string): Observable<number> {
    return this.httpClient.delete<number>(this.domain + ATTACHMENT + `/${attachmentId}`, AuthHelper.getHeaderWithToken());
  }

  trimLastSecondFromAllAttachments(): Observable<number> {
    return this.httpClient.patch<number>(this.domain + ATTACHMENT + '/trim-last-second', null, AuthHelper.getHeaderWithToken());
  }

}
