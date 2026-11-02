import { TnShiftRoom } from "./tn-shift-room";

export interface TnQLCathi {
    id?: number;
    donvi_id: number;
    form_id: number;
    test_num: number;
    time_start: string;
    time_late: number;
    time_start_format: string;
    process: number;
    name: string;
    user_id: number;
    student_ids: any;
    teacher_ids: any;
    status: number;
    process_check: number;
    student_check: string;
    type: string;
    type_of_shift: string;
    attemptCount: number;
    photo_before_exam: number;
    photo_during_exam: number;
    elearning_class_id: number;
    online?: number;
    official_test?: number;
    type_bank?: string;
    rooms?: TnShiftRoom[]
}
