export const convertUNIXTimeToString = (number) => {
  var a = new Date(number * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = month + ' ' + date + ' at ' + hour + ':' + min ;
  return time;
}

export const createData = (id, time, address, balance) => {
  id += 1;
  return { id, time, address, balance};
}