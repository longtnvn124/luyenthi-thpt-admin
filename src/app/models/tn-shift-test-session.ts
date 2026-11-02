import { TnQLCathi } from "./tn-ql-ca-thi";
import { TnShiftTest } from "./tn-shift-test";
import { TnStudent } from "./tn-student";
import { TnStudentResult } from "./tn-student-result";

export interface TnShiftTestSession {
  id            : number;
  shift_id      : number;
  student_id    : number;
  time_start?   : string;
  time_end?     : number;
  status?       : number;
  shift_test_id : number;
  created_at    : Date;
  updated_at    : Date;
  created_by    : number;
  updated_by    : number;
  is_deleted    : number;

  shift?        : TnQLCathi;
  student?      : TnStudent;
  shift_test?   : TnShiftTest;
  studentResult?: TnStudentResult;
}
