import { BaseEntity } from "./entity";

export interface Pack extends BaseEntity{
    id: number;
    name: string;
    price: number;
    // date_end: Date;
    des: string;
    time: number;

    discount?: number;
    options?: string;
    featured?: number;
}

export interface Order extends BaseEntity{
    id: number;
    pack_id: number;
    user_id: number;
    coupon: string;
    price: number;
    discount: number;
    total: number;
    note: string;
    status: number; // 0 = Chờ thanh toán 1 = Đã thanh toán	
    date_end: Date | string;

}

export interface Coupon{
    id: number;
    code: string;
    desc: string;
    amount: number;
    applied_date: Date;
    expiry_date: Date;
    usage_limits: number;
    pack_ids: number[];
    
}