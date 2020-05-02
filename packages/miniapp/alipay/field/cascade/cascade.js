Component({
  onInit: function onInit() {
    var props = this.props.props;
    var value = props.value;

    if (Array.isArray(value)) {
      this.setData({
        labelValue: value.map(function (v) {
          return v.name;
        }).join(">")
      });
    }
  },
  methods: {
    openPicker: function openPicker() {
      var _this = this;

      var _this$props = this.props,
          props = _this$props.props,
          onChange = _this$props.onChange;
      var dataSource = props.dataSource,
          _props$placeholder = props.placeholder,
          placeholder = _props$placeholder === void 0 ? "请选择" : _props$placeholder;
      my.multiLevelSelect && my.multiLevelSelect({
        title: placeholder,
        list: dataSource,
        success: function success(res) {
          _this.setData({
            labelValue: res.result.map(function (v) {
              return v.name;
            }).join(">")
          });

          onChange && onChange({
            value: res.result
          });
        },
        name: placeholder,
        fail: function fail() {}
      });
    }
  }
});