import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TnShiftTestQuestion } from '@model/tn-shift-test-question';
import { QuestionView } from '../../interface/drag-drop-question-view.interface';

@Component({
  selector: 'app-grouping-question-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grouping-question-view.component.html',
  styleUrls: ['./grouping-question-view.component.css']
})
export class GroupingQuestionViewComponent implements OnInit, OnChanges {
  @Input() question: TnShiftTestQuestion;

  questionData: QuestionView;

  ngOnInit(): void {
    this.loadContentValueFromAnswerOptionId(this.question);
    
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.loadContentValueFromAnswerOptionId(changes['question'].currentValue);
  }

  loadContentValueFromAnswerOptionId(data: TnShiftTestQuestion): void {
     let dataTest: QuestionView = data as any;
     dataTest.subQuestions.forEach((item) => {
       let arrAnswerIds = item.answer.split(',');
       let arrAnswerCorrectIdsTemp = item.answer_correct.split('|')[1];
       let arrAnswerCorrectIds = arrAnswerCorrectIdsTemp.split(';');

       let arrAnswer = [];
       arrAnswerIds.forEach((i) => {
        arrAnswer.push(dataTest.answer_option.find((t) => i === t.id));
       })

       let arrAnswerCorrect = [];
       arrAnswerCorrectIds.forEach((i) => {
        arrAnswerCorrect.push(dataTest.answer_option.find((t) => i === t.id));
       })

       item['arrAnswer'] = arrAnswer;
       item['arrAnswerCorrect'] = arrAnswerCorrect;
       this.questionData = dataTest;
       

     })
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
