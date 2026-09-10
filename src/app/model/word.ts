import {Attachment} from "./attachment";

export class Word {
  id?: number;
  english!: string;
  polish!: string;
  englishAttachment?: Attachment;
  polishAttachment?: Attachment;
}
