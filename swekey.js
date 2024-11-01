
// $Id$

var g_SwekeyPlugin = null;
var g_SwekeyEmulationCookiePath = null;
var g_SwekeyEmulationForceUpdate;
var g_CookieId = Math.floor((Math.random()*100000000)+1);


// -------------------------------------------------------------------
// Mobile Emulation
// Private function: Should not be called directly
function CreateMobilePlugin()
{
	g_SwekeyPlugin = {
	    is_mobile:true,
	    result_url:g_SwekeyEmulationCookiePath
	};

	g_SwekeyPlugin.time = function()
	{
		return Math.floor(new Date().getTime()/1000);
	}

	g_SwekeyPlugin.get_cookie = function(c_name)
	{
		var i,x,y,cks=document.cookie.split(";");
		for (i=0;i<cks.length;i++)
		{
			x=cks[i].substr(0,cks[i].indexOf("="));
			y=cks[i].substr(cks[i].indexOf("=")+1);
			x=x.replace(/^\s+|\s+$/g,"");
			if (x==c_name)
				return unescape(y);
		}
	}

	g_SwekeyPlugin.set_cookie = function(c_name, c_value)
	{
		document.cookie=c_name + "=" + escape(c_value) + "; path=/;";
	}

	g_SwekeyPlugin.delete_cookie = function(c_name)
	{
		document.cookie=c_name + "=; path=/; expires=Thu, 01-Jan-1970 00:00:01 GMT";
	}

	// We can not use "onload = "because of IE
	g_SwekeyPlugin.attach_event = function(obj, event, handler) {
		if (obj.addEventListener) {
			obj.addEventListener(event, handler, false);
		} else if (obj.attachEvent) {
			obj.attachEvent('on'+event, handler);
		}
	}

	g_SwekeyPlugin.handle_frame_result = function(iData) {
		if (iData.swekey_ids) {
		    g_SwekeyPlugin.ids = iData.swekey_ids;
		    g_SwekeyPlugin.set_cookie("swekey_ids", "X" + g_SwekeyPlugin.ids);
		    return;
		}
		if (iData.otps) {
		    var cb = g_SwekeyPlugin["otpcb_" + iData.ids + iData.rt];
		    if (cb != null)
		        cb(iData.ids, iData.rt, iData.otps);
		    return;
		}
	}

	function get_iframe_result(iCookieId, iTry) {
		var res = sessionStorage['swekey_result_' + iCookieId];
		if (res) {
			if (res != "done") {
				sessionStorage['swekey_result_' + iCookieId] = "done";
				g_SwekeyPlugin.handle_frame_result(eval("(" + decodeURIComponent(res) + ")"));
			}
		} else if (iTry < 20) {    // we try during 2 secs
			setTimeout(function() {get_iframe_result(iCookieId, iTry + 1);}, 100);
		}
	}

	g_SwekeyPlugin.on_iframe_loaded = function() {
		var src = g_SwekeyPlugin.iframe.getAttribute('src');
		if (src) {
			get_iframe_result(g_CookieId, 0);
		}
	}

	g_SwekeyPlugin.request = function(query) {
		if (g_SwekeyPlugin.iframe == null) {
			g_SwekeyPlugin.iframe = document.createElement('iframe');
			g_SwekeyPlugin.iframe.setAttribute('id', 'swekey_mobile_iframe');
			//g_SwekeyPlugin.iframe.setAttribute('width', '600');
			//g_SwekeyPlugin.iframe.setAttribute('height', '200');
			g_SwekeyPlugin.iframe.style.display = "none";
			g_SwekeyPlugin.attach_event(g_SwekeyPlugin.iframe, "load", g_SwekeyPlugin.on_iframe_loaded);
			try {
				document.body.appendChild(g_SwekeyPlugin.iframe);
			} catch (e) {
				document.body.insertBefore(g_SwekeyPlugin.iframe, document.body.firstChild);
			}
		}
		g_CookieId ++;
		sessionStorage.removeItem('swekey_result_' + g_CookieId);
		if (query == 'list') {
			g_SwekeyPlugin.iframe.setAttribute('src', 'http://www.swekey.com/mobile/emulator-v2.php?request=list&set_cookie_url=' + encodeURIComponent(g_SwekeyPlugin.result_url) + '&cookie_id=' + g_CookieId);
		} else {
			g_SwekeyPlugin.iframe.setAttribute('src', 'https://www.swekey.com/mobile/emulator-v2.php?request=' + query + '&time=' + g_SwekeyPlugin.time() + '&set_cookie_url=' + encodeURIComponent(g_SwekeyPlugin.result_url) + '&cookie_id=' + g_CookieId);
		}
	}

	g_SwekeyPlugin.refresh = function(){
    	g_SwekeyPlugin.request("list");
	};

	g_SwekeyPlugin.full_refresh = function(){
    	g_SwekeyPlugin.request("refresh");
	};

 	g_SwekeyPlugin.list = function() {
 	    if (g_SwekeyPlugin.ids == null) {
	 	    g_SwekeyPlugin.ids = g_SwekeyPlugin.get_cookie("swekey_ids");
	 	    if (g_SwekeyPlugin.ids == null) {
	      		g_SwekeyPlugin.ids = "";
	 	    	g_SwekeyPlugin.request("list");
			} else {
			   g_SwekeyPlugin.ids = g_SwekeyPlugin.ids.substring(1); // remove the "X"
			}
		}

		return g_SwekeyPlugin.ids;
 	}

 	g_SwekeyPlugin.getotps = function(ids, rt, cb) {
        g_SwekeyPlugin["otpcb_" + ids + rt] = cb;
        g_SwekeyPlugin.request("getotps&ids=" + ids + "&rt=" + rt + "&hostname=");
		return "";
 	}

 	g_SwekeyPlugin.getlinkedotps = function(ids, rt, cb) {
        g_SwekeyPlugin["otpcb_" + ids + rt] = cb;
        g_SwekeyPlugin.request("getotps&ids=" + ids + "&rt=" + rt + "&hostname=" + window.location.hostname);
		return "";
 	}

 	g_SwekeyPlugin.getotp = function() {
 	    return "ERROR-MOBILE-EMULATION-IS-ASYNC-ONLY";
 	}

 	g_SwekeyPlugin.getlinkedotp = function() {
 	    return "ERROR-MOBILE-EMULATION-IS-ASYNC-ONLY";
 	}

 	g_SwekeyPlugin.setunplugurl = function() {
 	}

    if (g_SwekeyEmulationForceUpdate) {
		g_SwekeyPlugin.delete_cookie("swekey_ids");
    }


	return g_SwekeyPlugin;
}


