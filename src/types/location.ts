// Vị trí
export interface Location {
  id: number;
  tenViTri: string;
  tinhThanh: string;
  quocGia: string;
  hinhAnh: string;
}

// Tạo vị trí (ViTriViewModel)
export interface CreateLocationPayload {
  id: number;
  tenViTri: string;
  tinhThanh: string;
  quocGia: string;
  hinhAnh: string;
}

// Cập nhật vị trí (ViTriViewModel)
export interface UpdateLocationPayload {
  id: number;
  tenViTri: string;
  tinhThanh: string;
  quocGia: string;
  hinhAnh: string;
}
