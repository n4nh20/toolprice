# Tool Chia Tiền - AI Expense Splitter

Công cụ chia tiền thông minh sử dụng AI để phân tích hoá đơn và tự động chia tiền theo từng người và món họ ăn.

## Tính năng

- 📸 Upload hình ảnh hoá đơn (drag & drop hoặc chọn file)
- 🤖 AI tự động phân tích và extract các món ăn và giá tiền
- 👥 Quản lý danh sách người tham gia
- 🍽️ Phân bổ món ăn cho từng người
- 💰 Tính toán và hiển thị số tiền mỗi người phải trả

## Yêu cầu

- Node.js 18+ 
- Google Gemini API Key (miễn phí, lấy tại [aistudio.google.com](https://aistudio.google.com/app/apikey))

## Cài đặt

1. Clone repository hoặc tải source code

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env.local` và thêm Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Lấy Gemini API Key:**
- Truy cập: https://aistudio.google.com/app/apikey
- Đăng nhập bằng Google account
- Click "Create API Key" 
- Copy API key và paste vào file `.env.local`

4. Chạy development server:
```bash
npm run dev
```

5. Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt

## Sử dụng

1. **Upload hoá đơn**: Kéo thả hoặc chọn file hình ảnh hoá đơn
2. **AI phân tích**: Hệ thống sẽ tự động phân tích và hiển thị các món ăn
3. **Thêm người**: Thêm tên các người tham gia
4. **Phân bổ món**: Click vào tên người để phân bổ món ăn cho họ
5. **Xem kết quả**: Hệ thống sẽ tự động tính toán số tiền mỗi người phải trả

## Tech Stack

- **Framework**: Next.js 14 (App Router) với TypeScript
- **UI**: React + Tailwind CSS
- **AI**: Google Gemini 1.5 Pro (Vision API)
- **State Management**: React Hooks

## Deploy

Có thể deploy lên Vercel một cách dễ dàng:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/toolprice)

Nhớ thêm biến môi trường `GEMINI_API_KEY` trong Vercel dashboard.
