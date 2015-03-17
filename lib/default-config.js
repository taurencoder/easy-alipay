module.exports = {
  bizData: {
    'partner': '',
    'seller_email': '',
    'notify_url': '',
    'notify_url_wap': '',
    '_input_charset': 'utf-8',
    'sign_type': 'MD5',
    'payment_type': 1
  },

  accessData: {
    'https_verify_url': 'https://mapi.alipay.com/gateway.do?service=notify_verify&',
    'http_verify_url': 'http://notify.alipay.com/trade/notify_query.do?',
    'alipay_gateway': 'https://mapi.alipay.com/gateway.do?',
    'alipay_gateway_wap': 'http://wappaygw.alipay.com/service/rest.htm?',
    'key': '',
    'sign_type': this.bizData.sign_type,
    '_input_charset': this.bizData._input_charset
  }
};
