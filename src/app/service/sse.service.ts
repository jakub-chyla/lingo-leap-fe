
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Report } from '../model/report';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SseService {

  private readonly url = environment.domain + '/reports/stream';

  connectToReports(): Observable<Report[]> {
    return new Observable(observer => {
      const controller = new AbortController();
      void this.listen(controller.signal, observer);

      return () => controller.abort();
    });
  }

  private async listen(
    signal: AbortSignal,
    observer: Observer<Report[]>
  ): Promise<void> {
    while (!signal.aborted) {
      try {
        await this.readConnection(signal, observer);
      } catch (error) {
        if (
          signal.aborted ||
          (error instanceof DOMException && error.name === 'AbortError')
        ) {
          return;
        }

        observer.error(error);
        return;
      }

      await this.waitBeforeReconnect(signal);
    }
  }

  private async readConnection(
    signal: AbortSignal,
    observer: Observer<Report[]>
  ): Promise<void> {
    const response = await fetch(this.url, {
      headers: {
        Accept: 'text/event-stream'
      },
      signal
    });

    if (!response.ok) {
      throw new Error('SSE zwróciło HTTP ' + response.status);
    }

    if (!response.body) {
      throw new Error('Przeglądarka nie udostępniła strumienia SSE.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let eventLines: string[] = [];

    const processLine = (line: string) => {
      const normalizedLine = line.replace(/\r$/, '');

      if (normalizedLine === '') {
        this.dispatchEvent(eventLines, observer);
        eventLines = [];
      } else {
        eventLines.push(normalizedLine);
      }
    };

    while (!signal.aborted) {
      const { value, done } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf('\n');

      while (newline >= 0) {
        processLine(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
        newline = buffer.indexOf('\n');
      }
    }

    if (buffer) {
      eventLines.push(buffer);
    }

    if (eventLines.length) {
      this.dispatchEvent(eventLines, observer);
    }
  }

  private dispatchEvent(
    lines: string[],
    observer: Observer<Report[]>
  ): void {
    let eventName = 'message';
    const data: string[] = [];

    for (const line of lines) {
      if (line.startsWith(':')) continue;

      const separator = line.indexOf(':');
      const field = separator < 0 ? line : line.slice(0, separator);
      const value = separator < 0
        ? ''
        : line.slice(separator + 1).replace(/^ /, '');

      if (field === 'event') eventName = value;
      if (field === 'data') data.push(value);
    }

    if (eventName === 'quiz-report' && data.length) {
      observer.next(JSON.parse(data.join('\n')) as Report[]);
    }
  }

  private waitBeforeReconnect(signal: AbortSignal): Promise<void> {
    return new Promise(resolve => {
      const onAbort = () => {
        clearTimeout(timeout);
        resolve();
      };

      const timeout = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, 3000);

      signal.addEventListener('abort', onAbort, { once: true });
    });
  }
}
