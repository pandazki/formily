import _extends from "@babel/runtime/helpers/extends";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/asyncToGenerator";
import { createForm, LifeCycleTypes } from '@uform/core';
import SelectorCore from 'selector-core';
import ExpressionRun from "expression-run";
import _get from 'lodash.get';
var CustomEventName;

(function (CustomEventName) {
  CustomEventName["ValidatedError"] = "validatedError";
  CustomEventName["SromRest"] = "sormReset";
})(CustomEventName || (CustomEventName = {}));

var Supported = {
  input: true,
  textarea: true,
  radio: true,
  radioGroup: true,
  checkbox: true,
  checkboxGroup: true,
  "switch": true,
  slider: true,
  pickerView: true,
  picker: true,
  view: true,
  cascade: true,
  "image-upload": true,
  "date-picker": true,
  "radio-group": true,
  "checkbox-group": true,
  "picker-view": true
};

var Sorm = /*#__PURE__*/function () {
  function Sorm() {}

  var _proto = Sorm.prototype;

  _proto.init = function init() {
    this.core = createForm({
      onChange: function onChange(values) {
        console.log(values);
      },
      //表单提交事件回调
      onSubmit: function onSubmit(values) {},
      //表单重置事件回调
      onReset: function onReset() {},
      //表单校验失败事件回调
      onValidateFailed: function onValidateFailed(validated) {}
    });
  };

  _proto.parseExpressions = function parseExpressions(props) {
    var linkages = []; // 花括号

    var checkBrace = /^\{\{(.*?)\}\}$/; // root.value

    var checkRoot = /root\.value\.(\S*)/g;
    Object.keys(props).forEach(function (target) {
      var deps = [];
      var expression = {};
      var value = props[target];

      if (checkBrace.test(value) && checkRoot.test(value)) {
        var exp = value.replace(checkBrace, "$1");
        exp.replace(/root\.value\.([a-zA-Z]*)/g, function (m, a) {
          if (a === void 0) {
            a = "";
          }

          var _a$split = a.split("."),
              _a$split$ = _a$split[0],
              name = _a$split$ === void 0 ? "" : _a$split$;

          if (deps) {
            deps.push(name);
          }
        });

        if (deps.length > 0) {
          linkages.push({
            exp: exp,
            deps: deps,
            target: target
          });
        }
      }
    });
    return linkages;
  };

  _proto.schemaParser = function schemaParser(schema, parentKey) {
    var _this = this;

    var _schema$properties = schema.properties,
        properties = _schema$properties === void 0 ? {} : _schema$properties;
    var keys = Object.keys(properties);
    return keys.map(function (keyName, index) {
      var componentSchemaDesc = properties[keyName];
      var thisKey = parentKey ? parentKey + '.' + keyName : keyName;
      var formType = componentSchemaDesc.type,
          label = componentSchemaDesc.title,
          _componentSchemaDesc$ = componentSchemaDesc["x-component"],
          cname = _componentSchemaDesc$ === void 0 ? "view" : _componentSchemaDesc$,
          _componentSchemaDesc$2 = componentSchemaDesc["x-component-props"],
          cprops = _componentSchemaDesc$2 === void 0 ? {} : _componentSchemaDesc$2,
          fieldProps = componentSchemaDesc["x-props"],
          rules = componentSchemaDesc["x-rules"],
          childrenSchema = componentSchemaDesc.properties;
      cprops.visible = cprops.visible === void 0 ? true : cprops.visible;

      var linkages = _this.parseExpressions(cprops);

      var required = false;

      var field = _this.core.registerField({
        name: thisKey,
        initialValue: cprops.value,
        value: cprops.value,
        rules: rules
      });

      field.getState(function (state) {
        required = state.required;
      });
      cname = cname.toLocaleLowerCase();
      return {
        _supported: Supported[cname],
        component: {
          name: cname,
          props: cprops
        },
        linkages: linkages,
        required: required,
        hooks: [],
        listening: [],
        keyName: thisKey,
        label: label,
        formType: formType,
        fieldProps: fieldProps,
        childrends: _this.schemaParser(componentSchemaDesc, parentKey),
        getFormCore: function getFormCore() {
          return _this.getCore();
        }
      };
    });
  }
  /**
   * getValues
   */
  ;

  _proto.getValues = function getValues() {
    return this.initValue;
  };

  _proto.getCore = function getCore() {
    return this.core;
  };

  _proto.parse = function parse(schema) {
    this._schema = schema;
    return this.schemaParser(schema);
  };

  return Sorm;
}();

