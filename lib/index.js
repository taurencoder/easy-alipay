var defaultConfig = require('./default-config'),
    alipaySubmit = require('./alipay-submit'),
    xml2js = require('xml2js'),
    xmlParser = new xml2js.Parser({explicitArray: false}),
    _ = require('underscore');

var alipay = module.exports = {
  Payment: {
    createDirectPay: function(partnerId, partnerKey, sellerEmail, subject, outTradeNumber, totalFee, description, showUrl, notifyUrl) {
      var requestData = _.extend({}, defaultConfig.bizData, {
        service: 'create_direct_pay_by_user',
        subject: subject,
        out_trade_no: outTradeNumber,
        total_fee: totalFee,
        body: description,
        show_url: showUrl,
        notify_url: notifyUrl,
        partner: partnerId,
        seller_id: partnerId,
        seller_email: sellerEmail
      });

      var sysConfig = _.extend({}, defaultConfig.accessData, {key: partnerKey});

      return alipaySubmit.buildRequestUrl(requestData, sysConfig);
    },

    createWapDirectPay: function(subject, outTradeNumber, totalFee, description, showUrl, notifyUrl, partnerInfo) {
      var xmlBuilder = new xml2js.Builder({
        renderOpts: {'pretty': false},
        headless: true
      });

      var requestData = {
        subject: subject,
        out_trade_no: outTradeNumber,
        total_fee: totalFee,
        seller_account_name: partnerInfo.sellerEmail,
        notify_url: notifyUrl
      };


      var authParam = {
      };
      return '';
    }
  },

  Notification: {

  }
};
