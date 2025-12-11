# Hướng dẫn lấy Gemini API Key

## Bước 1: Truy cập Google AI Studio

Đi tới: https://aistudio.google.com/app/apikey

## Bước 2: Đăng nhập

- Đăng nhập bằng Google account của bạn
- Nếu chưa có tài khoản, tạo một tài khoản Google mới (miễn phí)

## Bước 3: Tạo API Key

1. Click nút **"Create API Key"** hoặc **"Get API Key"**
2. Chọn project hoặc tạo project mới
3. Copy API key được tạo

## Bước 4: Thêm vào file .env.local

Mở file `.env.local` trong thư mục `toolprice` và thêm:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Thay `your_gemini_api_key_here` bằng API key bạn vừa copy.

## Lưu ý

- Gemini API có quota miễn phí khá rộng rãi (60 requests/phút cho free tier)
- Không cần thẻ tín dụng để bắt đầu
- API key có dạng: `AIzaSy...`

## Kiểm tra

Sau khi thêm API key, restart dev server:

```bash
npm run dev
```

Sau đó thử upload một hình ảnh hoá đơn để kiểm tra.



