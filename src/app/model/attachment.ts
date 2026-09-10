import {Language} from "../enum/Language";

export class Attachment{
  id?:number;
  fileName?: string;
  wordId?: number;
  language?: Language;
  data?: Uint8Array;
}