var InitForm = function InitForm(ref) {
  var _ref$props = ref.props,
      schema = _ref$props.schema,
      style = _ref$props.style,
      className = _ref$props["class"],
      onSubmit = _ref$props.onSubmit;
  var sorm = ref.sorm;
  sorm.init();
  var formCore = sorm.getCore();
  var components = sorm.parse(schema);
  ref.setData({
    schema: components,
    style: style,
    className: className,
    uiKey: Date.now().toString(32),
    useButton: !!onSubmit,
    submit: function submit() {
      ref.submit();
    },
    reset: function reset() {
      ref.reset();
    },
    getValues: function () {
      var _getValues = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee() {
        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                return _context.abrupt("return", new Promise(function (resolve, reject) {
                  sorm.getCore().getFormState(function (state) {
                    resolve(state.values);
                  });
                }));

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function getValues() {
        return _getValues.apply(this, arguments);
      }

      return getValues;
    }()
  });
};

export function getFormMixins() {
  var sorm = new Sorm();
  return [{
    onInit: function onInit() {
      this.sorm = sorm;
    },
    deriveDataFromProps: function deriveDataFromProps(props) {
      InitForm(this);
    },
    methods: {
      reset: function reset() {
        InitForm(this);
        this.init = true;
      },
      submit: function submit() {
        var core = sorm.getCore();
        var _this$props = this.props,
            onSubmit = _this$props.onSubmit,
            onError = _this$props.onError;
        core.submit(function (res) {
          onSubmit && onSubmit(res);
        })["catch"](function (err) {
          core.notify(CustomEventName.ValidatedError, err);
          onError && onError(err);
        });
      }
    }
  }];
}

var selfValidate = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee2(validate) {
    var res, _res, _res$errors, errors, errData, isError;

    return _regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return validate();

          case 3:
            res = _context2.sent;
            _context2.next = 10;
            break;

          case 6:
            _context2.prev = 6;
            _context2.t0 = _context2["catch"](0);
            console.error(_context2.t0);
            res = _context2.t0;

          case 10:
            _res = res, _res$errors = _res.errors, errors = _res$errors === void 0 ? [] : _res$errors;
            errData = errors[0] || {
              messages: []
            };
            isError = res.errors.length > 0;
            return _context2.abrupt("return", {
              isError: isError,
              errors: errData.messages
            });

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, null, [[0, 6]]);
  }));

  return function selfValidate(_x) {
    return _ref.apply(this, arguments);
  };
}();

var runCondition = function runCondition(condition, value) {
  return ExpressionRun(condition, {
    root: {
      value: value
    }
  });
};

