import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { Answers, Question } from "@model/question";
import { NotificationService } from "@appNotification";
import { arrayShuffle } from "@pages/admin/bank/cap-nhat-cau-hoi/models/bank-questions";
import { FormsModule } from "@angular/forms";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { TooltipModule } from "primeng/tooltip";
import { InputTextareaModule } from "primeng/inputtextarea";
import { TnBankQuestionService } from "@service/luyenthithpt/tn-bank-question.service";
import { InputQuestionDirectionComponent } from "../../input-question-direction/input-question-direction.component";
export interface DragAndDropAnswer {
  question: Question;
  answer: Answers;
}

export interface DragAndDropQuestion {
  question: Question;
  answer: Answers;
}
@Component({
  standalone: true,
  selector: "drag-and-drop-question-ck-editor",
  templateUrl: "./drag-and-drop-question-ck-editor.component.html",
  imports: [
    FormsModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    NgIf,
    NgClass,
    TooltipModule,
    InputTextareaModule,
    NgForOf,
    InputQuestionDirectionComponent
  ],
  styleUrls: ["./drag-and-drop-question-ck-editor.component.css"],
})
export class DragAndDropQuestionCkEditorComponent implements OnInit {
  @Input() set question(question: Question) {

    this._question = question;
    this.setAnswers();
    const idAnswersOptionUsed: string[] = this.answers.map((i) => i.answer.id);
    // this.disturbedAnswers = question.answer_option
    //   .reduce((reducer: string[], a: Answers): string[] => {
    //     if (!idAnswersOptionUsed.includes(a.id)) {
    //       reducer.push(a.value);
    //     }
    //     return reducer;
    //   }, new Array<string>())
    //   .join(";");
    this.disturbedAnswers2 = question.answer_option.reduce(
      (answers: Answers[], item: Answers) => {
        if (!idAnswersOptionUsed.includes(item.id)) {
          answers.push(item);
        }
        return answers;
      },
      new Array<Answers>()
    );


    this.question.children.map((item, index) => {
      this.handleChildQuestionDirection(item.question_direction);
    });

    let count = 0; // Biến đếm để theo dõi số lần lặp

    // this.countContentEditorChanged = !this.countContentEditorChanged;
    // const interval = setInterval(() => {
    //   this.countContentEditorChanged = !this.countContentEditorChanged;
    //   count++;

    //   if (count >= 2) {
    //     // Kiểm tra nếu đã lặp đủ 5 lần
    //     clearInterval(interval); // Dừng interval
    //   }
    // }, 500);
  }

  @Input() enableQuestionNumber: boolean = false;

  @Input() confirmOnDelete: boolean = false;

  @Output() changeAnswerImage: EventEmitter<any> = new EventEmitter<any>();

  private _question: Question;

  get question(): Question {
    return this._question;
  }

  answers: DragAndDropAnswer[] = [];

  disturbedAnswers: string;
  disturbedAnswers2: Answers[] = [
    {
      id: "1",
      value: "",
    },
  ];

  private observeOnChangesAnswer$: Subject<DragAndDropAnswer> =
    new Subject<DragAndDropAnswer>();

  private observeOnChangesDisturbedAnswers$: Subject<string> =
    new Subject<string>();

  childQuestion: DragAndDropQuestion[];

  indexQuestionDirection: number = 1;
  indexQuestionAnswer: number = 1;
  childQuestionsDirection: Answers[] = []; //dù là câu hỏi nhưng để kiểu dữ liệu Answer để thỏa mãn điều kiện đưa vào htmlInputModel của app-input-question-direction
  childQuestionsAnswer: Answers[] = [];

  countContentEditorChanged: boolean = false; // change to trigger IctuMediaLoader in app-input-question-direction

  constructor(
    private notificationService: NotificationService,
    // private courseQuestionsService : CourseQuestionsService
    private questionSerivce: TnBankQuestionService
  ) {}

  ngOnInit(): void {
    this.observeOnChangesAnswer$.subscribe((answerOption: DragAndDropAnswer) =>
      this._changesAnswers(answerOption)
    );
    this.observeOnChangesDisturbedAnswers$
      .pipe(debounceTime(1000))
      .subscribe(() => this._changesDisturbedAnswers());

    this.countContentEditorChanged = !this.countContentEditorChanged;
  }

