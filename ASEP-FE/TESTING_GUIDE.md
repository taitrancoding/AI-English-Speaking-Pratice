# Testing Guide - Hướng dẫn Test và Deploy

## 1. Database Migrations

### Cách 1: Tự động khi start app
Spring Boot sẽ tự động chạy Flyway migrations khi app khởi động nếu:
- `spring.flyway.enabled=true` (mặc định là true)
- Database connection đã được config trong `application.properties`

**Chỉ cần restart Spring Boot app và migrations sẽ tự động chạy.**

### Cách 2: Chạy thủ công với Maven
```bash
cd BE-Java/aesp
mvn flyway:migrate -Dflyway.url=${SPRING_DATASOURCE_URL} -Dflyway.user=${SPRING_DATASOURCE_USERNAME} -Dflyway.password=${SPRING_DATASOURCE_PASSWORD}
```

### Cách 3: Chạy với environment variables
```bash
# Windows
set SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/aesp_db
set SPRING_DATASOURCE_USERNAME=root
set SPRING_DATASOURCE_PASSWORD=your_password
cd BE-Java/aesp
mvn spring-boot:run
```

## 2. Kiểm tra Migrations đã chạy

Sau khi app start, kiểm tra database:
```sql
-- Kiểm tra các tables mới đã được tạo
SHOW TABLES;

-- Kiểm tra Flyway history
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC;

-- Kiểm tra từng table
DESCRIBE assessments;
DESCRIBE mentor_resources;
DESCRIBE mentor_feedbacks;
DESCRIBE peer_practice_sessions;
```

## 3. Test Backend Endpoints

### 3.1 Assessment Endpoints

#### Create Assessment (Mentor only)
```bash
POST http://localhost:8080/api/v1/assessments
Authorization: Bearer {mentor_jwt_token}
Content-Type: application/json

{
  "learnerId": 1,
  "assessedLevel": "INTERMEDIATE",
  "speakingScore": 75,
  "listeningScore": 80,
  "readingScore": 70,
  "writingScore": 65,
  "strengths": "Good pronunciation and listening skills",
  "weaknesses": "Needs improvement in writing and grammar",
  "recommendations": "Focus on writing exercises and grammar practice"
}
```

#### Get My Assessments (Mentor)
```bash
GET http://localhost:8080/api/v1/assessments/mentor/me
Authorization: Bearer {mentor_jwt_token}
```

#### Get Assessments by Learner
```bash
GET http://localhost:8080/api/v1/assessments/learner/1
Authorization: Bearer {token}
```

### 3.2 Mentor Resources Endpoints

#### Create Resource (Mentor)
```bash
POST http://localhost:8080/api/v1/mentor-resources
Authorization: Bearer {mentor_jwt_token}
Content-Type: application/json

{
  "title": "Grammar Basics",
  "description": "Introduction to English grammar",
  "resourceType": "DOCUMENT",
  "fileUrl": "https://example.com/grammar.pdf",
  "externalUrl": "https://example.com/grammar",
  "category": "GRAMMAR",
  "targetLevel": "BEGINNER",
  "isPublic": true
}
```

#### Get My Resources (Mentor)
```bash
GET http://localhost:8080/api/v1/mentor-resources/mentor/me
Authorization: Bearer {mentor_jwt_token}
```

#### Get Public Resources
```bash
GET http://localhost:8080/api/v1/mentor-resources/public
Authorization: Bearer {token}
```

### 3.3 Mentor Feedback Endpoints

#### Create Feedback (Mentor)
```bash
POST http://localhost:8080/api/v1/mentor-feedback
Authorization: Bearer {mentor_jwt_token}
Content-Type: application/json

{
  "learnerId": 1,
  "practiceSessionId": 1,
  "pronunciationErrors": "Mispronunciation of 'th' sound",
  "grammarErrors": "Incorrect use of past tense",
  "vocabularyIssues": "Used 'big' instead of 'large' in formal context",
  "clarityGuidance": "Speak more slowly and clearly",
  "conversationTopics": "Practice business meeting scenarios",
  "vocabularySuggestions": "Learn collocations: make a decision, take action",
  "nativeSpeakerTips": "Listen to podcasts for natural speech patterns",
  "overallFeedback": "Good progress, keep practicing!",
  "isImmediate": true
}
```

#### Get My Feedbacks (Mentor)
```bash
GET http://localhost:8080/api/v1/mentor-feedback/mentor/me
Authorization: Bearer {mentor_jwt_token}
```

#### Get Feedbacks by Learner
```bash
GET http://localhost:8080/api/v1/mentor-feedback/learner/1
Authorization: Bearer {token}
```

### 3.4 Peer Practice Endpoints

#### Find Match
```bash
POST http://localhost:8080/api/v1/peer-practice/find-match?topic=Travel&scenario=Airport&targetLevel=B1
Authorization: Bearer {learner_jwt_token}
```

