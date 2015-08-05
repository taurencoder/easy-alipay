var thenify = require('thenify'),
  alipayCore = require('./alipay-core'),
  request = require('request'),
  camelize = require('camelize');

var alipayNotify = module.exports = {
  verifyNotification: function(param, partnerId, sysConfig) {
    return new Promise(function(resolve, reject) {
      if(Object.keys(param).length === 0) {
        reject();
      } else {
        var isValidSign = verifySignature(param, param.sign, true, sysConfig);
        verifyResponse(param.notify_id, partnerId, sysConfig).then(function(res) {
          if (res === 'true' && isValidSign) {
            resolve(camelize(param));
          } else {
            reject();
          }
        }, function() {
          reject();
        });
      }
    });
  },

  verifyNotificationWap: function(param, partnerId, sysConfig) {
    return new Promise(function(resolve, reject) {
      if(Object.keys(param).length === 0) {
        reject();
      } else {
        var isValidSign = verifySignature(param, param.sign, false, sysConfig);
        verifyResponse(param.notify_id, partnerId, sysConfig).then(function(res) {
          if (res === 'true' && isValidSign) {
            resolve(camelize(param));
          } else {
            reject();
          }
        }, function() {
          reject();
        });
      }
    });
  }
};

function verifySignature(param, sign, sortArgs, sysConfig) {
  var requestData = alipayCore.filterArguments(param);
  var prestr = '';
  if(sortArgs) {
    prestr = alipayCore.createLinkString(requestData);
  } else {
    prestr = alipayCore.createLinkStringNoSort(requestData);
  }

  return alipayCore.verifySignature(sysConfig.sign_type, prestr, sign, sysConfig.key, sysConfig._input_charset);
}

function verifyResponse(notifyId, partnerId, sysConfig) {
  var verifyUrl = sysConfig.https_verify_url + 'partner=' + partnerId + '&notify_id' + notifyId;
  return thenify(request.get)(verifyUrl);
}