  private setAnswers(): void {
    this.answers = this.question.children.reduce(
      (reducer: DragAndDropAnswer[], child: Question): DragAndDropAnswer[] => {
        // const _arrCorrectAnswers : string[] = child.answer_correct ? child.answer_correct.split( ';' ).map( ( t : string ) : string => t ? t.replace( '|' , '' ).trim() : '' ).filter( Boolean ) : [];
        let _rawAnswer: string = child.answer_correct
          ? child.answer_correct.replace(/\|/gim, "").trim()
          : "";
        let _answer: Answers = _rawAnswer
          ? this.question.answer_option.find((a) => a.id === _rawAnswer)
          : null;
        reducer.push({
          question: child,
          answer: _answer ? _answer : { id: "", value: "" },
        });
        return reducer;
      },
      new Array<DragAndDropAnswer>()
    );
  }

  private _changesAnswers(answerOption: DragAndDropAnswer): void {
    if (answerOption.answer) {
      if (answerOption.answer.id) {
        this.updateAnswer(answerOption);
      } else {
        this.addNewAnswer(answerOption);
      }
    } else {
      this.addNewAnswer(answerOption);
    }
  }

  private addNewAnswer(answerOption: DragAndDropAnswer): void {
    const maxAnswerId: number = this.question.answer_option.reduce(
      (reducer: number, a: Answers): number =>
        !Number.isNaN(parseInt(a.id, 10))
          ? Math.max(reducer, parseInt(a.id, 10))
          : reducer,
      0
    );
    answerOption.answer.id = (1 + maxAnswerId).toString(10);
    answerOption.question.answer_correct = "|" + answerOption.answer.id + "|";
    this.question.answer_option.push(answerOption.answer);
    this.question.answer_option = arrayShuffle(this.question.answer_option);
  }

  private updateAnswer(answerOption: DragAndDropAnswer): void {
    if (answerOption.answer.value) {
      const o: Answers = this.question.answer_option.find(
        (a: Answers): boolean => a.id === answerOption.answer.id
      );
      if (o) {
        o.value = answerOption.answer.value;
      }
      answerOption.question.answer_correct = "|" + answerOption.answer.id + "|";
    } else {
      answerOption.question.answer_correct = "";
      this.question.answer_option = this.question.answer_option.filter(
        (q: Answers): boolean => q.id !== answerOption.answer.id
      );
      answerOption.answer.id = "";
      this.fillAnswerOptions();
    }
  }

  private fillAnswerOptions() {
    const allAnswers: Answers[] = this.answers.reduce(
      (reducer: Answers[], child: DragAndDropAnswer): Answers[] => {
        if (child.answer.value) {
          reducer.push(child.answer);
        }
        return reducer;
      },
      new Array<Answers>()
    );
    if (this.disturbedAnswers2.length > 0) {
      const maxAnswerId: number = this.question.answer_option.reduce(
        (reducer: number, a: Answers): number =>
          !Number.isNaN(parseInt(a.id, 10))
            ? Math.max(reducer, parseInt(a.id, 10))
            : reducer,
        0
      );
      // const disturbedAnswers: Answers[] = this.disturbedAnswers
      //   .split(";")
      //   .map(
      //     (t: string, index: number): Answers =>
      //       t
      //         ? {
      //             id: (1 + index + maxAnswerId).toString(10),
      //             value: t.trim(),
      //           }
      //         : null
      //   )
      //   .filter(Boolean);
      // allAnswers.push(...disturbedAnswers);

      const disturbedAnswers: Answers[] = this.disturbedAnswers2
        .map((item, index) => {
          item.id = item.id = (1 + index + maxAnswerId).toString(10);
          return item;
        })
        .filter(Boolean);
      allAnswers.push(...disturbedAnswers);
    }



    this.question.answer_option = arrayShuffle(allAnswers);
  }

  private _changesDisturbedAnswers(): void {
    this.fillAnswerOptions();
  }

  onChangesAnswers(answerOption: DragAndDropAnswer): void {

    this.observeOnChangesAnswer$.next(answerOption);
  }

  onChangesDisturbedAnswers(): void {
    this.observeOnChangesDisturbedAnswers$.next("changed");
  }

