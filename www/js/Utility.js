
//全画面で使用する汎用処理をまとめる
//JQueryなどのライブラリを前提とした処理でも構わない

function isNumber(x){ 
    if( typeof(x) != 'number' && typeof(x) != 'string' ){
        return false;
    }
    return (x == parseFloat(x) && isFinite(x));
}

function isEmpty(str){
	if(typeof str !== "string" || str.length <= 0){
		return true;
	}
	return false;
}

function validateEmailAddress(str){
    if( typeof(str) != 'string' ){
        return false;
    }
    if(str.match(/.+@.+\..+/)==null){
        return false;
    }
    return true;
}

function escapeHTML(html) {
	return $('<div>').text(html).html();
}

function showLoading(){
	$.mobile.loading('show');
}

function hideLoading(){
	$.mobile.loading('hide');
}

function getWindowWidth(){
	return $(window).width();
}

function getWindowHeight(){
	return $(window).height();
}
