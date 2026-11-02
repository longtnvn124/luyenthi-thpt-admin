// export interface Message{
//     sender: number;
//     title: string;
//     url: string;
//     message: string;
//     donvi_id: number;

//     receiver?: number[];
// }

export interface Message{
    id?: number;
    title: string;
    message: string;
    url: string;
    sender: number;
    donvi_id?: number;
    created_at?: string | Date;
    updated_at?: string | Date;
    is_deleted?: number;
    deleted_by?: number;
    updated_by?: number;
    created_by?: number;
    sender_name?: string;
    sender_avatar?: string;
    donvi_title?: string;
    user_name?: string;
    user_avatar?: string;
    user_id?: number;
    seen?: number;
    receiver?: number[];
    users?: [
        {
            id: number;
            name: string;
            avatar: string;
            seen: number
        }
    ]
}