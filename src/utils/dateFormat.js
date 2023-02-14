function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}

export const formatDate = (date) => {
  return [padTo2Digits(date.getDate()), padTo2Digits(date.getMonth() + 1), date.getFullYear()].join("-");
};

export const formatDateDetail = (date) => {
  let h = ("0" + date.getHours()).slice(-2);
  let m = date.getMinutes();
  let s = date.getSeconds();

  let text = `${h}:${m}:${s}`;
  return [padTo2Digits(date.getDate()), padTo2Digits(date.getMonth() + 1), date.getFullYear(), text].join("/");
};
