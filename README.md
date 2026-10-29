# LexiMaster — Ứng Dụng Học & Ôn Tập Từ Vựng Tiếng Anh Theo Chủ Đề

Ứng dụng web học từ vựng tiếng Anh tương tác khép kín với **42 Chủ đề (Units 3 – 59, gồm 571 từ vựng)**, phát âm tiếng Anh chuẩn cho từng từ/cả chủ đề, tùy chỉnh số lượng câu hỏi và bài kiểm tra tổng hợp kết hợp **cả 4 dạng câu hỏi** trong cùng 1 bài làm.

## Tính năng chính
- **42 Chủ đề từ vựng (Units 3 – 59)**: Học, tra cứu, lọc theo từng chủ đề hoặc xóa/thêm chủ đề tùy ý.
- **Âm thanh phát âm chuẩn (Web Speech API)**: Nghe phát âm từng từ vựng hoặc đọc tự động lần lượt cả chủ đề.
- **Bài làm kết hợp cả 4 dạng câu hỏi**:
  1. Nhìn Tiếng Việt → Gõ Tiếng Anh (`vn-to-en`)
  2. Nhìn Tiếng Anh → Gõ Tiếng Việt (`en-to-vn`)
  3. Trắc nghiệm 4 lựa chọn A, B, C, D (`multiple-choice`)
  4. Nối cặp từ Tiếng Anh – Nghĩa Tiếng Việt (`matching`)
- **Tùy chỉnh số lượng câu hỏi**: Chọn nhanh 5, 10, 15, 20, 30, 50, Tất cả hoặc nhập số lượng câu hỏi bất kỳ.
- **Lưu trữ tự động (LocalStorage)**: Dữ liệu từ vựng được lưu trực tiếp trên trình duyệt, không cần máy chủ.

---

## Hướng dẫn triển khai lên GitHub Pages

### Cách 1: Tải gói `index.html` triển khai trực tiếp trên web GitHub (Nhanh nhất - Không cần cài đặt)
1. Mở ứng dụng **LexiMaster**, nhấn nút **"Triển khai GitHub"** ở góc phải thanh điều hướng.
2. Nhấn **"Tải file `index.html` cho GitHub Pages"** (hoặc tải gói `.zip` giải nén).
3. Truy cập [github.com](https://github.com), tạo một Repository mới (chọn **Public**).
4. Nhấn **uploading an existing file**, kéo thả file `index.html` vừa tải về vào và nhấn **Commit changes**.
5. Vào mục **Settings** → **Pages** → tại mục **Branch**, chọn nhánh `main` (thư mục `/root`) → nhấn **Save**.
6. Sau 1–2 phút, trang web của bạn sẽ hoạt động tại địa chỉ `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

### Cách 2: Đẩy toàn bộ mã nguồn React + Vite (Tự động build qua GitHub Actions)
Dự án đã được cấu hình sẵn `base: './'` trong `vite.config.ts` và workflow tự động tại `.github/workflows/deploy.yml`:
1. Đẩy toàn bộ mã nguồn lên GitHub repository của bạn (nhánh `main`).
2. Trên GitHub repository, vào **Settings** → **Pages**.
3. Tại mục **Build and deployment** → **Source**, chọn **GitHub Actions**.
4. GitHub sẽ tự động chạy workflow `Deploy LexiMaster to GitHub Pages` và xuất bản trang web của bạn.
