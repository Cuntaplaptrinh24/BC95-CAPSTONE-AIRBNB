// Kiểu dữ liệu về bình luận.

// Một bình luận như API trả về. Hai trường cuối có dấu hỏi vì API chỉ kèm
// tên và ảnh người bình luận ở một số endpoint, không phải lúc nào cũng có.
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

// Gửi lên khi người dùng viết bình luận mới.
export interface CreateCommentPayload {
  id: number;
  maPhong: number;
  maNguoiBinhLuan: number;
  ngayBinhLuan: string;
  noiDung: string;
  saoBinhLuan: number;
}

// Gửi lên khi sửa bình luận. Quản trị chỉ đổi nội dung và số sao,
// nhưng vẫn phải gửi đủ các trường còn lại vì API nhận cả bản ghi.
export interface UpdateCommentPayload {
  id: number;
  maPhong: number;
  maNguoiBinhLuan: number;
  ngayBinhLuan: string;
  noiDung: string;
  saoBinhLuan: number;
}
