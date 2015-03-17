var alipayCore = require('./alipay-core'),
  thenify = require('thenify'),
  request = require('request'),
  qs = require('querystring');

var alipaySubmit = module.exports = {
  buildRequestUrl: function(paramTemp, sysConfig) {
    var requestData = buildRequestParameter(paramTemp, sysConfig);
    return sysConfig.alipay_gateway + qs.stringify(requestData);
  },

  buildRequestUrlWap: function(paramTemp, sysConfig) {
    var requestData = buildRequestParameter(paramTemp, sysConfig);
    return sysConfig.alipay_gateway_wap + qs.stringify(requestData);
  },

  getRequestToken: function(paramTemp, sysConfig) {
    var requestUrl = alipaySubmit.buildRequestUrlWap(paramTemp, sysConfig);
    return thenify(request.get)(requestUrl);
  }
};

function buildRequestSignature(param, partnerKey, signType, inputCharset) {
  var prestr = alipayCore.createLinkString(param);
  return alipayCore.createSignature(signType, prestr, partnerKey, inputCharset);
}

function buildRequestParameter(paramTemp, sysConfig) {
  var requestParam = alipayCore.filterArguments(paramTemp);
  var sign = buildRequestSignature(requestParam, sysConfig.key, sysConfig.sign_type, sysConfig._input_charset);
  requestParam.sign = sign;

  if (paramTemp.service !== 'alipay.wap.trade.create.direct' &&
      paramTemp.service !== 'alipay.wap.auth.authAndExecute') {
    requestParam.sign_type = sysConfig.sign_type;
  }

  return requestParam;
}
