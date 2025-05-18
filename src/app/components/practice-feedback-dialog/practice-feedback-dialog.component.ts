import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PracticeResponse } from '../../models/english-learning.model';

@Component({
  selector: 'app-practice-feedback-dialog',
  templateUrl: './practice-feedback-dialog.component.html',
  styleUrls: ['./practice-feedback-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class PracticeFeedbackDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: PracticeResponse) {}

  getScoreColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#8bc34a';
    if (score >= 50) return '#ffc107';
    if (score >= 30) return '#ff9800';
    return '#f44336';
  }
}
