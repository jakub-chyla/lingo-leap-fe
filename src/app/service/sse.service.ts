import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {Report} from "../model/report";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SseService {

  connectToReports(): Observable<Report[]> {
    return new Observable(observer => {
      let disposed = false;
      let controller: AbortController | undefined;
      const url = `${environment.domain}/api/reports/stream`;
      const waitBeforeReconnect = () => new Promise<void>(resolve => setTimeout(resolve, 3000));

      const connect = async () => {
        while (!disposed) {
          controller = new AbortController();
          try {
            const response = await fetch(url, {
              headers: {
                Accept: 'text/event-stream',
              },
              signal: controller.signal
            });

            if (!response.ok) {
              throw new Error(`SSE zwróciło HTTP ${response.status}`);
            }
            if (!response.body) {
              throw new Error('Przeglądarka nie udostępniła strumienia SSE.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let eventName = 'message';
            let data: string[] = [];

            const processLine = (line: string) => {
              if (line === '') {
                if (data.length && eventName === 'quiz-report') {
                  try {
                    observer.next(JSON.parse(data.join('\n')) as Report[]);
                  } catch (error) {
                    observer.error(error);
                    disposed = true;
                  }
                }
                eventName = 'message';
                data = [];
                return;
              }

              if (line.startsWith(':')) return;
              const separator = line.indexOf(':');
              const field = separator < 0 ? line : line.slice(0, separator);
              const value = separator < 0 ? '' : line.slice(separator + 1).replace(/^ /, '');
              if (field === 'event') eventName = value;
              if (field === 'data') data.push(value);
            };

            while (!disposed) {
              const {value, done} = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, {stream: true});
              let newline = buffer.indexOf('\n');
              while (newline >= 0) {
                processLine(buffer.slice(0, newline).replace(/\r$/, ''));
                buffer = buffer.slice(newline + 1);
                newline = buffer.indexOf('\n');
              }
            }
            if (buffer.length) processLine(buffer.replace(/\r$/, ''));
          } catch (error) {
            if (disposed || (error instanceof DOMException && error.name === 'AbortError')) return;
            observer.error(error);
            return;
          }

          if (!disposed) await waitBeforeReconnect();
        }
      };

      void connect();
      return () => {
        disposed = true;
        controller?.abort();
      };
    });
  }
}
