var defaultConfig = require('./default-config'),
  alipaySubmit = require('./alipay-submit'),
  alipayNotify = require('./alipay-notify'),
  xml2js = require('xml2js'),
  xmlParser = new xml2js.Parser({explicitArray: false}),
  xmlBuilder = new xml2js.Builder({renderOpts: {'pretty': false}, headless: true}),
  thenify = require('thenify'),
  qs = require('querystring'),
  _ = require('underscore');

var alipay = module.exports = {
  Payment: {
    createDirectPay: function(partnerId, partnerKey, sellerEmail, subject, outTradeNumber, totalFee, description, showUrl, notifyUrl, returnUrl) {
      var requestData = _.extend({}, defaultConfig.bizData, {
        service: 'create_direct_pay_by_user',
        subject: subject,
        out_trade_no: outTradeNumber,
        total_fee: totalFee,
        body: description,
        show_url: showUrl,
        notify_url: notifyUrl,
        return_url: returnUrl,
        partner: partnerId,
        seller_id: partnerId,
        seller_email: sellerEmail
      });
      var sysConfig = _.extend({}, defaultConfig.accessData, {key: partnerKey});

      return alipaySubmit.buildRequestUrl(requestData, sysConfig);
    },

    createDirectPayWap: function(partnerId, partnerKey, sellerEmail, subject, outTradeNumber, totalFee, description, showUrl, notifyUrl, callbackUrl) {
      var sysConfig = _.extend({}, defaultConfig.accessData, {key: partnerKey});
      var genericParam = {
        partner: partnerId,
        sec_id: sysConfig.sign_type,
        format: 'xml',
        v: '2.0'
      };

      var tokenData = xmlBuilder.buildObject({'direct_trade_create_req': {
        subject: subject,
        out_trade_no: outTradeNumber,
        total_fee: totalFee,
        seller_account_name: sellerEmail,
        notify_url: notifyUrl,
        call_back_url: callbackUrl
      }});

      var authParam = _.extend({
        service: 'alipay.wap.trade.create.direct',
        req_id: outTradeNumber,
        req_data : tokenData
      }, genericParam);

      return alipaySubmit.getRequestToken(authParam, sysConfig)
      .then(parseTokenResposne)
      .then(function(res, err) {
        var tradeData = xmlBuilder.buildObject({'auth_and_execute_req': {'request_token': res.direct_trade_create_res.request_token}});
        var tradeParam = _.extend({
          service: 'alipay.wap.auth.authAndExecute',
          req_data : tradeData
        }, genericParam);

        return alipaySubmit.buildRequestUrlWap(tradeParam, sysConfig);
      });

      function parseTokenResposne(res, err) {
        return thenify(xmlParser.parseString)(qs.parse(res[0].body).res_data);
      }
    }
  },

  Notification: {
    directPayNotify: function(notification, partnerId) {
      return alipayNotify.verifyNotification(notification, partner_id, defaultConfig.accessData);
    },

    directPayNotifyWap: function(notification, partner_id) {
      return thenify(xmlParser.parseString)(qs.unescape(notification.notify_data))
      .then(function(res, err) {
        notification.notify_data =  res;
        notification.notify_id = res.notify.notify_id;
        return alipayNotify.verifyNotificationWap(notification, partner_id, defaultConfig.accessData);
      });
    }
  }
};
