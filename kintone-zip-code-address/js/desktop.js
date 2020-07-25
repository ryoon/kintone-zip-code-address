/*
 * Copyright (c) 2016 Cybozu
 * create by masaya chikamoto
 * Copyright (c) 2020 Ryo ONODERA <ryo@tetera.org>
 * All rights reserved.
 *
 * Licensed under the MIT License
 */
jQuery.noConflict();
(function($, PLUGIN_ID) {
  'use strict';

  var outer = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (outer.length != 0) {
    var config = JSON.parse(outer.config);

    // 郵便番号から住所を取得する。
    function get_address(idx) {
      var myzipButton = document.createElement('button');
      var label;
      if (config.data[idx].myzipconfig_3.length != 0) {
        label = config.data[idx].myzipconfig_3;
      } else {
        label = '住所取得'
      }
      myzipButton.innerText = label;
      myzipButton.style.marginTop = '10%';
      myzipButton.onclick = function() {
        var record = kintone.app.record.get();
        var zipCode = record.record[config.data[idx].myzipconfig_0].value;
        var uri = ' https://zipcloud.ibsnet.co.jp/api/search' +
          '?limit=1&zipcode=' + zipCode;
        // 1件のみ住所を取得する。
        kintone.proxy(uri,
          'GET',
          {},
          {},
          function(body, status, headers) {
            var resultBody = JSON.parse(body);
            if (resultBody.status == '200') {
              var result = resultBody.results[0];
              var address = result.address1 + result.address2 + result.address3;

              // 画面に取得した住所を書き込む。
              var record = kintone.app.record.get();
              record.record[config.data[idx].myzipconfig_1].value = address;
              kintone.app.record.set(record);
            }
        });
      };

      // ボタンを配置する。
      var space = kintone.app.record.getSpaceElement(config.data[idx].myzipconfig_2);
      if (space) {
        space.appendChild(myzipButton);
      }
    };

    function get_addresses() {
      for (var i = 0; i < config.data.length; i++) {
        get_address(i);
      }
    }

    kintone.events.on([
      'app.record.create.show',
      'app.record.edit.show'
    ], get_addresses);
  }

})(jQuery, kintone.$PLUGIN_ID);
