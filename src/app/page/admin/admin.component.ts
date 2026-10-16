import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {Word} from "../../model/word";
import {AttachmentService} from "../../service/attachment.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {Router} from "@angular/router";
import {WordService} from "../../service/word.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {Language} from "../../enum/Language";
import {Attachment} from "../../model/attachment";
import {MatSort, MatSortModule} from "@angular/material/sort";
import {finalize} from "rxjs";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MatButton,
    MatCard,
    MatCardContent,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatIcon,
    MatIconButton,
    MatTable,
    MatHeaderCell,
    MatColumnDef,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatCellDef,
    MatHeaderCellDef,
    MatNoDataRow,
    MatSort,
    MatSortModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit, AfterViewInit {
  myForm!: FormGroup;
  wordsList: Word[] = [];
  countDown = false;
  autoNext = true;
  autoRead = false;
  isGettingSounds = false;
  isDownloadingAttachments = false;
  isTrimmingAttachments = false;
  displayedColumns: string[] = ['english', 'polish', 'action'];
  dataSource = new MatTableDataSource(this.wordsList);

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private readonly attachmentService: AttachmentService,
              private readonly formBuilder: FormBuilder,
              private readonly router: Router,
              private readonly wordService: WordService) {
  }

  ngOnInit() {
    this.settingInit();
    this.myForm = this.formBuilder.group({
      polish: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      english: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    });
    this.getAllWords()
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  private getAllWords() {
    this.wordService.getAllWords().subscribe((data) => {
      this.wordsList = data;
      this.dataSource = new MatTableDataSource(this.wordsList);
      this.dataSource.sort = this.sort; // Ensure sorting is set after assigning the data

      this.dataSource.sortingDataAccessor = (item: Word, property: string) => {
        if (property === 'english') {
          return item.english.toLowerCase();
        } else if (property === 'polish') {
          return item.polish.toLowerCase();
        }
        return '';
      };

    });
  }

  protected applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private settingInit() {
    const storedCountDown = localStorage.getItem('countDown');
    if (storedCountDown !== null) {
      this.countDown = storedCountDown === 'true';
    }
    const storedAutoNext = localStorage.getItem('autoNext');
    if (storedAutoNext !== null) {
      this.autoNext = storedAutoNext === 'true';
    }
    const storedAutoRead = localStorage.getItem('autoRead');
    if (storedAutoRead !== null) {
      this.autoRead = storedAutoRead === 'true';
    }
  }

  protected add() {
    if (this.myForm.valid) {
      const word: Word = {
        english: this.myForm.get('english')?.value,
        polish: this.myForm.get('polish')?.value
      }
      this.wordService.saveWord(word).subscribe(
        (response) => {
          if (response) {
            const word = response;
            this.wordsList.unshift(word)
            this.dataSource = new MatTableDataSource(this.wordsList);
            this.myForm.get('english')?.setValue('');
            this.myForm.get('polish')?.setValue('');
          }
        },
      );
    }
  }

  getSounds() {
    if (this.isGettingSounds) {
      return;
    }

    this.isGettingSounds = true;
    this.wordService.getSoundsForEmptyWords()
      .pipe(finalize(() => this.isGettingSounds = false))
      .subscribe();
  }

  downloadAllAttachments() {
    if (this.isDownloadingAttachments) {
      return;
    }

    this.isDownloadingAttachments = true;
    this.attachmentService.downloadAll()
      .pipe(finalize(() => this.isDownloadingAttachments = false))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'attachments.zip';
        link.click();
        window.URL.revokeObjectURL(url);
      });
  }

  trimLastSecondFromAllAttachments() {
    if (this.isTrimmingAttachments) {
      return;
    }

    this.isTrimmingAttachments = true;
    this.attachmentService.trimLastSecondFromAllAttachments()
      .pipe(finalize(() => this.isTrimmingAttachments = false))
      .subscribe();
  }

  protected upload(wordId: number, language: Language) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3';
    input.click();

    input.onchange = () => {
      if (input.files && input.files.length > 0) {
        const selectedFile = input.files[0];
        this.attachmentService.upload(wordId.toString(), language, selectedFile).subscribe((attachment) => {
          if (attachment) {
            const word = this.wordsList.find(w => w.id === attachment.wordId);
            if (word) {
              if (attachment.language === Language.ENGLISH) {
                word.englishAttachment = new Attachment();
                word.englishAttachment.id = attachment.id;
                word.englishAttachment.fileName = attachment.fileName;
              }
              if (attachment.language === Language.POLISH) {
                word.polishAttachment = new Attachment();
                word.polishAttachment.id = attachment.id;
                word.polishAttachment.fileName = attachment.fileName;
              }
            }
          }
        });

      }
    };
  }

  protected navigateToMain(): void {
    this.router.navigate(['/main']);
  }

  protected deleteWordById(id: number): void {
    this.wordService.deleteWordById(id.toString()).subscribe((response) => {
      const index = this.wordsList.findIndex(word => word.id === response);
      if (index !== -1) {
        this.wordsList.splice(index, 1);
        this.dataSource = new MatTableDataSource(this.wordsList);
      }
    });

  }

  protected deleteAttachmentById(word: Word, language: Language): void {
    const attachment = language === Language.ENGLISH ? word.englishAttachment : word.polishAttachment;
    if (attachment && attachment.id) {
      const attachmentId = attachment.id;

      this.attachmentService.deleteAttachmentById(attachmentId.toString()).subscribe(() => {
        const index = this.wordsList.findIndex(w => w.id === word.id);

        if (index !== -1) {
          if (language === Language.ENGLISH) {
            this.wordsList[index].englishAttachment = undefined;
            word.englishAttachment = undefined;
          } else {
            this.wordsList[index].polishAttachment = undefined;
            word.polishAttachment = undefined;
          }
        }
      });
    }
  }

  protected readonly Language = Language;
}