var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

// -------------------------------------------------------------------
// Create the swekey plugin if it does not exists
function Swekey_Plugin()
{
	try
	{
		if (g_SwekeyPlugin != null)
			return g_SwekeyPlugin;

		 // Added check for MSIE because MantisBt emulates ActiveXObject for Mozilla browsers
		if ((window.ActiveXObject && navigator.userAgent.indexOf("MSIE") > -1) || navigator.userAgent.indexOf(".NET CLR") > -1)
		{
  			g_SwekeyPlugin = document.getElementById("swekey_activex");
  			if (g_SwekeyPlugin == null)
  			{
                  // we must create the activex that way instead of new ActiveXObject("FbAuthAx.FbAuthCtl");
                  // ortherwise SetClientSite is not called and we can not get the url
			  		var div = document.createElement('div');
	   				div.innerHTML='<object id="swekey_activex" style="display:none" CLASSID="CLSID:8E02E3F9-57AA-4EE1-AA68-A42DD7B0FADE"></object>';

  				// Never append to the body because it may still loading and it breaks IE
   				document.body.insertBefore(div, document.body.firstChild);
  				g_SwekeyPlugin = document.getElementById("swekey_activex");
              }

		    try {
		       Swekey_Plugin().getRevision();
		    } catch (e) {
		        g_SwekeyPlugin = null;
		    }

			if (g_SwekeyPlugin != null)
				return g_SwekeyPlugin;
		}

		g_SwekeyPlugin = document.getElementById("swekey_plugin");
		if (g_SwekeyPlugin != null)
			return g_SwekeyPlugin;

		for (i = 0; i < navigator.plugins.length; i ++)
		{
			try
			{
			    if (navigator.plugins[i] == null)
			    {
			        navigator.plugins.refresh();
                }
                else if (navigator.plugins[i][0] != null && navigator.plugins[i][0].type == "application/fbauth-plugin")
				{
					var x = document.createElement('embed');
					x.setAttribute('type', 'application/fbauth-plugin');
					x.setAttribute('id', 'swekey_plugin');
					x.setAttribute('width', '0');
					x.setAttribute('height', '0');
					x.style.display='block';


                      if (document.body != null)
                      {
                          try
                          {
      						document.body.appendChild(x);
      					}
      					catch (e)
      					{
   					       document.body.insertBefore(x, document.body.firstChild);
   					    }
   					}

					g_SwekeyPlugin = document.getElementById("swekey_plugin");
					return g_SwekeyPlugin;
				}
			}
			catch (e)
			{
			    navigator.plugins.refresh();
				//alert ('Failed to create plugin: ' + e);
			}
		}

		if (g_SwekeyEmulationCookiePath != null && isMobile.any()) {
		    g_SwekeyPlugin = CreateMobilePlugin();
		}
	}
	catch (e)
	{
		alert("Swekey_Plugin " + e);
		g_SwekeyPlugin = null;
	}
	return g_SwekeyPlugin;
}

