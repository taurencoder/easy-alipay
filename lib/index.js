var defaultConfig = require('./default-config');
var alipaySubmit = require('./alipay-submit');
var alipayNotify = require('./alipay-notify');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser({explicitArray: false});
var xmlBuilder = new xml2js.Builder({renderOpts: {'pretty': false}, headless: true});
var thenify = require('thenify');
var request = require('request');
var qs = require('querystring');
var _ = require('underscore');
var CHECK_PAYMENT_FAILED = 'Meet error checking alipay trade status';

function preProcessXML(origin) {
  return origin.replace(/&/g, '&amp;');
}

module.exports = {
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

    createBatchRefundPwd: function(partnerId, partnerKey, sellerEmail, batchNo, batchNum, detailData, refundDate, notifyUrl) {
      var requestData = {
        service: 'refund_fastpay_by_platformpwd',
        partner: partnerId,
        _input_charset: defaultConfig.bizData._input_charset,
        sign_type: defaultConfig.bizData.sign_type,
        notify_url: notifyUrl,
        seller_email: sellerEmail,
        refund_date: refundDate,
        batch_no: batchNo,
        batch_num: batchNum,
        detail_data: detailData
      };
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
      .then(function(res) {
        var tradeData = xmlBuilder.buildObject({'auth_and_execute_req': {'request_token': res.direct_trade_create_res.request_token}});
        var tradeParam = _.extend({
          service: 'alipay.wap.auth.authAndExecute',
          req_data : tradeData
        }, genericParam);

        return alipaySubmit.buildRequestUrlWap(tradeParam, sysConfig);
      });

      function parseTokenResposne(res) {
        return thenify(xmlParser.parseString)(qs.parse(res[0].body).res_data);
      }
    },

    isTradeSuccessed: function(partnerId, partnerKey, outTradeNo) {
      var requestData = {
        service: 'account.page.query',
        partner: partnerId,
        _input_charset: defaultConfig.bizData._input_charset,
        sign_type: defaultConfig.bizData.sign_type,
        page_no: 1,
        merchant_out_order_no: outTradeNo
      };

      var sysConfig = _.extend({}, defaultConfig.accessData, {key: partnerKey});
      var checkUrl = alipaySubmit.buildRequestUrl(requestData, sysConfig);
      return thenify(request.get)(checkUrl)
      .then(parseXmlResponse)
      .then(function(res) {
        return new Promise(function(resolve, reject) {
          if (!res) {
            reject(CHECK_PAYMENT_FAILED);
          } else if (res && res.alipay.response.account_page_query_result.account_log_list) {
            var logList = res.alipay.response.account_page_query_result.account_log_list;
            if (_.isArray(logList) && logList.length > 0 || _.isObject(logList.AccountQueryAccountLogVO)) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        });
      });

      function parseXmlResponse(res) {
        return thenify(xmlParser.parseString)(res[0].body);
      }
    }
  },

  Notification: {
    directPayNotify: function(notification, partnerId, partnerKey) {
      var sysConfig = _.extend({}, defaultConfig.accessData, {key: partnerKey});
      return alipayNotify.verifyNotification(notification, partnerId, sysConfig);
    },

    directPayNotifyWap: function(notification, partnerId, partnerKey) {
      var sysConfig = _.extend({}, defaultConfig.accessData, {key: partnerKey});
      notification.notify_data = qs.unescape(notification.notify_data);

      return thenify(xmlParser.parseString)(preProcessXML(notification.notify_data))
      .then(function(res) {
        notification.notify_id = res.notify.notify_id;
        notification.notify = res.notify;
        return alipayNotify.verifyNotificationWap(notification, partnerId, sysConfig);
      });
    }
  }
};
