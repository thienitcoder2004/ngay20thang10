# Tiny — Chúc mừng ngày 20/10

Đây là bản dựng độc lập theo **chủ đề** “Sự thức giấc của Tiny — Ngày 20/10”. Chưa thể trích xuất toàn bộ nội dung và asset từ website tham chiếu nên **không phải bản sao chính xác 1:1**.

## Chạy bằng VS Code
1. Giải nén file ZIP.
2. Mở thư mục `tiny-20-10-vscode` trong Visual Studio Code.
3. Nhấn chuột phải vào `index.html` → **Open with Live Server** (cài tiện ích Live Server nếu chưa có).
4. Hoặc mở trực tiếp `index.html` trong Chrome / Edge.

## Chỉnh sửa
- `index.html`: lời chúc, tiêu đề, nội dung từng màn.
- `style.css`: màu, bố cục, nhân vật Tiny, hiệu ứng.
- `script.js`: chuyển màn, nở hoa, mở thư, âm thanh và hoa rơi.

Giao diện sử dụng Google Fonts nếu có mạng; khi offline tự chuyển sang font hệ thống. Không dùng thư viện JavaScript hay máy chủ.

## Thêm bài hát

Sửa cấu hình ở đầu `script.js`:

```js
const MUSIC = {
  url: 'assets/musics/LAVIEM.mp3',
  title: 'Tên bài hát của bạn',
};
```

Đã gắn file **assets/musics/LAVIEM.mp3**. Nút **Bật âm** phát bài hát trực tiếp trong trang; **Tắt âm** tạm dừng. Nhấn lại để tiếp tục từ vị trí đã dừng. Nhạc lặp lại và tiếp tục khi chuyển màn.

Để đổi bài, đặt file mới vào `assets/musics` rồi sửa `url` và `title`. Dùng đường dẫn tương đối để hoạt động trên máy tính, điện thoại và khi đưa website lên hosting. Khi sao chép hoặc đăng website, giữ cả thư mục `assets`. Có thể dùng link HTTPS trực tiếp tới file âm thanh; link trang Zing MP3/YouTube/Spotify không phát được trong thẻ audio. Để trống `url` khi chưa chọn bài.
