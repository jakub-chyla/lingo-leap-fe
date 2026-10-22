import {Component, OnDestroy, OnInit} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {Router} from "@angular/router";
import {SseService} from "../../service/sse.service";

import {Report} from "../../model/report";
import {MatIconButton} from "@angular/material/button";
import {MatCard, MatCardContent} from "@angular/material/card";
import {MatIcon} from "@angular/material/icon";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    MatCard,
    MatCardContent,
    MatIcon,
    MatIconButton,
    ReactiveFormsModule
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss'
})
export class ReportComponent implements OnInit, OnDestroy {

  reports: Report[] = [];
  private reportsSubscription?: Subscription;

  constructor(private readonly sseService: SseService,
              private readonly router: Router) {
  }

  ngOnInit() {
    this.getSseReport();
  }

  ngOnDestroy(): void {
    this.reportsSubscription?.unsubscribe();
  }

  getSseReport() {
    if (this.reportsSubscription && !this.reportsSubscription.closed) {
      return;
    }

    this.reportsSubscription = this.sseService.connectToReports().subscribe({
      next: (reports: Report[]) => {
        this.reports = reports;
        console.log('Received report:', reports);
      },
      error: error => {
        console.error('SSE error:', error);
      }
    });
  }

  protected navigateToMain(): void {
    this.router.navigate(['/main']);
  }
}
