# Webhook 配置

当会员发生支付、积分变动、券领取等事件时，系统会向配置的 Webhook URL 推送事件通知。

## 配置方法

在管理后台「系统设置 → Webhook」中填写接收地址，并选择需要订阅的事件类型。

## 事件格式

```json
{
  "event": "payment.success",
  "timestamp": 1713502800,
  "data": {
    "member_id": "12345",
    "amount": 299.00,
    "points_earned": 299,
    "mall_id": "M2024001"
  }
}
```

## 事件类型

| 事件 | 说明 |
|------|------|
| `payment.success` | 支付成功 |
| `points.earn` | 积分增加 |
| `points.redeem` | 积分兑换 |
| `coupon.receive` | 券领取 |
| `level.upgrade` | 等级提升 |

## 安全验证

Webhook 请求头部包含签名，用于验证请求来源：

```
X-Webhook-Signature: sha256=<signature>
```

使用配置的 Secret Key 对请求体进行 HMAC-SHA256 签名，与头部值比对验证。
