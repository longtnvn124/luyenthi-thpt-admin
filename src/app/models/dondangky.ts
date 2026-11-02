import { Thongtin_vitri } from "./danh-muc";
import { OvicFile } from "./file";

export interface DonDangKy {
    id?: number,
    loaidon_dangky?: number,
    donvi_id: number,
    khu_id: number,
    toanha_id: number,
    tang: number,
    phong_id: number,
    vitri_giuong: number,
    vitri_giuong_chitiet: string,
    doituonguutien_id: number,
    tu_ngay: string,
    den_ngay: string,
    ngay_dangky?: string,
    gia_phong: string,
    sotien_thanhtoan: number,
    trangthai: number, //0: chờ thanh toán 1: đã thanh toán 2: đã duyệt 3: đã ký hợp đồng -1: huỷ đơn	
    han_thanh_toan: string,
    ngayduyet: string,
    nguoiduyet_id: number,
    lydo_khongduyet: string,
    image_doituonguutien?: OvicFile[] | string,
    created_by?: number
    created_at?: string,
    userprofile?: any,
    khuName?: any,
    toaName?: any,
    phongName?: any,
    truongName?: string,
    trangthai_thanhtoan?: GiaoDich,

}

export interface GiaoDich {
    id?: number,
    id_thanhtoan: number
    so_tien: number
    loai_thanhtoan: string
    hinh_thuc: string
    tt_thanhtoan: number
}