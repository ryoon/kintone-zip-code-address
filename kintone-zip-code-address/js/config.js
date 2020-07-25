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

function getMySpaceFields() {
  var promise = new kintone.Promise(function(resolve, reject) {
    var myzipSpaceFields = [];
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
            for (var j = 0; j < row.fields.length; j++) {
              var spaceField = row.fields[j];
              if (spaceField.type === 'SPACER' && spaceField.elementId !== '') {
                myzipSpaceFields.push({
                  code: spaceField.elementId,
                  label: spaceField.elementId
                });
              }
            }
          }
        }

        resolve(
          myzipSpaceFields
        );
      }
    );

  });

  return promise;
}

function getMyTextFields() {
  var myzipTextFields = [];
  var promise = new kintone.Promise(function(resolve, reject) {
    var vm = {};
    kintone.api(kintone.api.url('/k/v1/preview/app/form/fields', true),
      'GET',
      {'app': kintone.app.getId()},
      function(resp) {
        for (var key in resp.properties) {
          if (!resp.properties.hasOwnProperty(key)) {
            continue;
          }

          var prop = resp.properties[key];
          if (prop.type == 'SINGLE_LINE_TEXT') {
              myzipTextFields.push({
                code: prop.code,
                label: prop.label
              });
          }
        }

        resolve(
          myzipTextFields
        );
      });
  });

  return promise;
}

function setDefaults(values) {
  var outer = kintone.plugin.app.getConfig(PLUGIN_ID);
  if (outer.length == 0 || outer.length == 'undefined') {
    console.log("Init");   
    var data = {
      myzipZipCode_options: values[0],
      myzipAddress_options: values[0],
      myzipButton_options: values[1],
      data: [{
        myzipconfig_0: "",
        myzipconfig_1: "",
        myzipconfig_2: "",
        myzipconfig_3: ""
      }]
    };
  } else {
    console.log("Restore");
    var data = {
      myzipZipCode_options: values[0],
      myzipAddress_options: values[0],
      myzipButton_options: values[1]
    }
    var storedData = JSON.parse(outer.config);
    data.data = storedData.data;
  }

  var settings = new Vue({
    el: '#settings',
    data: {
      settings: data
    },
    methods: {
      myzipAddCondition: function(event) {
        console.log(JSON.stringify(this.settings));
        var selfId = parseInt($(event.target.parentNode).attr('id'));
        this.settings.data.splice(selfId + 1, 0, Object.assign({}, this.settings.data[selfId]));
      },
      myzipRemoveCondition: function(event) {
        console.log(this.settings);
        if ($('.myzipCodeAddress').length > 1) {
          var selfId = parseInt($(event.target.parentNode).attr('id'));
          this.settings.data.splice(selfId, 1);
        }
      },
      myzipSaveConf: function(event) {
        var savingConfig = {};
        savingConfig.config = JSON.stringify(this.settings);
        kintone.plugin.app.setConfig(savingConfig);
      },
      myzipBackToPrev: function(event) {
        history.back();
      }
    }
  });
}

kintone.Promise.all([
  getMyTextFields(),
  getMySpaceFields()
]).then(function(values) {
  setDefaults(values);
});

})(jQuery, kintone.$PLUGIN_ID);
