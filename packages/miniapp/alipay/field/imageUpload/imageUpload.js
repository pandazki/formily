import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import SelectorCore from 'selector-core';
import _get from 'lodash.get';
Component({
  mixins: [],
  data: {
    images: []
  },
  props: {},
  onInit: function onInit() {
    var value = this.props.props.value;
    var dataSource = [];

    if (Array.isArray(value)) {
      dataSource = value;
    }

    dataSource = dataSource.map(function (v, i) {
      return {
        label: i,
        value: v
      };
    });
    this.selector = new SelectorCore(dataSource, dataSource);
    this.setData({
      images: this.selector.getValues().map(function (v) {
        return v.value;
      })
    });
  },
  didUpdate: function didUpdate() {},
  didUnmount: function didUnmount() {},
  methods: {
    uploadImage: function uploadImage(api, path, header, formData) {
      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  my.uploadFile({
                    url: api,
                    fileType: 'image',
                    fileName: "image_" + Date.now().toString(32),
                    filePath: path,
                    header: header,
                    formData: formData,
                    success: function success(res) {
                      resolve(path);
                    },
                    fail: function fail(res) {
                      console.error(res);
                      reject(res);
                    }
                  });
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }))();
    },
    openPicker: function openPicker() {
      var _this = this;

      var _this$props = this.props,
          props = _this$props.props,
          onChange = _this$props.onChange;
      var _props$sourceType = props.sourceType,
          sourceType = _props$sourceType === void 0 ? ['camera', 'album'] : _props$sourceType,
          _props$count = props.count,
          count = _props$count === void 0 ? 9 : _props$count,
          _props$sizeType = props.sizeType,
          sizeType = _props$sizeType === void 0 ? "compressed" : _props$sizeType,
          header = props.header,
          formData = props.formData,
          api = props.api;
      my.chooseImage({
        sourceType: sourceType,
        count: count,
        sizeType: sizeType,
        success: function success(res) {
          var _res$apFilePaths = res.apFilePaths,
              apFilePaths = _res$apFilePaths === void 0 ? [] : _res$apFilePaths;
          var ln = apFilePaths.length;

          _this.setData({
            loading: true
          });

          apFilePaths.map(function (path, index) {
            _this.uploadImage(api, path, header, formData).then(function (path) {
              var values = [].concat(_this.data.images, [path]);
              var source = values.map(function (v) {
                return {
                  value: v,
                  label: ""
                };
              });
              _this.selector = new SelectorCore(source, source);

              _this.setData({
                images: values
              });

              onChange && onChange({
                value: values
              });
            })["catch"](function () {
              my.showToast({
                content: "\u7B2C" + index + "\u5F20\u4E0A\u4F20\u5931\u8D25"
              });
            })["finally"](function () {
              ln = ln - 1;

              if (ln === 0) {
                _this.setData({
                  loading: false
                });
              }
            });
          });
        },
        fail: function fail() {}
      });
    },
    deleteOne: function deleteOne(e) {
      var value = _get(e, "target.dataset.value");

      this.selector.change([{
        value: value,
        label: ""
      }], "mutil");
      this.setData({
        images: this.selector.getValues().map(function (v) {
          return v.value;
        })
      });
    }
  }
});