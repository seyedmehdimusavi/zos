import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EnglishLearningService } from '../../services/english-learning.service';

@Component({
  selector: 'app-spelling-practice',
  templateUrl: './spelling-practice.component.html',
  styleUrls: ['./spelling-practice.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule
  ]
})
export class SpellingPracticeComponent {
  @Input() words: string[] = [];
  @Output() practiceComplete = new EventEmitter<{ word: string, correct: boolean }>();

  currentWordIndex = 0;
  userInput = '';
  feedback = '';
  isCorrect = false;
  showResult = false;
  speech: SpeechSynthesisUtterance;

  canAttemptPractice = true;
  averageScore = 0;

  constructor(
    private englishService: EnglishLearningService,
    private snackBar: MatSnackBar
  ) {
    this.speech = new SpeechSynthesisUtterance();
    this.speech.lang = 'en-US';
    this.speech.rate = 0.8; // Slightly slower for better clarity
  }

  get currentWord(): string {
    return this.words[this.currentWordIndex];
  }

  get isLastWord(): boolean {
    return this.currentWordIndex === this.words.length - 1;
  }

  playWord() {
    this.speech.text = this.currentWord;
    window.speechSynthesis.speak(this.speech);
  }

  async ngOnInit() {
    await this.checkPracticeAvailability();
    await this.loadAverageScore();
  }

  private async checkPracticeAvailability() {
    this.canAttemptPractice = await this.englishService.canAttemptSpellingPractice();
    if (!this.canAttemptPractice) {
      this.snackBar.open('You have already completed your spelling practice for today! Come back tomorrow.', 'OK', {
        duration: 5000
      });
    }
  }

  private async loadAverageScore() {
    this.averageScore = await this.englishService.getAverageScore();
  }

  checkSpelling() {
    if (!this.canAttemptPractice) {
      this.snackBar.open('Please wait until tomorrow to practice again.', 'OK', {
        duration: 3000
      });
      return;
    }
    this.showResult = true;
    this.isCorrect = this.userInput.toLowerCase().trim() === this.currentWord.toLowerCase();
    this.feedback = this.isCorrect ? 'Correct!' : `Incorrect. The word was "${this.currentWord}"`;
    this.practiceComplete.emit({ word: this.currentWord, correct: this.isCorrect });
  }

  nextWord() {
    if (this.currentWordIndex < this.words.length - 1) {
      this.currentWordIndex++;
      this.resetState();
      this.playWord(); // Automatically play the next word
    }
  }

  resetState() {
    this.userInput = '';
    this.feedback = '';
    this.showResult = false;
    this.isCorrect = false;
  }

  restartPractice() {
    this.currentWordIndex = 0;
    this.resetState();
    this.playWord();
  }

  async startPractice() {
    if (!this.canAttemptPractice) {
      this.snackBar.open('Please wait until tomorrow to practice again.', 'OK', {
        duration: 3000
      });
      return;
    }
    this.currentWordIndex = 0;
    this.resetState();
    this.playWord();
  }
}
