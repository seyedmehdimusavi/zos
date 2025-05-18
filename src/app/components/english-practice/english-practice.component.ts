import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { PracticeFormComponent } from '../practice-form/practice-form.component';
import { SpellingPracticeComponent } from '../spelling-practice/spelling-practice.component';
import { EnglishLearningService } from '../../services/english-learning.service';
import { LearningItem, Practice, PracticeResponse } from '../../models/english-learning.model';

@Component({
  selector: 'app-english-practice',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTabsModule,
    MatInputModule,
    MatRadioModule,
    FormsModule,
    PracticeFormComponent,
    SpellingPracticeComponent
  ],
  templateUrl: './english-practice.component.html',
  styleUrls: ['./english-practice.component.scss']
})
export class EnglishPracticeComponent implements OnInit {
  learningItems: LearningItem[] = [];
  currentPractice: Practice | null = null;
  userAnswer: string = '';
  lastResponse: PracticeResponse | null = null;

  get wordList(): string[] {
    return this.learningItems
      .filter(item => item.type === 'word')
      .map(item => item.name);
  }

  constructor(private englishService: EnglishLearningService) {}

  async ngOnInit() {
    const items = await this.englishService.getLearningItems();
    if (!items || items.length === 0) {
      await this.englishService.initializeSampleItems();
    }
    await this.loadLearningItems();
  }

  private async loadLearningItems() {
    this.learningItems = await this.englishService.getLearningItems();
  }

  async generateNewPractice() {
    const words = this.learningItems
      .filter(item => item.type === 'word')
      .map(item => item.name);
    
    const skills = this.learningItems
      .filter(item => item.type === 'skill')
      .map(item => item.name);

    this.englishService.generatePractice(words, skills)
      .subscribe(practice => {
        this.currentPractice = practice;
        this.userAnswer = '';
        this.lastResponse = null;
      });
  }

  async onAnswerSubmit(answer: string) {
    if (this.currentPractice) {
      try {
        this.lastResponse = await firstValueFrom(
          this.englishService.evaluatePractice(this.currentPractice, answer)
        );
      } catch (error) {
        console.error('Error evaluating practice:', error);
      }
    }
  }

  onSpellingComplete(result: { word: string, correct: boolean }) {
    const learningItem = this.learningItems.find(item => 
      item.type === 'word' && item.name.toLowerCase() === result.word.toLowerCase()
    );

    if (learningItem) {
      if (result.correct) {
        learningItem.proficiency = Math.min(100, learningItem.proficiency + 10);
        learningItem.needsImprovement = false;
      } else {
        learningItem.proficiency = Math.max(0, learningItem.proficiency - 5);
        learningItem.needsImprovement = true;
      }
      learningItem.lastPracticed = new Date().toISOString();
      this.englishService.addLearningItem(learningItem);
    }
  }
}
