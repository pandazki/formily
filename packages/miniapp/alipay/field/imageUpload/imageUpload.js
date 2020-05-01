function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

import SelectorCore from 'selector-core';
import _get from 'lodash.get';
Component({
  mixins: [],
  data: {
    images: []
  },
  props: {},

  onInit() {
    var {
      value
    } = this.props.props;
    var dataSource = [];

    if (Array.isArray(value)) {
      dataSource = value;
    }

    dataSource = dataSource.map((v, i) => {
      return {
        label: i,
        value: v
      };
    });
    this.selector = new SelectorCore(dataSource, dataSource);
    this.setData({
      images: this.selector.getValues().map(v => v.value)
    });
  },

  didUpdate() {},

  didUnmount() {},

  methods: {
    uploadImage(api, path, header, formData) {
      return _asyncToGenerator(function* () {
        return new Promise((resolve, reject) => {
          my.uploadFile({
            url: api,
            fileType: 'image',
            fileName: "image_" + Date.now().toString(32),
            filePath: path,
            header,
            formData,
            success: res => {
              resolve(path);
            },

            fail(res) {
              console.error(res);
              reject(res);
            }

          });
        });
      })();
    },

    openPicker() {
      var {
        props,
        onChange
      } = this.props;
      var {
        sourceType = ['camera', 'album'],
        count = 9,
        // original 原图
        // compressed 压缩图
        sizeType = "compressed",
        header,
        formData,
        api
      } = props;
      my.chooseImage({
        sourceType,
        count,
        sizeType,
        success: res => {
          var {
            apFilePaths = []
          } = res;
          var ln = apFilePaths.length;
          this.setData({
            loading: true
          });
          apFilePaths.map((path, index) => {
            this.uploadImage(api, path, header, formData).then(path => {
              var values = [...this.data.images, path];
              var source = values.map(v => {
                return {
                  value: v,
                  label: ""
                };
              });
              this.selector = new SelectorCore(source, source);
              this.setData({
                images: values
              });
              onChange && onChange({
                value: values
              });
            }).catch(() => {
              my.showToast({
                content: "\u7B2C" + index + "\u5F20\u4E0A\u4F20\u5931\u8D25"
              });
            }).finally(() => {
              ln = ln - 1;

              if (ln === 0) {
                this.setData({
                  loading: false
                });
              }
            });
          });
        },
        fail: () => {}
      });
    },

    deleteOne(e) {
      var value = _get(e, "target.dataset.value");

      this.selector.change([{
        value,
        label: ""
      }], "mutil");
      this.setData({
        images: this.selector.getValues().map(v => v.value)
      });
    }

  }
});