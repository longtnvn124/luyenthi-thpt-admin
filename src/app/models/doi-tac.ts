import { IctuBaseModel } from './commons';

export interface DoiTac extends IctuBaseModel {
  id: number;
  hoten: string; 
  ten: string;
  user_id: number;
  donvi_id: number;
}
