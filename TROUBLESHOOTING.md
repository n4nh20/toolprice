# Khắc phục lỗi Gemini API

## Lỗi 404 - Model không tìm thấy

Nếu bạn gặp lỗi "404 Not Found" cho tất cả các model, có thể do:

### 1. API Key chưa được enable đúng API

**Cách kiểm tra và sửa:**

1. Truy cập: https://console.cloud.google.com/apis/library
2. Đăng nhập bằng Google account cùng với account tạo API key
3. Tìm và enable các API sau:
   - **Generative Language API** (hoặc **Gemini API**)
   - **AI Platform API** (nếu có)

4. Sau khi enable, đợi vài phút để API được kích hoạt

### 2. Kiểm tra API Key có đúng không

**Kiểm tra:**

1. Mở terminal và chạy:
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
```

2. Nếu thấy danh sách models, API key đúng
3. Nếu lỗi 403/401, API key sai hoặc chưa được enable
4. Nếu lỗi 404, có thể API chưa được enable trong project

### 3. Tạo API Key mới

Nếu API key cũ không hoạt động:

1. Vào: https://aistudio.google.com/app/apikey
2. Xóa API key cũ (nếu cần)
3. Tạo API key mới
4. Copy và cập nhật vào `.env.local`

### 4. Kiểm tra Quota

Một số model có thể yêu cầu:
- Billing account được enable
- Quota đã được cấp phát

Kiểm tra: https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

### 5. Thử các model khác

Code đã tự động thử các model sau theo thứ tự:
- `gemini-1.5-flash-latest`
- `gemini-1.5-flash`
- `gemini-1.5-pro-latest`
- `gemini-1.5-pro`
- `gemini-pro-vision`
- `gemini-pro`

Nếu tất cả đều lỗi, vấn đề là ở API key hoặc API chưa được enable.

## Cách test API key nhanh

Tạo file `test-api.js`:

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say hello');
    console.log('Success!', result.response.text());
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
```

Chạy: `node test-api.js`

Nếu vẫn lỗi, vấn đề là API key hoặc API chưa được enable.



