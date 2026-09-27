# API 文档

## 会员注册接口

```http
POST /api/v1/member/register
Content-Type: application/json
```

### 请求参数

```json
{
  "phone": "13800138000",
  "source": "wechat",
  "mall_id": "M2024001"
}
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "member_id": "12345",
    "phone": "13800138000",
    "level": 1,
    "points": 0,
    "created_at": "2024-04-19T10:00:00Z"
  }
}
```

## 积分查询接口

```http
GET /api/v1/points/balance?member_id=12345&mall_id=M2024001
```

### 响应示例

```json
{
  "code": 0,
  "data": {
    "member_id": "12345",
    "balance": 1250,
    "total_earned": 5000,
    "total_used": 3750
  }
}
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 40001 | 参数错误 |
| 40002 | 会员不存在 |
| 40003 | 积分不足 |
| 50001 | 系统错误 |