// -------------------------------------------------------------------
// Returns true if the swekey plugin is installed
function Swekey_Installed()
{
	return (Swekey_Plugin() != null);
}

// -------------------------------------------------------------------
// Returns true if the swekey plugin is installed
function Swekey_Loaded()
{
	try
	{
		if (!  Swekey_Installed())
			return false;

		var rev = null;
		if (window.ActiveXObject)
			rev = Swekey_Plugin().getRevision();
		else
			rev = Swekey_Plugin().revision;

		rev = parseInt(rev);
		return (rev != null && rev > 999 && rev < 999999)
	}
	catch (e)
	{
		return false;
	}

	return true;
}

// -------------------------------------------------------------------
// List the id of the Swekey connected to the PC
// Returns a string containing comma separated Swekey Ids
  // A Swekey id is a 32 char hexadecimal value.
function Swekey_ListKeyIds()
{
	try
	{
		return Swekey_Plugin().list();
	}
	catch (e)
	{
//			alert("Swekey_ListKeyIds " + e);
	}
	return "";
}

// -------------------------------------------------------------------
// List the id of the Swekey connected to the PC
// Returns a string containing comma separated Swekey Ids
  // A Swekey Id is a 32 char hexadecimal value.
  // iBrand is a comma separated set of brand
  // A brand is a 8 char hexadecimal value.
function Swekey_ListBrandedKeyIds(iValidBrand)
{
	try
	{
		if (iValidBrand == null || iValidBrand == "")
			return Swekey_Plugin().list();

		var res = '';
		var brands = iValidBrand.split(',');
		var ids = Swekey_Plugin().list().split(',');
		for (var i = 0; i < ids.length; i ++)
			if (brands.indexOf(ids[i].substring(16, 24)) >= 0)
				res = res + (res == '' ? '' : ',') + ids[i];

		return res;
	}
	catch (e)
	{
//			alert("Swekey_ListBrandedKeyIds " + e);
	}
	return "";
}


// -------------------------------------------------------------------
// Ask the Connected Swekey to generate an OTP
// id: The id of the connected Swekey (returne by Swekey_ListKeyIds())
// rt: A random token
// return: The calculated OTP encoded in a 64 chars hexadecimal value.
function Swekey_GetOtp(id, rt)
{
    if (g_SwekeyEmulationCookiePath != null)
        alert("If you want to support mobile emulation you must use the asynchronous Swekey_GetOtps API");

	try
	{
		for(i = 0; i < 5; i++)
		{
			var otp = Swekey_Plugin().getotp(id, rt);
			if (otp != "0000000000000000000000000000000000000000000000000000000000000000")
				return otp;
		}
	}
	catch (e)
	{
//			alert("Swekey_GetOtp " + e);
	}
	return "";
}

// -------------------------------------------------------------------
// Ask the Connected Swekey to generate a OTP linked to the current https host
// id: The id of the connected Swekey (returne by Swekey_ListKeyIds())
// rt: A random token
// return: The calculated OTP encoded in a 64 chars hexadecimal value.
// or "" if the current url does not start with https
function Swekey_GetLinkedOtp(id, rt)
{
    if (g_SwekeyEmulationCookiePath != null)
        alert("If you want to support mobile emulation you must use the asynchronous Swekey_GetLinkedOtps API");

	try
	{
		for(i = 0; i < 5; i++)
		{
			var otp = Swekey_Plugin().getlinkedotp(id, rt);
			if (otp != "0000000000000000000000000000000000000000000000000000000000000000")
				return otp;
		}
	}
	catch (e)
	{
//			alert("Swekey_GetSOtp " + e);
	}
	return "";
}


// -------------------------------------------------------------------
  // Calls Swekey_GetOtp or Swekey_GetLinkedOtp depending if we are in
  // an https page or not.
// id: The id of the connected Swekey (returne by Swekey_ListKeyIds())
// rt: A random token
// return: The calculated OTP encoded in a 64 chars hexadecimal value.
function Swekey_GetSmartOtp(id, rt)
{
      var res = Swekey_GetLinkedOtp(id, rt);
      if (res == "")
          res = Swekey_GetOtp(id, rt);

	return res;
}


