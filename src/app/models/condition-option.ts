import { IctuConditionParam } from "./dto";

export interface ConditionOption {
    condition: IctuConditionParam[];
    set: Set[];
    page: string;
}

export interface Set {
    label: string;
    value: string;
}