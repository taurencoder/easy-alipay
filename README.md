## easy-alipay
Nodejs based Alipay payment & notification APIs

## API

### Payment.createDirectPay()
Create an Ali direct payment, return an Ali url so client can go to Ali pages to process payments.

#### Example
```js
var alipay = require('easy-alipay').Payment;
var paymentUrl = alipay.createDirectPay(partnerId, partnerKey, sellerEmail, requestData.subject,
      requestData.outTradeNumber, requestData.totalFee, requestData.body, requestData.showUrl,
      notifyUrl, returnUrl);
```

### Payment.createDirectPayWap()
Returns an promise. WAP version of `Payment.createDirectPay()`, which submit a XML format request to ALIPAY and returns an redirect url with valid request token.

### Notification.directPayNotify(notification, partnerId, partnerKey)
Returns an promise which resolve with a JSON version of ALIPAY payment notification, and reject when the notification is not from ALIPAY or signature verification failed.

#### Example
```js
var alipayNotification = require('easy-alipay').Notification;
try {
  alipayNotification.directPayNotify(notifyData, partnerId, partnerKey);
} catch (err) {
  console.error(err);
}
```

### Notification.directPayNotifyWap(notification, partnerId, partnerKey)
WAP version of `Notification.directPayNotify()`, which accepts a XML format payment notification.

## LICENSE
MIT
