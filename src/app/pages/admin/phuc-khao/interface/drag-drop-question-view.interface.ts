import { AnswerOption } from "@model/class";

export interface QuestionView {
  id: number;
  answer: string;
  answer_correct: string;
  answer_option: AnswerOption[];
  bank_question_id: number;
  code: string;
  created_at: Date;
  created_by: number;
  deleted_by: number;
  explain?: string;
  grading_teacher?: number;
  group_id: number;
  hint?: string;
  is_deleted: number;
  is_correct: number;
  media?: any;
  ordering: number;
  part: number;
  question_direction: string;
  question_number: number;
  question_type: string;
  result: string;
  shift_test_id: number;
  shuff: any;
  skill: any;
  subQuestions: QuestionView[];
  updated_at: Date;
  updated_by: number;
}
