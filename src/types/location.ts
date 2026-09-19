// Kiểu dữ liệu về vị trí (thành phố, điểm đến).

// Một vị trí như API trả về.
export interface Location {
  id: number;
  tenViTri: string;
  tinhThanh: string;
  quocGia: string;
  hinhAnh: string;
}

// Gửi lên khi thêm vị trí. Giống hệt kiểu Location vì API đòi đủ các trường,
// trong đó id để 0 và hình ảnh để rỗng, ảnh tải lên sau bằng API riêng.
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
