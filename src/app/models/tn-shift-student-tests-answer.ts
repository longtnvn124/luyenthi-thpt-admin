import { TnBankQuestion } from "./tn-bank-question";
import { TnQLCathi } from "./tn-ql-ca-thi";
import { TnShiftStudentTest } from "./tn-shift-student-test";
import { TnShiftTest } from "./tn-shift-test";
import { TnShiftTestQuestion } from "./tn-shift-test-question";
import { TnShiftTestSession } from "./tn-shift-test-session";
import { TnStudent } from "./tn-student";

export interface TnShiftStudentTestAnswer {
  id                        : number;
  student_id                : number;
  shift_student_test_id     : number;
  question_id               : number;
  student_answer            : string;
  is_correct                : number;
  created_at                : Date;
  updated_at                : Date;
  created_by                : number;
  updated_by                : number;
  is_deleted                : number;
  deleted_by                : number;

  shift_student_test?       : TnShiftStudentTest;
  student?                  : TnStudent;
  shift_test?               : TnShiftTest;
  questions?                : TnBankQuestion;
}
