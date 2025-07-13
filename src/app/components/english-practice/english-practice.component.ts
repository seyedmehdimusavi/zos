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
  proficiencyRanges: { range: string; count: number }[] = [];

  calculateProficiencyRanges(): void {
    const ranges = [
      { min: 0, max: 10, label: '0-10%' },
      { min: 11, max: 20, label: '11-20%' },
      { min: 21, max: 30, label: '21-30%' },
      { min: 31, max: 40, label: '31-40%' },
      { min: 41, max: 50, label: '41-50%' },
      { min: 51, max: 60, label: '51-60%' },
      { min: 61, max: 70, label: '61-70%' },
      { min: 71, max: 80, label: '71-80%' },
      { min: 81, max: 90, label: '81-90%' },
      { min: 91, max: 100, label: '91-100%' }
    ];

    this.proficiencyRanges = ranges.map(range => ({
      range: range.label,
      count: this.learningItems.filter(item => 
        item.proficiency >= range.min && item.proficiency <= range.max
      ).length
    }));
  }
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

  private async loadLearningItems(): Promise<void> {
    try {
      const items = await this.englishService.getLearningItems();
      if (items) {
        this.learningItems = items;
        this.calculateProficiencyRanges();
      }
    } catch (error) {
      console.error('Error loading learning items:', error);
    }
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
