// Bình luận
export interface Comment {
  id: number;
  maPhong: number;
  maNguoiBinhLuan: number;
  ngayBinhLuan: string;
  noiDung: string;
  saoBinhLuan: number;
  tenNguoiBinhLuan?: string;
  avatarNguoiBinhLuan?: string;
}

// Tạo bình luận
export interface CreateCommentPayload {
  id: number;
  maPhong: number;
  maNguoiBinhLuan: number;
  ngayBinhLuan: string;
  noiDung: string;
  saoBinhLuan: number;
}

// Cập nhật bình luận (theo Swagger
export interface UpdateCommentPayload {
  id: number;
  maPhong: number;
  maNguoiBinhLuan: number;
  ngayBinhLuan: string;
  noiDung: string;
  saoBinhLuan: number;
}