var updateProps = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee3(core, linkages, depsName) {
    return _regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            return _context3.abrupt("return", new Promise(function (resolve, reject) {
              if (linkages.length > 0) {
                var state;
                core.getFormState(function (_ref3) {
                  var values = _ref3.values;
                  linkages.filter(function (v) {
                    return depsName ? v.deps.indexOf(depsName) > -1 : true;
                  }).map(function (exporession) {
                    var result = runCondition(exporession.exp, values);
                    if (!state) state = {};
                    state["cprops." + exporession.target] = result;
                  }); // this.setData(state)

                  state && resolve(state);
                });
              } else {
                reject(false);
              }
            }));

          case 1:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function updateProps(_x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

export function getFieldMixins() {
  return [{
    onInit: function onInit() {
      var _this2 = this;

      return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee4() {
        var _this2$props, component, getFormCore, keyName, linkages, core, cprops;

        return _regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _this2$props = _this2.props, component = _this2$props.component, getFormCore = _this2$props.getFormCore, keyName = _this2$props.keyName, linkages = _this2$props.linkages;
                core = getFormCore();
                core.subscribe(function (_ref4) {
                  var type = _ref4.type,
                      payload = _ref4.payload;

                  switch (type) {
                    // 验证失败
                    case CustomEventName.ValidatedError:
                      {
                        var _filter = (payload || []).filter(function (v) {
                          return v.path === keyName;
                        }),
                            _filter$ = _filter[0];

                        _filter$ = _filter$ === void 0 ? {} : _filter$;
                        var _filter$$path = _filter$.path,
                            path = _filter$$path === void 0 ? "" : _filter$$path,
                            _filter$$messages = _filter$.messages,
                            messages = _filter$$messages === void 0 ? [] : _filter$$messages;

                        if (path) {
                          _this2.setData({
                            isError: true,
                            errors: messages
                          });
                        }
                      }
                      break;
                    // 值重设

                    case CustomEventName.SromRest:
                      {
                        var uiValue = (payload || {})[keyName] || "";

                        _this2.setData({
                          isError: false,
                          errors: [],
                          uiValue: uiValue,
                          fieldKey: keyName + Date.now()
                        });
                      }
                      break;

                    case LifeCycleTypes.ON_FORM_CHANGE:
                      {
                        var name = ((payload || {}).state || {}).name;
                        updateProps(core, linkages, name).then(function (state) {
                          _this2.setData(_extends(_extends({}, state), {}, {
                            fieldKey: keyName + Date.now()
                          }));
                        })["catch"](function () {});
                      }
                      break;

                    default:
                      break;
                  }
                });
                cprops = {};
                _context4.prev = 4;
                _context4.next = 7;
                return updateProps(core, linkages);

              case 7:
                cprops = _context4.sent;
                _context4.next = 12;
                break;

              case 10:
                _context4.prev = 10;
                _context4.t0 = _context4["catch"](4);

              case 12:
                _this2.setData(_extends({
                  uiValue: component.props.value,
                  fieldKey: keyName + Date.now(),
                  cname: component.name,
                  cprops: component.props
                }, cprops));

              case 13:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, null, [[4, 10]]);
      }))();
    },
    methods: {
      onChange: function onChange(e) {
        var _this3 = this;

        return _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee6() {
          var _this3$props, getFormCore, keyName, validate, value, core, res;

          return _regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
              switch (_context6.prev = _context6.next) {
                case 0:
                  _this3$props = _this3.props, getFormCore = _this3$props.getFormCore, keyName = _this3$props.keyName, validate = _this3$props.validate;
                  value = e.detail ? e.detail.value : e.value;
                  core = getFormCore(); // setFieldValue(value)

                  core.setFieldValue(keyName, value);
                  _context6.next = 6;
                  return selfValidate( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee5() {
                    return _regeneratorRuntime.wrap(function _callee5$(_context5) {
                      while (1) {
                        switch (_context5.prev = _context5.next) {
                          case 0:
                            _context5.next = 2;
                            return core.validate(keyName);

                          case 2:
                            return _context5.abrupt("return", _context5.sent);

                          case 3:
                          case "end":
                            return _context5.stop();
                        }
                      }
                    }, _callee5);
                  })));

                case 6:
                  res = _context6.sent;

                  _this3.setData(_extends({
                    uiValue: value
                  }, res));

                case 8:
                case "end":
                  return _context6.stop();
              }
            }
          }, _callee6);
        }))();
      },
      onBlur: function onBlur(e) {},
      onFocus: function onFocus(e) {},
      onConfirm: function onConfirm(e) {},
      onChanging: function onChanging(e) {}
    }
  }];
}

var SelectorOninit = function SelectorOninit() {
  var _this$props$props = this.props.props,
      dataSource = _this$props$props.dataSource,
      value = _this$props$props.value;
  var selector = new SelectorCore(dataSource, [{
    value: value,
    label: value
  }]);
  selector.mixValueFromDataSource();
  var thisValue = selector.getValues()[0] || {
    value: undefined
  };

  var _dataSource = selector.getDataSource();

  this.setData({
    dataSource: _dataSource,
    value: thisValue.value,
    indexValue: (_dataSource.find(function (v) {
      return v.value === thisValue.value;
    }) || {
      indexValue: 0
    }).indexValue
  });
  this.selector = selector;
};

export function getFieldGroupMixin() {
  return [{
    onInit: SelectorOninit,
    methods: {
      onChange: function onChange(e) {
        var value = _get(e, "detail.value", undefined);

        var indexValue = value;

        var tagName = _get(e, "target.tagName", "");

        var selector = this.selector;

        if (tagName === "picker") {
          var source = selector.getDataSource()[value];
          value = selector.clean(source).value;
        }

        this.selector.change([{
          value: value,
          label: ""
        }], "single");
        this.selector.mixValueFromDataSource();
        this.setData({
          value: value,
          indexValue: indexValue,
          dataSource: selector.getDataSource()
        });
        this.props.onChange && this.props.onChange({
          value: value
        });
      }
    }
  }];
} // 多选多

export function getFieldGroupArrayMixin() {
  return [{
    onInit: function onInit() {
      var _this$props$props2 = this.props.props,
          dataSource = _this$props$props2.dataSource,
          value = _this$props$props2.value;
      var selector = new SelectorCore(dataSource, value.map(function (v) {
        return {
          value: v,
          label: v
        };
      }));
      selector.mixValueFromDataSource();
      this.setData({
        value: value,
        dataSource: selector.getDataSource()
      });
      this.selector = selector;
    },
    methods: {
      onChange: function onChange(e) {
        var value = _get(e, "detail.value", []);

        var selector = this.selector;
        selector.initValues(value.map(function (v) {
          return {
            value: v,
            label: v
          };
        }));
        this.setData({
          value: value,
          dataSource: selector.getDataSource()
        });
        this.props.onChange && this.props.onChange({
          value: value
        });
      }
    }
  }];
}