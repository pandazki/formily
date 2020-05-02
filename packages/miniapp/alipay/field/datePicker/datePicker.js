import _extends from "@babel/runtime/helpers/extends";
var Format;

(function (Format) {
  Format["YMD"] = "yyyy-MM-dd";
  Format["HM"] = "HH:mm";
  Format["YMD_HM"] = "yyyy-MM-dd HH:mm";
  Format["YM"] = "yyyy-MM";
  Format["Y"] = "yyyy";
})(Format || (Format = {}));

var ValueType;

(function (ValueType) {
  ValueType["Format"] = "format";
  ValueType["Timestamp"] = "timestamp";
})(ValueType || (ValueType = {}));

var DateFormat = function DateFormat(format, timestamp) {
  if (format === void 0) {
    format = Format.YMD;
  }

  var date = new Date(timestamp);
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  return format.replace("yyyy", year.toString()).replace("MM", month.toString()).replace("dd", day.toString()).replace("HH", hours.toString()).replace("mm", minutes.toString());
};

var GetDateValue = function GetDateValue(value, props) {
  var valueType = props.valueType,
      format = props.format; // format to timestamp

  if (valueType === ValueType.Timestamp && format !== Format.HM) {
    var date = new Date(0);

    var _value$split = value.split(' '),
        ymd = _value$split[0],
        _value$split$ = _value$split[1],
        hm = _value$split$ === void 0 ? "00:00" : _value$split$;

    var _ymd$split = ymd.split('-'),
        year = _ymd$split[0],
        _ymd$split$ = _ymd$split[1],
        month = _ymd$split$ === void 0 ? 1 : _ymd$split$,
        _ymd$split$2 = _ymd$split[2],
        day = _ymd$split$2 === void 0 ? 1 : _ymd$split$2;

    var _hm$split = hm.split(":"),
        hours = _hm$split[0],
        minutes = _hm$split[1];

    date.setFullYear(+year);
    date.setMonth(+month - 1);
    date.setDate(+day);
    date.setHours(+hours);
    date.setMinutes(+minutes);
    return +date;
  }

  return value;
};

Component({
  mixins: [],
  data: {},
  props: {},
  didMount: function didMount() {
    var props = this.props.props;
    var valueType = props.valueType,
        value = props.value;
    var labelValue = value;

    if (value && !isNaN(+value) && valueType === ValueType.Timestamp) {
      labelValue = DateFormat(props.format, +value);
    }

    this.setData({
      labelValue: labelValue,
      value: labelValue
    });
  },
  didUpdate: function didUpdate() {},
  didUnmount: function didUnmount() {},
  methods: {
    openPicker: function openPicker() {
      var _this = this;

      var labelValue = this.data.labelValue;
      var _this$props = this.props,
          _this$props$props = _this$props.props,
          props = _this$props$props === void 0 ? {} : _this$props$props,
          onChange = _this$props.onChange;
      props.format = props.format || Format.YMD;

      if (labelValue) {
        props.currentDate = labelValue;
      } else if (!props.currentDate) {
        props.currentDate = DateFormat(props.format, Date.now());
      }

      my.datePicker && my.datePicker(_extends(_extends({}, props), {}, {
        success: function success(res) {
          var date = res.date;
          var value = GetDateValue(date, props);

          _this.setData({
            value: value,
            labelValue: date
          });

          onChange && onChange({
            value: value
          });
        },
        fail: function fail(res) {},
        complete: function complete(res) {}
      }));
    }
  }
});