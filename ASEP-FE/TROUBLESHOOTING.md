# Hướng dẫn xử lý lỗi

## Các lỗi thường gặp và cách sửa

### 1. Lỗi "Learner not found"
**Nguyên nhân**: Backend không tìm thấy learner profile
**Cách sửa**:
- Đảm bảo user đã có learner profile
- Kiểm tra authentication token có hợp lệ không
- Kiểm tra database có dữ liệu learner profile

### 2. Lỗi "Gemini API error"
**Nguyên nhân**: 
- API key không đúng hoặc chưa set
- API key hết hạn
- Network error

**Cách sửa**:
- Kiểm tra `GEMINI_API_KEY` trong `.env` hoặc environment variables
- Lấy API key mới từ https://makersuite.google.com/app/apikey
- Kiểm tra internet connection

### 3. Lỗi "Invalid JSON response from Gemini"
**Nguyên nhân**: Gemini trả về response không đúng format JSON
**Cách sửa**:
- Kiểm tra log để xem raw response từ Gemini
- Có thể Gemini trả về text thay vì JSON (do prompt không rõ ràng)
- Thử lại với prompt rõ ràng hơn

### 4. Lỗi compile Java
**Nguyên nhân**: 
- Missing dependencies
- Syntax errors
- Import errors

**Cách sửa**:
```bash
cd BE-Java/aesp
mvn clean compile
```

### 5. Frontend không kết nối được backend
**Nguyên nhân**:
- Backend chưa chạy
- CORS error
- API URL không đúng

**Cách sửa**:
- Kiểm tra backend đang chạy ở port 8080
- Kiểm tra `VITE_API_URL` trong frontend
- Kiểm tra CORS config trong SecurityConfig

### 6. Lỗi "User not authenticated"
**Nguyên nhân**: JWT token không hợp lệ hoặc đã hết hạn
**Cách sửa**:
- Đăng nhập lại
- Kiểm tra token trong localStorage
- Kiểm tra JWT_SECRET trong backend

## Kiểm tra log

### Backend logs
```bash
cd BE-Java/aesp
mvn spring-boot:run
```
Xem log để tìm lỗi cụ thể.

### Frontend logs
Mở browser console (F12) để xem lỗi JavaScript.

## Test endpoints

### Test evaluation endpoint
```bash
curl -X POST http://localhost:8080/api/v1/ai/evaluation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "learnerId": 1,
    "topic": "Test",
    "scenario": "Test",
    "targetLevel": "B1",
    "speechText": "Hello, this is a test."
  }'
```

### Test get sessions
```bash
curl -X GET "http://localhost:8080/api/v1/ai/practice/me?page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```


