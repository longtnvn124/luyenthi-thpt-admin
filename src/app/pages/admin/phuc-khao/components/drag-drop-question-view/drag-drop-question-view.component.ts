import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {QuestionView } from '../../interface/drag-drop-question-view.interface';
import { TnShiftTestQuestion } from '@model/tn-shift-test-question';
import { SafeHtmlPipe } from 'src/app/pipes/safe-html.pipe';
import { IctuMediaLoaderDirective } from 'src/app/directives/ictu-media-loader.directive';

@Component({
  selector: 'app-drag-drop-question-view',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe, IctuMediaLoaderDirective],
  templateUrl: './drag-drop-question-view.component.html',
  styleUrls: ['./drag-drop-question-view.component.css']
})



export class DragDropQuestionViewComponent implements OnInit, OnChanges {
  @Input() question: TnShiftTestQuestion;

  questionData: QuestionView;

  ngOnInit(): void {
    this.questionData = this.question as any;
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.questionData = changes['question'].currentValue as any;
  }

  getAnswerOption(answer: string): string {
    return this.questionData.answer_option.find(item => item.id === answer)?.value || '';
  }

  getAnswerOptionCorrect(answer: QuestionView): string {
    return this.questionData.answer_option.find(item => item.id === answer.answer_correct.split('|')[1])?.value || '';
  }

  getStyleClass(item: QuestionView): string {
    return item.is_correct ? 'checkmark' : 'crossmark';
  }

}
