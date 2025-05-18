import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Practice, PracticeResponse } from '../../models/english-learning.model';

@Component({
  selector: 'app-practice-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './practice-form.component.html',
  styleUrls: ['./practice-form.component.scss']
})
export class PracticeFormComponent implements OnChanges {
  @Input() practice: Practice | null = null;
  @Input() practiceResponse: PracticeResponse | null = null;
  @Output() submitAnswer = new EventEmitter<string>();
  
  userAnswer: string = '';
  feedback: PracticeResponse | null = null;

  getScoreColor(score: number): string {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#8bc34a';
    if (score >= 50) return '#ffc107';
    if (score >= 30) return '#ff9800';
    return '#f44336';
  }

  onSubmit() {
    if (this.userAnswer) {
      this.submitAnswer.emit(this.userAnswer);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['practiceResponse'] && changes['practiceResponse'].currentValue) {
      this.feedback = changes['practiceResponse'].currentValue;
    }
  }
}
