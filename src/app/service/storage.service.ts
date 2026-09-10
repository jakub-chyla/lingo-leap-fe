import { Injectable } from '@angular/core';
import {Progress} from "../model/progress";
import {Settings} from "../model/settings";
import {StorageKey} from "../enum/storage-key";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  saveObject<T>(key: string, obj: T): void {
    localStorage.setItem(key, JSON.stringify(obj));
  }

  getProgress(): Progress | null {
    const data = localStorage.getItem(StorageKey.Progress);
    return data ? JSON.parse(data) : null;
  }

  getSettings(): Settings | null {
    const data = localStorage.getItem(StorageKey.Settings);
    return data ? JSON.parse(data) : null;
  }

  removeProgress(): void {
    localStorage.removeItem(StorageKey.Progress);
  }
}
