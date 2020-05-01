Page({
  data: {
    schema: {
      "type": "object",
      "title": "我是表单标题",
      "description": "我是表单描述",
      "properties": {
        "custom": {
          "title": "自定义组件",
          "x-component": "custom"
        },
        "customB": {
          "title": "自定义组件B",
          "x-component": "custom"
        },
        "image-upload": {
          "title": "图片上传",
          "x-component": "image-upload",
          "x-component-props": {
            "value": [
              "https://resource/apml27c7b746f1663a9d627f07d35f62b64a.png"
            ],
            "api": "https://httpbin.org/post"
          }
        },
        "input": {
          "type": "string",
          "title": "输入框",
          "default": "xxx",
          "description": "我是字段描述",
          "x-props": {},
          "x-component": "input",
          "x-component-props": {
            "disabled": "{{root.value.switch == true}}"
          },
          "x-rules": [
            {}
          ]
        },
        "textarea": {
          "type": "string",
          "title": "多行输入",
          "default": "xxx",
          "description": "我是字段描述",
          "x-props": {},
          "x-component": "textarea",
          "x-component-props": {
            "value": "输入值"
          },
          "x-rules": [
            {
              "required": true
            }
          ]
        },
        "radio-group": {
          "type": "string",
          "title": "单选按钮",
          "default": "xxx",
          "description": "我是字段描述",
          "x-props": {},
          "x-component": "radio-group",
          "x-component-props": {
            "value": "angular",
            "disabled": "{{root.value.switch == true}}",
            "dataSource": [
              {
                "value": "angular",
                "label": "AngularJS",
                "color": "red"
              },
              {
                "value": "react",
                "label": "React"
              },
              {
                "value": "polymer",
                "label": "Polymer"
              },
              {
                "value": "vue",
                "label": "Vue.js"
              },
              {
                "value": "ember",
                "label": "Ember.js"
              },
              {
                "value": "backbone",
                "label": "Backbone.js",
                "disabled": true
              }
            ]
          },
          "x-rules": [
            {
              "required": true
            }
          ]
        },
        "checkbox-group": {
          "type": "string",
          "title": "多项选择",
          "default": "xxx",
          "description": "我是字段描述",
          "x-props": {},
          "x-component": "checkbox-group",
          "x-component-props": {
            "limit": 2,
            "value": [
              "react",
              "vue"
            ],
            "dataSource": [
              {
                "value": "angular",
                "label": "AngularJS",
                "color": "red"
              },
              {
                "value": "react",
                "label": "React"
              },
              {
                "value": "polymer",
                "label": "Polymer"
              },
              {
                "value": "vue",
                "label": "Vue.js"
              },
              {
                "value": "ember",
                "label": "Ember.js"
              },
              {
                "value": "backbone",
                "label": "Backbone.js",
                "disabled": true
              }
            ]
          },
          "x-rules": [
            {
              "required": true
            }
          ]
        },
        "switch": {
          "type": "string",
          "title": "开关",
          "default": "xxx",
          "description": "我是字段描述",
          "x-props": {},
          "x-component": "switch",
          "x-component-props": {
            "value": true
          },
          "x-rules": [
            {
              "required": true
            }
          ]
        },
        "slider": {
          "type": "string",
          "title": "滑动选择",
          "default": "xxx",
          "description": "我是字段描述",
          "x-props": {},
          "x-component": "slider",
          "x-component-props": {
            "min": 10,
            "step": 10,
            "max": 100,
            "show-value": true
          },
          "x-rules": [
            {
              "required": true
            }
          ]
        },
        "date-picker": {
          "type": "string",
          "title": "日期选择",
          "default": "xxx",
          "description": "我是字段描述",
          "x-props": {},
          "x-component": "date-picker",
          "x-component-props": {
            "value": "1575613980000",
            "format": "yyyy-MM-dd HH:mm",
            "valueType": "timestamp"
          },
          "x-rules": [
            {
              "required": true
            }
          ]
        },
        "picker": {
          "type": "string",
          "title": "下拉选择",
          "default": "xxx",
          "description": "我是字段描述",
          "x-props": {},
          "x-component": "picker",
          "x-component-props": {
            "value": "react",
            "dataSource": [
              {
                "value": "angular",
                "label": "AngularJS",
                "color": "red"
              },
              {
                "value": "react",
                "label": "React"
              },
              {
                "value": "polymer",
                "label": "Polymer"
              },
              {
                "value": "vue",
                "label": "Vue.js"
              },
              {
                "value": "ember",
                "label": "Ember.js"
              },
              {
                "value": "backbone",
                "label": "Backbone.js",
                "disabled": true
              }
            ]
          },
          "x-rules": [
            {
              "required": true
            }
          ]
        },
        "cascade": {
          "type": "string",
          "title": "级联单选",
          "x-component": "cascade",
          "x-component-props": {
            "value": [
              {
                "name": "杭州市"
              },
              {
                "name": "西湖区"
              },
              {
                "name": "文新街道"
              }
            ],
            "dataSource": [
              {
                "name": "杭州市",
                "subList": [
                  {
                    "name": "西湖区",
                    "subList": [
                      {
                        "name": "古翠街道"
                      },
                      {
                        "name": "文新街道"
                      }
                    ]
                  },
                  {
                    "name": "上城区",
                    "subList": [
                      {
                        "name": "延安街道"
                      },
                      {
                        "name": "龙翔桥街道"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          "x-rules": [
            {
              "required": true
            }
          ]
        }
      }
    }
  },
  changeSchema() {
    this.data.schema.properties.custom["x-component"] = "input"
    this.setData({
      schema: { ...this.data.schema }
    })

  },
  test(){
    console.log("12")
  },
  onLoad(query) {

    // 页面加载
    console.info(`Page onLoad with query: ${JSON.stringify(query)}`);
  },
  onReady() {
    // 页面加载完成
  },
  onShow() {
    // 页面显示
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面被关闭
  },
  onTitleClick() {
    // 标题被点击
  },
  onPullDownRefresh() {
    // 页面被下拉
  },
  onReachBottom() {
    // 页面被拉到底部
  },
  onShareAppMessage() {
    // 返回自定义分享信息
    return {
      title: 'My App',
      desc: 'My App description',
      path: 'pages/index/index',
    };
  },
  formSubmit(res) {
    console.log(res)

    my.alert({
      title: "提交成功"
    })
  }
});
