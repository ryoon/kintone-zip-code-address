/*
 * 設定画面制御
 *
 * Licensed under the MIT License
 *
 * Copyright (c) 2016 Cybozu
 * create by masaya chikamoto
 *
 * Copyright (c) 2017 Cybozu
 * Author : cstap inc. Takuji Takei
 *
 * Copyright (c) 2020 Ryo ONODERA <ryo@tetera.org>
 * All rights reserved.
 */

jQuery.noConflict();

(function($, PLUGIN_ID) {
'use strict';

function escapeHtml(htmlstr) {
  // nullチェック
  if (htmlstr === null) {
    return '';
  } try {
    return htmlstr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      } catch (e) {
        return htmlstr;
      }
}

// スペースフィールドを取得し、class=myzip-buttonに追加する。
function getMySpaceFields() {
  var promise = new kintone.Promise(function(resolve, reject) {
    kintone.api(kintone.api.url('/k/v1/preview/app/form/layout', true),
      'GET',
      {'app': kintone.app.getId()},
      function(resp) {
        for (var i = 0; i < resp.layout.length; i++) {
          var row = resp.layout[i];
          // サブテーブル内は対象外
          if (row.type == 'SUBTABLE') {
            continue;
          }

          if (row.type == 'ROW') {
            for (var i = 0; i < row.fields.length; i++) {
              var spaceField = row.fields[i];
              var appendedHtml;
              if (spaceField.type === 'SPACER' && spaceField.elementId !== '') {
                appendedHtml = $('<option value = ' + '"' +
                  escapeHtml(spaceField.elementId) + '">' +
                  escapeHtml(spaceField.elementId) + '</option>');
                resolve($('.myzip-button').append(appendedHtml.clone()));
console.log(appendedHtml);
              }
            }
          }
        }
    });
  });
  return promise;
}

function getMyTextFields() {
  var promise = new kintone.Promise(function(resolve, reject) {
    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true),
      'GET',
      {'app': kintone.app.getId()},
      function(resp) {
        for (var key in resp.properties) {
          if (!resp.properties.hasOwnProperty(key)) {
            continue;
          }

          var prop = resp.properties[key];
          var appendedHtml;
          if (prop.type == 'SINGLE_LINE_TEXT') {
            appendedHtml = $('<option value = ' + '"' +
              escapeHtml(prop.code) + '">' +
              escapeHtml(prop.label) + '</option>');
              resolve($('.myzip-text-field').append(appendedHtml));
console.log(appendedHtml);
          }
        }
      }
    );
  });
  return promise;
}



function setDefaults() {
  var outer = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (outer.length != 0) {
    var config = JSON.parse(outer.config);
console.log(config);
    $('#myzip-zipcode-field').val(config.myzipconfig_0);
    $('#myzip-address-field').val(config.myzipconfig_1);
    $('#myzip-button-field').val(config.myzipconfig_2);
    $('#myzip-label-text').val(config.myzipconfig_3);
  }
}

$('#zip-code-address-submit').click(function() {
  var config = {};
  var myzipConfig = {};
  $('.config-items').each(function(index, value) {
    myzipConfig['myzipconfig_' + index] = $(this).val();
  });
  // プラグイン固有の設定値のストレージは文字列しか保存できないので、
  // 設定JSONは文字列にして格納する。
  config.config = JSON.stringify(myzipConfig);

  kintone.plugin.app.setConfig(config);
});

// キャンセルボタンを押したら一つ前のページに戻る。
$('#zip-code-address-cancel').click(function() {
  history.back();
});

kintone.Promise.all([
  getMyTextFields(),
  getMySpaceFields()
]).then(function(values) {
  setDefaults();
  console.log("done")
}
);

})(jQuery, kintone.$PLUGIN_ID);
