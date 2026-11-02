import { TnQLCathi } from "./tn-ql-ca-thi";
import { TnShiftTest } from "./tn-shift-test";
import { TnShiftTestQuestion } from "./tn-shift-test-question";
import { TnShiftTestSession } from "./tn-shift-test-session";
import { TnStudent } from "./tn-student";

export interface TnShiftTestSessionAnswer {
  id                        : number;
  student_id                : number;
  shift_test_session_id     : number;
  shift_test_question_id    : number;
  answer                    : string;
  is_correct                : number;
  shift_test_id             : number;
  created_at                : Date;
  updated_at                : Date;
  created_by                : number;
  updated_by                : number;
  is_deleted                : number;

  shift_test_session?       : TnShiftTestSession;
  student?                  : TnStudent;
  shift_test?               : TnShiftTest;
  shift_test_question?       : TnShiftTestQuestion;
}
