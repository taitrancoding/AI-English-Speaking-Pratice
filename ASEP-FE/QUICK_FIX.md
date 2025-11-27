# Quick Fix cho Flyway Validation Error

## Lỗi
```
Detected failed migration to version 5 (add peer practice sessions table).
Please remove any half-completed changes then run repair to fix the schema history.
```

## Giải pháp nhanh nhất

### Option 1: Repair Flyway (Tự động)
Đã thêm vào `application.properties`:
```properties
spring.flyway.repair-on-migrate=true
spring.flyway.baseline-on-migrate=true
```

**Chỉ cần restart app** - Flyway sẽ tự động repair và chạy lại migration.

### Option 2: Manual SQL Fix

Chạy trong MySQL:

```sql
-- Xóa record failed migration
DELETE FROM flyway_schema_history WHERE version = '5';

-- Nếu table đã tồn tại, drop nó
DROP TABLE IF EXISTS peer_practice_sessions;
```

Sau đó restart app.

### Option 3: Sửa table structure nếu đã tồn tại

```sql
-- Check structure
DESCRIBE peer_practice_sessions;

-- Fix nếu cần
ALTER TABLE peer_practice_sessions 
  MODIFY COLUMN learner2_id BIGINT NULL,
  MODIFY COLUMN status VARCHAR(20) DEFAULT 'PENDING';

ALTER TABLE peer_practice_sessions 
  ADD COLUMN IF NOT EXISTS target_level VARCHAR(20),
  ADD COLUMN IF NOT EXISTS chat_history TEXT;

-- Mark migration as success
UPDATE flyway_schema_history 
SET success = 1 
WHERE version = '5';
```

## Sau khi fix

1. Restart Spring Boot app
2. Check logs - should see:
   ```
   Flyway: Successfully applied migration to version 5
   ```
3. Verify:
   ```sql
   SELECT * FROM flyway_schema_history WHERE version = '5';
   DESCRIBE peer_practice_sessions;
   ```

## Khuyến nghị

**Dùng Option 1** - Đã config sẵn trong `application.properties`, chỉ cần restart app.


