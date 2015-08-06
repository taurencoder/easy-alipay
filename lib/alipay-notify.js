var thenify = require('thenify'),
  alipayCore = require('./alipay-core'),
  request = require('request'),
  camelize = require('camelize');

var VALIDATION_ERR = 'Alipay request validation failed';
var PARAM_LENGTH_ERR = 'Invalid parameter length';
module.exports = {
  verifyNotification: function(param, partnerId, sysConfig) {
    return new Promise(function(resolve, reject) {
      if(Object.keys(param).length === 0) {
        reject(PARAM_LENGTH_ERR);
      } else {
        var isValidSign = verifySignature(param, param.sign, true, sysConfig);
        verifyResponse(param.notify_id, partnerId, sysConfig).then(function(res) {
          if (res[0].body === 'true' && isValidSign) {
            resolve(camelize(param));
          } else {
            reject(VALIDATION_ERR);
          }
        }, function() {
          reject(VALIDATION_ERR);
        });
      }
    });
  },

  verifyNotificationWap: function(param, partnerId, sysConfig) {
    return new Promise(function(resolve, reject) {
      if(Object.keys(param).length === 0) {
        reject(PARAM_LENGTH_ERR);
      } else {
        var isValidSign = verifySignature(param, param.sign, false, sysConfig);
        verifyResponse(param.notify_id, partnerId, sysConfig).then(function(res) {
          if (res[0].body === 'true' && isValidSign) {
            resolve(camelize(param.notify));
          } else {
            reject(VALIDATION_ERR);
          }
        }, function() {
          reject(VALIDATION_ERR);
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
  var verifyUrl = sysConfig.https_verify_url + 'partner=' + partnerId + '&notify_id=' + notifyId;
  return thenify(request.get)(verifyUrl);
}