  addMoreQuestion(): void {
    const cloneQuestion: Question = Object.assign(
      JSON.parse(JSON.stringify(this.question)),
      {
        children: [],
        question_direction: "",
        question_number: 0,
        media: null,
        answer_option: [],
        answer_correct: "",
        group_id: 0,
      }
    );

    if (cloneQuestion["id"]) {
      delete cloneQuestion["id"];
    }

    this.question.children.push(cloneQuestion);
    this.setAnswers();
    this.handleChildQuestionDirection("");
    this.handleChildQuestionAnswer("");
    setTimeout(() => {
      this.countContentEditorChanged = !this.countContentEditorChanged;
    }, 500);
  }

  handleChildQuestionDirection(value: string): void {
    this.indexQuestionDirection += 1;
    this.childQuestionsDirection.push({
      id: this.indexQuestionDirection.toString(),
      value: value,
    });
  }

  handleChildQuestionAnswer(value: string): void {
    this.indexQuestionAnswer += 1;
    this.childQuestionsAnswer.push({
      id: this.indexQuestionAnswer.toString(),
      value: value,
    });
  }

  async deleteQuestion(index: number): Promise<void> {
    if (this.confirmOnDelete) {
      try {
        const confirm: boolean = await this.notificationService.confirmDelete();
        if (confirm) {
          this._delete(index);

          //   const childAnswerId = this.question.children.find(child => child.id === index)

          //   this.childQuestionsAnswer = this.childQuestionsAnswer.filter((item) => parseInt(item.id) != index);

          //   this.childQuestionsDirection = this.childQuestionsDirection.filter((item) => parseInt(item.id) != index);
        }
      } catch (e) {}
    } else {
      // this.childQuestionsAnswer = this.childQuestionsAnswer.filter((item) => parseInt(item.id) != index);
      // this.childQuestionsDirection = this.childQuestionsDirection.filter((item) => parseInt(item.id) != index);
      this._delete(index);
    }
  }

  private _delete(index: number): void {
    if (this.answers[index].question["id"]) {
      this.notificationService.isProcessing(true);
      // this.courseQuestionsService.deleteCourseQuestions(
      this.questionSerivce
        .deleteQuestionByIds([this.answers[index].question["id"]])
        .subscribe({
          next: (): void => {
            this._removeQuestionFromLayout(index);
            // this.notificationService.stopLoading();
            this.notificationService.isProcessing(false);
          },
          error: (): void => {
            this.notificationService.isProcessing(false);
            this.notificationService.toastError("Mất kết nối với máy chủ");
          },
        });
    } else {
      this._removeQuestionFromLayout(index);
    }
  }

  private _removeQuestionFromLayout(index: number): void {
    const answerOption: DragAndDropAnswer = this.answers[index];
    this.question.children = this.question.children.filter(
      (_, i): boolean => i !== index
    );
    this.childQuestionsDirection = this.childQuestionsDirection.filter(
      (_, i): boolean => i !== index
    );
    this.answers = this.answers.filter((_, i): boolean => i !== index);
    if (answerOption.answer.id) {
      this.question.answer_option = this.question.answer_option.filter(
        (q: Answers): boolean => q.id !== answerOption.answer.id
      );
    }
  }

  editorContentChange(
    event: any,
    index: number,
    type: "question" | "answer"
  ): void {
    this.countContentEditorChanged = !this.countContentEditorChanged;
    if (type === "question") {
      this.question.children[index].question_direction = event;
    } else {
      this.changeAnswerImage.emit(event);
      this.answers[index].answer.value = event;
      this.onChangesAnswers(this.answers[index]);
    }
  }

  // disturbedAnswers
  addDisturbedAnswer() {
    let cloneAnswer: Answers = {
      id: (this.disturbedAnswers2.length + 1).toString(),
      value: "",
    };

    this.disturbedAnswers2.push(cloneAnswer);
  }

  deleteDisturbedAnswer(index: number) {
    this.disturbedAnswers2 = this.disturbedAnswers2.filter(
      (_, i) => i != index
    );

    this.fillAnswerOptions();
  }

  editorContentDisturbedAnswerChange(event: any, index: number): void {
    this.countContentEditorChanged = !this.countContentEditorChanged;
    this.changeAnswerImage.emit(event);
    this.disturbedAnswers2[index].value = event;
    this.fillAnswerOptions();
  }
}
