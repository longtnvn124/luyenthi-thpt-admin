import { OvicFile } from "./file";
import { TnQLCathi } from "./tn-ql-ca-thi";
import { TnShiftTest } from "./tn-shift-test";
import { TnStudent } from "./tn-student";
import { TnStudentResult } from "./tn-student-result";

// export type StudentCredentials = {
//   device?: string;
//   browser?: string;
//   ip?: string;
// }

export class StudentCredentials {
    // device?: string;
    // browser?: string;
    // ip?: string;
  constructor(
    public device?: any,
    public browser?: any,
    public ip?: string
  ) {
    
  }
}

export interface TnShiftStudentTest {
  id            : number;
  shift_id      : number;
  student_id    : number;
  shift_test_id : number;
  time_start?   : string;
  time_end?     : string;
  status?       : number;
  total_point   : number;
  photo_before_exam?: OvicFile;
  photo_during_exam?: OvicFile[];
  created_at    : Date;
  updated_at    : Date;
  created_by    : number;
  updated_by    : number;
  is_deleted    : number;
  student_credentials: string;

  shift?        : TnQLCathi;
  student?      : TnStudent;
  shift_test?   : TnShiftTest;
}
