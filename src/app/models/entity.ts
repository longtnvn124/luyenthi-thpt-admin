export interface BaseEntity {
    created_at: Date;
    updated_at: Date;
    is_deleted: number;
    created_by: number;
    updated_by: number;
    deleted_by: number;
  }
  