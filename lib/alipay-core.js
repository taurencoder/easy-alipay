var crypto = require('crypto'),
  _ = require('underscore');

var alipayCore = module.exports = {
  createSignature: function(signType, text, key, charset) {
    text = '' + text + key;
    return crypto.createHash(signType.toLowerCase()).update(text, charset).digest('hex');
  },

  verifySignature: function(signType, text, sign, key, charset) {
    return sign === alipayCore.createSignature(signType, text, key, charset);
  },

  sortArguments: function(param) {
    var result = new Object({});
    var keys = Object.keys(param).sort();
    _(keys).each(function(key) {
      result[key] = param[key];
    });

    return result;
  },

  filterArguments: function(param) {
    var result = new Object({});
    if (!param || param.length <= 0) {
      return result;
    }

    _(Object.keys(param)).each(function(key) {
      if (key !== 'sign' && key !== 'sign_type' && param[key] !== '') {
        result[key] = param[key];
      }
    });

    return result;
  },

  createLinkString: function(param) {
    param = alipayCore.sortArguments(param);

    var prestr = '';
    _(Object.keys(param)).each(function(key) {
      prestr = prestr + key + '=' + param[key] + '&';
    });

    return prestr.substring(0, prestr.length - 1);
  },

  createLinkStringNoSort: function(param) {
    var prestr = '';
    prestr += 'service=' + param.service;
    prestr += '&v=' + param.v;
    prestr += '&sec_id=' + param.sec_id;
    prestr += '&notify_data=' + param.notify_data;
    return prestr;
  }
};