#### Get Active Session
```bash
GET http://localhost:8080/api/v1/peer-practice/active
Authorization: Bearer {learner_jwt_token}
```

#### End Session
```bash
PUT http://localhost:8080/api/v1/peer-practice/{sessionId}/end
Authorization: Bearer {learner_jwt_token}
```

## 4. Test Frontend UI

### 4.1 Mentor Pages

#### Assessments Page
1. Login với Mentor account
2. Navigate to `/mentor/assessments`
3. Click "Tạo Assessment"
4. Fill form:
   - Learner ID
   - Assessed Level
   - Scores (Speaking, Listening, Reading, Writing)
   - Strengths, Weaknesses, Recommendations
5. Submit và verify trong table

#### Resources Page
1. Navigate to `/mentor/resources`
2. Click "Thêm Resource"
3. Fill form:
   - Title, Description
   - Resource Type, Category, Target Level
   - File URL hoặc External URL
   - Public/Private
4. Submit và verify trong table
5. Test delete resource

#### Feedback Page
1. Navigate to `/mentor/feedback`
2. Click "Tạo Feedback"
3. Fill form với tabs:
   - **Lỗi Tab**: Pronunciation, Grammar, Vocabulary errors
   - **Hướng dẫn Tab**: Clarity guidance, Conversation topics
   - **Đề xuất Tab**: Vocabulary suggestions, Native speaker tips
   - **Tổng thể Tab**: Overall feedback, Immediate flag
4. Submit và verify trong table
5. Click eye icon để xem detail

### 4.2 Learner Pages

#### Peer Practice Page
1. Login với Learner account
2. Navigate to `/learner/peer-practice`
3. Fill form:
   - Topic
   - Scenario
   - Target Level
4. Click "Tìm đối tác"
5. Verify active session display
6. Test WebSocket connection (nếu có)

## 5. Test Checklist

### Backend
- [ ] Migrations chạy thành công (check flyway_schema_history)
- [ ] All tables created (assessments, mentor_resources, mentor_feedbacks, peer_practice_sessions)
- [ ] Assessment endpoints work
- [ ] Resource endpoints work
- [ ] Feedback endpoints work
- [ ] Peer practice endpoints work
- [ ] WebSocket connection works (nếu test được)

### Frontend
- [ ] Assessments page loads
- [ ] Create assessment form works
- [ ] Resources page loads
- [ ] Create resource form works
- [ ] Delete resource works
- [ ] Feedback page loads
- [ ] Create feedback form works (all tabs)
- [ ] View feedback detail works
- [ ] Peer practice page loads
- [ ] Find match works

### Integration
- [ ] Mentor can create assessment for learner
- [ ] Learner level updates after assessment
- [ ] Mentor can create resources
- [ ] Learners can see public resources
- [ ] Mentor can create feedback
- [ ] Learners can see their feedbacks
- [ ] Peer practice matching works
- [ ] WebSocket messaging works (nếu có)

## 6. Common Issues và Solutions

### Issue: Migrations không chạy
**Solution**: 
- Check database connection trong `application.properties`
- Check `spring.flyway.enabled=true`
- Restart app

### Issue: 404 Not Found
**Solution**:
- Check routes trong `App.tsx`
- Check menu config trong `menuConfig.ts`
- Verify backend endpoints đang chạy

### Issue: 401 Unauthorized
**Solution**:
- Check JWT token
- Verify user role (Mentor/Learner)
- Check `@PreAuthorize` annotations

### Issue: 500 Internal Server Error
**Solution**:
- Check backend logs
- Verify database tables exist
- Check foreign key constraints
- Check null values in required fields

## 7. Deployment Checklist

### Pre-deployment
- [ ] All migrations tested
- [ ] All endpoints tested
- [ ] Frontend UI tested
- [ ] Environment variables configured
- [ ] Database backup created

### Deployment Steps
1. Backup database
2. Deploy backend (Spring Boot app)
3. Verify migrations ran successfully
4. Deploy frontend (build và deploy static files)
5. Test all features
6. Monitor logs for errors

### Post-deployment
- [ ] Verify all endpoints accessible
- [ ] Test user flows end-to-end
- [ ] Monitor error logs
- [ ] Check database performance

## 8. Performance Testing

### Load Testing
- Test với multiple concurrent users
- Test assessment creation under load
- Test resource retrieval performance
- Test peer practice matching algorithm

### Database Performance
- Check indexes on foreign keys
- Monitor query performance
- Check for N+1 query issues
- Optimize if needed

## 9. Security Testing

- [ ] Verify JWT authentication works
- [ ] Test role-based access control
- [ ] Verify mentors can only access their own data
- [ ] Test SQL injection prevention
- [ ] Verify CORS configuration

## 10. Documentation

- [ ] API documentation updated
- [ ] User guide updated
- [ ] Deployment guide updated
- [ ] Troubleshooting guide updated
