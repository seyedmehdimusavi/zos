import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FirebaseService } from './services/firebase.service';
import { GeminiService } from './services/gemini.service';
import { NavComponent } from './components/nav/nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatButtonModule, CommonModule, NavComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Oscar English';
  data: any = null;

  constructor(private firebaseService: FirebaseService,private geminiService: GeminiService) {}

  async readData() {
    try {
      this.data = await this.firebaseService.getData('test');
      console.log('Data read:', this.data);
    } catch (error) {
      console.error('Error reading data:', error);
    }
  }

  async writeData() {
    try {
      const testData = {
        message: 'Hello Firebase!',
        timestamp: new Date().toISOString()
      };
      await this.firebaseService.setData('test', testData);
      console.log('Data written successfully');
      // Read the data back to show the update
      await this.readData();
    } catch (error) {
      console.error('Error writing data:', error);
    }
  }

  async sendPrompt() {
    try {
      this.geminiService.sendPrompt('where is Australia?')
        .subscribe(
          (response) => {
            this.data = response;
            console.log('Structured response:', response);
          },
          (error) => {
            console.error('Error from Gemini:', error);
            this.data = { error: error.message };
          }
        );
    } catch (error) {
      console.error('Error in sendPrompt:', error);
      this.data = { error: 'Failed to send prompt' };
    }
  }
}


// ng build --configuration production --base-href=/zos/
// npx angular-cli-ghpages --dir=dist/oscar-english