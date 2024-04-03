const baseUrl = 'http://192.168.31.150:9091/NmBar';

const urlMap = {
  login: baseUrl + '/login',
  logout: baseUrl + '/logout',
  loginCheck: baseUrl + '/getUserInfo',
  getUserData: baseUrl + '/getUserData',
  uploadFile: baseUrl + '/uploadFile',
  regist: baseUrl + '/regist',

  此处省略一万行代码  ，微：dabocode
  }

const getUrlParam = function(name) {
  var params = {}; // 存放参数的对象
  window.location.href.replace(/[?&]([^=#]+)=([^&#]*)/g, function (match, key, value) {
      params[key] = decodeURIComponent(value); // 将参数值进行解码
  });
	if (params[name]) {
		return params[name];
	}
	return null;
}

const msg = function(msg){
	uni.showToast({
		title:msg,
		icon:"none"
	})
}

const err = function(msg){
	uni.showToast({
		title:msg,
		icon:"error"
	})
}

const warn = function(msg){
	uni.showToast({
		title:msg,
		icon:"error"
	})
}

const success = function(msg){
	uni.showToast({
		title:msg,
		icon:"success"
	})
}

export default {
	getUserInfo,
	baseUrl,
	request,
	urlMap,
	getUrlParam,
	msg,
	err,
	warn,
	success
	
}