// -------------------------------------------------------------------
// Ask the Connected Swekeys to generate an OTP asynchronously
// id: The ids of the connected Swekeys (returned by Swekey_ListKeyIds())
// rt: A random token
// cb: When the otps will be calculated it will be returned using  cb(ids,rt,otps, exception)
function Swekey_GetOtps(ids, rt, cb)
{
	if (ids && rt)
	{
		try
		{
		    var otp_ar = [];
		    if (Swekey_Plugin().is_mobile)
		    {
		    	Swekey_Plugin().getotps(ids, rt, cb);
		    }
		    else
		    {
		        var id_ar = ids.split(',');
		        for (var i in id_ar)
		        {
		        	var otp = "";
					for(var retry = 0; retry < 5; retry++)
					{
						otp = Swekey_Plugin().getotp(id_ar[i], rt);
						if (otp != "0000000000000000000000000000000000000000000000000000000000000000")
							break;
					}
					otp_ar.push(otp);
		        }
	            cb(ids, rt, otp_ar.join(','));
		    }
		}
		catch (e)
		{
			cb(ids, rt, null, e);
		}
	}
}

// -------------------------------------------------------------------
// Ask the Connected Swekeys to generate asynchronously a OTP linked to the current https host
// id: The id of the connected Swekey (returne by Swekey_ListKeyIds())
// rt: A random token
// cb: When the otps will be calculated it will be returned using  cb(ids,rt,otps, exception)
function Swekey_GetLinkedOtps(ids, rt, cb)
{
	try
	{
	    var otp_ar = [];
	    if (Swekey_Plugin().is_mobile)
	    {
	    	Swekey_Plugin().getlinkedotps(ids, rt, cb);
	    }
	    else
	    {
	        var id_ar = ids.split(',');
	        for (var i in id_ar)
	        {
	        	var otp = "";
				for(var retry = 0; retry < 5; retry++)
				{
					otp = Swekey_Plugin().getlinkedotp(id_ar[i], rt);
					if (otp != "0000000000000000000000000000000000000000000000000000000000000000")
						break;
				}
				otp_ar.push(otp);
	        }
            cb(ids, rt, otp_ar.join(','));
	    }
	}
	catch (e)
	{
		cb(ids, rt, null, e);
	}
}

// -------------------------------------------------------------------
// Calls Swekey_GetOtps or Swekey_GetLinkedOtps depending if we are in
// an https page or not.
// id: The ids of the connected Swekey (returne by Swekey_ListKeyIds())
// rt: A random token
// cb: When the otps will be calculated it will be returned using  cb(ids,rt,otps, exception)
function Swekey_GetSmartOtps(ids, rt, cb)
{
	if (window.location.protocol.toUpperCase() == "HTTPS:")
      	return Swekey_GetLinkedOtps(ids, rt, cb);

	return Swekey_GetOtps(ids, rt, cb);
}

// -------------------------------------------------------------------
// Set a unplug handler (url) to the specified connected feebee
// id: The id of the connected Swekey (returne by Swekey_ListKeyIds())
// key: The key that index that url, (aplhanumeric values only)
// url: The url that will be launched ("" deletes the url)
function Swekey_SetUnplugUrl(id, key, url)
{
	try
	{
		return Swekey_Plugin().setunplugurl(id, key, url);
	}
	catch (e)
	{
//			alert("Swekey_SetUnplugUrl " + e);
	}
}

// -------------------------------------------------------------------
// To be called when authentication failed
function Swekey_RefreshEmulator()
{
	if (Swekey_Plugin() != null)
		if (Swekey_Plugin().is_mobile)
			Swekey_Plugin().full_refresh();
}

// -------------------------------------------------------------------
// Mobile Emulation
// You must call this function if you want to enable mobile emulation in your web site.
//
// iCookiePath should contain the URL of an html page that contains the following code:
// This url must have the same protocol://hostname of the current page.
/*
<!DOCTYPE html>
<html>
<head>
<script type="text/javascript">

function getQueryVariable(key) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == key) {
            return pair[1];
        }
    }
}

sessionStorage["swekey_result_" + getQueryVariable("key")] = getQueryVariable("value");

</script>
</head>
<body>
</body>
</html>
*/
// iForceUpdate should be true if Swekey_EnableMobileEmulation is called in the login page of your site.
function Swekey_EnableMobileEmulation(iCookiePath, iForceUpdate)
{
	function escapeHTML(s) {
	    return s.split('&').join('&amp;').split('<').join('&lt;').split('"').join('&quot;');
	}
	function qualifyURL(url) {
	    var el= document.createElement('div');
	    el.innerHTML= '<a href="'+escapeHTML(url)+'">x</a>';
	    return el.firstChild.href;
	}
	var url = qualifyURL(iCookiePath);

	var current = window.location.protocol + "//" + window.location.hostname + "/";
	if (current.toLowerCase() != url.toLowerCase().substr(0, current.length)) {
		alert("ERROR calling Swekey_EnableMobileEmulation:\niCookiePath must start with '" + current + "' but current value is '" + url + "'");
		return;
	}

	g_SwekeyEmulationCookiePath = url;
	g_SwekeyEmulationForceUpdate = iForceUpdate;
}

