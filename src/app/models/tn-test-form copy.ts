export interface TnTestForm {
    id?: number;
    bank_id: number;
    name: string;
    show_hint: number;
    show_explain: number;
    show_result: number;
    user_id: number;
    desc: string;
    status: number;
    scoring_method: string;
    params?: timePattern;
    type_bank?: string;
}
export interface timePattern {
    timePattern: 'skill' | 'total';
    total?: number;
    listening?: number;
    reading?: number;
    speaking?: number;
    writing?: number;
}


export interface TnFormDetail {
    id?: number;
    bank_id: number;
    form_id: number;
    skill: string;
    time: number;
    raw_point: number;
    last_point: number;
    limit: number;
    param: string;
    question_type?: string;
    dmQuestionType?: any;
    arrayParam?: any;
    required?: boolean;
    ordering?: number;
    level?: number;
    number_questions?: number;
}
