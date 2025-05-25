import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { EnglishLearningService } from '../../services/english-learning.service';
import { LearningItem } from '../../models/english-learning.model';

@Component({
  selector: 'app-learning-items',
  templateUrl: './learning-items.component.html',
  styleUrls: ['./learning-items.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule,
    MatIconModule
  ]
})
export class LearningItemsComponent implements OnInit {
  learningItems: LearningItem[] = [];
  displayedColumns: string[] = ['name', 'type', 'proficiency', 'lastPracticed', 'actions'];
  newItemName: string = '';
  newItemType: 'word' | 'skill' = 'word';
  bulkInput: string = '';

  constructor(
    private englishService: EnglishLearningService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadLearningItems();
  }

  async loadLearningItems() {
    try {
      this.learningItems = await this.englishService.getLearningItems();
    } catch (error) {
      this.snackBar.open('Error loading learning items', 'Close', { duration: 3000 });
    }
  }

  async addLearningItem() {
    if (!this.newItemName.trim()) return;

    try {
      await this.englishService.addLearningItem({
        name: this.newItemName.toLowerCase().trim(),
        type: this.newItemType,
        proficiency: 0,
        needsImprovement: true,
        lastPracticed: null
      });

      this.newItemName = '';
      await this.loadLearningItems();
      this.snackBar.open('Item added successfully', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error adding item', 'Close', { duration: 3000 });
    }
  }

  async addBulkItems() {
    if (!this.bulkInput.trim()) return;

    try {
      const items = this.bulkInput
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      for (const item of items) {
        await this.englishService.addLearningItem({
          name: item.toLowerCase(),
          type: 'word',
          proficiency: 0,
          needsImprovement: true,
          lastPracticed: null
        });
      }

      this.bulkInput = '';
      await this.loadLearningItems();
      this.snackBar.open('Bulk items added successfully', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error adding bulk items', 'Close', { duration: 3000 });
    }
  }

  async deleteLearningItem(name: string) {
    try {
      await this.englishService.deleteLearningItem(name);
      await this.loadLearningItems();
      this.snackBar.open('Item deleted successfully', 'Close', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error deleting item', 'Close', { duration: 3000 });
    }
  }
}
