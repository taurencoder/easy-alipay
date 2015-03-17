var defaultConfig = require('./default-config'),
  alipaySubmit = require('./alipay-submit'),
  xml2js = require('xml2js'),
  xmlParser = new xml2js.Parser({explicitArray: false}),
  xmlBuilder = new xml2js.Builder({renderOpts: {'pretty': false}, headless: true}),
  thenify = require('thenify'),
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

    createDirectPayWap: function(partnerId, partnerKey, sellerEmail, subject, outTradeNumber, totalFee, description, showUrl, notifyUrl) {
      var sysConfig = _.extend({}, defaultConfig.accessData, {key: partnerKey});
      var tokenData = xmlBuilder.buildObject({'direct_trade_create_req': {
        subject: subject,
        out_trade_no: outTradeNumber,
        total_fee: totalFee,
        seller_account_name: sellerEmail,
        notify_url: notifyUrl
      }});

      var genericParam = {
        partner: partnerId,
        sec_id: defaultConfig.sign_type,
        format: 'xml',
        v: '2.0'
      };

      var authParam = _.extend({
        service: 'alipay.wap.trade.create.direct',
        req_id: outTradeNumber,
        req_data : tokenData
      }, genericParam);

      return alipaySubmit.getRequestToken(authParam, sysConfig).then(parseTokenResposne).then(function(err, res) {
        var requestToken = res.direct_trade_create_res.request_token;
        var tradeData = xmlBuilder.buildObject({'auth_and_execute_req': {'request_token': requestToken}});

        var tradeParam = _.extend({
          service: 'alipay.wap.auth.authAndExecute',
          req_data : tradeData
        }, baseParam);

        return alipaySubmit.buildRequestUrlForWap(tradeParam);
      });

      function parseTokenResposne(err, res, body) {
        thenify(xmlParser.parseString)(body);
      }
    }
  },

  Notification: {

  }
};
