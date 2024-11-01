
// $Id$

// Required values
var swekey_loginname_path = null;

// Optional values
var swekey_promo_url = "http://www.swekey.com";
var swekey_brands = null;
var swekey_loginname_resolve_url = "";
var swekey_authframe_url = null;
var swekey_show_unplugged = true;
var swekey_image_xoffset = '0px';
var swekey_image_yoffset = '0px';
var swekey_loginname_width_offset = 0;
var swekey_artwork_path = 'http://artwork.swekey.com/';

var swekey_str_unplugged = 'No swekey plugged';
var swekey_str_plugged = 'A swekey is plugged';


var swekey_id = "undefined";
var swekey_status = [];
var swekey_loginnames_input = [];
var swekey_mutltiple_loginnames_input = false;
var swekey_dynamic_login_form = false;
var swekey_frame_started = false;
var swekey_frame_checked = 0;


function swekey_check_authframe_validity()
{
    var xhr; 
    try {  xhr = new ActiveXObject('Msxml2.XMLHTTP');   }
    catch (e) 
    {
        try {   xhr = new ActiveXObject('Microsoft.XMLHTTP');    }
        catch (e2) 
        {
          try {  xhr = new XMLHttpRequest();     }
          catch (e3) {  xhr = false;   }
        }
     }
 
	xhr.onreadystatechange  = function()
	{ 
		if(xhr.readyState  == 4)
		{
			if (xhr.status  != 200 || xhr.responseText != swekey_frame_checked)
			{
				var pos = swekey_authframe_url.indexOf('?');
				if (pos == -1)
					pos = swekey_authframe_url.length;
		
				alert
				(
					"Swekey Error: Url '" + swekey_authframe_url.substr(0, pos) + "' is not accessible." +
					"\n\nYou should check your .htaccess file" +
					"\n\n!!! DO NOT ATTACH A SWEKEY TO YOUR ACCOUNT UNTIL THIS ERROR IS FIXED !!!" +
					"\n\nStatus: " + xhr.status + 
					"\nReply: " + xhr.responseText.substr(0, 100)
				);				
			} 
		}
	};   	

	var pos = swekey_authframe_url.indexOf('?');
	if (pos == -1)
		pos = swekey_authframe_url.length;

	xhr.open("GET", swekey_authframe_url.substr(0, pos) + "?verify=" + swekey_frame_checked, true); 
	xhr.send(null); 
}

function swekey_refresh_login()
{
	if (! swekey_frame_started)
	{
		if (Swekey_ListKeyIds() != '')
		{
    		var frame = document.getElementById("swekey_auth_frame");
    		if (frame != null)
    		{
                swekey_frame_started = true;
                frame.setAttribute('src', swekey_authframe_url);
			}
		}
	}

	var id = Swekey_ListBrandedKeyIds(swekey_brands).substring(0, 32);
	if (id != swekey_id)
	{
		swekey_id = id;

		if (swekey_id.length >= 32 && swekey_frame_checked == 0)
		{
			var now = new Date();
	    	swekey_frame_checked = now.getTime();
	    	swekey_check_authframe_validity();
		}

		if (swekey_id.length == 32)
		{
			for (var i = 0; i < swekey_status.length; i ++)
			{		
				swekey_status[i].setAttribute('src', swekey_artwork_path + 'plugged-8x16.png');
				swekey_status[i].setAttribute('title', swekey_str_plugged);
				swekey_status[i].style.display = '';
			}
			
			swekey_show_unplugged = true;
			if (swekey_loginnames_input.length != 0 && swekey_loginname_resolve_url != null && swekey_loginname_resolve_url != "")
			{
			    var xhr; 
			    try {  xhr = new ActiveXObject('Msxml2.XMLHTTP');   }
			    catch (e) 
			    {
			        try {   xhr = new ActiveXObject('Microsoft.XMLHTTP');    }
			        catch (e2) 
			        {
			          try {  xhr = new XMLHttpRequest();     }
			          catch (e3) {  xhr = false;   }
			        }
			     }
			 
				xhr.onreadystatechange  = function()
				{ 
					if(xhr.readyState  == 4)
					{
						if (xhr.status  == 200 && xhr.responseText != null && xhr.responseText != "")
							for (var i = 0; i < swekey_loginnames_input.length; i ++)
								swekey_loginnames_input[i].value = xhr.responseText; 
					}
				}; 
				
				//alert(swekey_loginname_resolve_url.replace(/\$swekey_id/,swekey_id));
				var url = swekey_loginname_resolve_url.replace(/\$swekey_id/,swekey_id);
				url = url.replace(/\$cookie/,encodeURIComponent(document.cookie));
				xhr.open("GET", url, true); 
				xhr.send(null); 
			}
		}
		else
		{
			if (swekey_show_unplugged)
			{
				for (var i = 0; i < swekey_status.length; i ++)
				{		
					swekey_status[i].setAttribute('src', swekey_artwork_path + 'unplugged-8x16.png');
					swekey_status[i].setAttribute('title', swekey_str_unplugged);
				}
			}
			else
			{
				for (var i = 0; i < swekey_status.length; i ++)
				{		
					swekey_status[i].style.display = 'none';
				}
			}
		}	
	}
	
	setTimeout("swekey_refresh_login()", 1000);
}

function insert_key_logo()
{
    // check if the page is loaded (IE)
	var page_loaded = false;
	for (var i = 0; i < swekey_loginnames_input.length; i ++)
		if (swekey_loginnames_input[i].offsetWidth != 0)
		    page_loaded = true;

	if (page_loaded)
	{
		for (var i = 0; i < swekey_loginnames_input.length; i ++)
		{
			var isIE = (navigator.userAgent.toLowerCase().indexOf('msie') >= 0);
	    
	    	if (swekey_loginname_width_offset != 0)
				swekey_loginnames_input[i].style.width = (swekey_loginnames_input[i].offsetWidth - swekey_loginname_width_offset) + 'px';
	
	    	if (swekey_loginnames_input[i].parentNode != null) 
	    	{
	        	if (swekey_loginnames_input[i].nextSibling == null)
	        		swekey_loginnames_input[i].parentNode.appendChild(swekey_status[i]);
	        	else
	        		swekey_loginnames_input[i].parentNode.insertBefore(swekey_status[i], swekey_loginnames_input[i].nextSibling);
	        }
	 
	    	if (isIE) // do it again after the element is attached
	    	{
				swekey_status[i].style.verticalAlign = 'middle';
				swekey_status[i].style.position = 'relative';
				swekey_status[i].style.left = swekey_image_xoffset;
				swekey_status[i].style.top = swekey_image_yoffset;
	    	}
		}
	}
	else
		setTimeout("insert_key_logo()", 10);
}

function swekey_login_onload()
{
    swekey_loginnames_input = [];
    
	for (var i = 0; i < swekey_loginname_path.length; i++)
	{
		if (swekey_loginname_path[i] != "")
		{
            objects = document.getElementsByName(swekey_loginname_path[i]);
            if (objects != null)
				for (var j = 0; j < objects.length; j++)
           	 		if (objects[j].tagName.toLowerCase() == 'input')
						swekey_loginnames_input[swekey_loginnames_input.length] = objects[j];
	    }
    }
    
    if (! swekey_mutltiple_loginnames_input && swekey_loginnames_input.length > 0)
 	   swekey_loginnames_input = [swekey_loginnames_input[0]];
    
    swekey_status == [];

    if (swekey_loginnames_input.length > 0)
    {
		for (var i = 0; i < swekey_loginnames_input.length; i++)
	    {
	    	swekey_status[i] = document.createElement('img');
	    	swekey_status[i].setAttribute('id', 'swekey_status');
	    	swekey_status[i].setAttribute('name', 'swekey_status');
	    	swekey_status[i].setAttribute('onClick', 'window.open("' + swekey_promo_url + '")');
	    	
	    	swekey_status[i].setAttribute('style', 'width:8px; height:16px; padding:0px; border-spacing:0px; margin:0px; vspace:0px; hspace:0px; frameborder:no; vertical-align:middle;'
			+ 'position:relative;  left:' + swekey_image_xoffset + '; top:' + swekey_image_yoffset + ';');
			
			swekey_status[i].setAttribute('src', swekey_artwork_path + 'unplugged-8x16.png');
			swekey_status[i].setAttribute('title', swekey_str_unplugged);
			if (!swekey_show_unplugged)
				swekey_status[i].style.display = 'none';
	
		}

		insert_key_logo();
	   	setTimeout("swekey_refresh_login()", 1000);
    }
    else if (swekey_dynamic_login_form)
 		setTimeout("swekey_login_onload()", 1000);
}

function swekey_login_integrate()
{
	if (swekey_authframe_url != null)
	{
		document.write('<iframe id="swekey_auth_frame" style="width:0px; height:0px; border: 0px" src = ""></iframe>');	

		// We have to cleanup the cookie
		var date = new Date();
		date.setTime(date.getTime() - (24*60*60*1000)); // one day before
		document.cookie = 'swekey_authframe_session_id=; expires=' + date.toGMTString() + ';path=/;';
	}
			
	document.cookie = "swekey_proposed=''; path=/;";   //  reset the cookie
	
	swekey_add_load_event(swekey_login_onload);
}



var swekey_str_attach_ask = "A swekey authentication key has been detected.\nDo you want to associate it with your account ?";
var swekey_str_attach_success = "The plugged swekey is now attached to your account";
var swekey_str_attach_failed = "Failed to attach the plugged swekey to your account";

var swekey_attach_url = "";
var swekey_session_id = null;


function get_cookie ( cookie_name )
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}

function isTemporaryPage() 
{
	try
	{
		var metaElements = document.getElementsByTagName ('META');
		for (var i = 0; i < metaElements.length; i++)
		{
			var attrs = metaElements[i].attributes;
			for (var j = 0; j < attrs.length; j++)
				if (attrs[j].name.toLowerCase() == 'http-equiv' && attrs[j].value.toLowerCase() == 'refresh')
					return true;
		}
	}
	catch (e)
	{
	}
	return false;
}

function swekey_propose_to_attach()
{
    if (swekey_session_id == null || swekey_session_id == "" || get_cookie('swekey_proposed') == swekey_session_id)
        return;       
		
	if (isTemporaryPage()) 
        return;       

	var id = Swekey_ListBrandedKeyIds(swekey_brands).substring(0, 32);
	if (id != "")
	{
    	document.cookie = "swekey_proposed=" + swekey_session_id + "; path=/;";   // call it only once
        if (confirm(swekey_str_attach_ask))
        {
		    var xhr; 
		    try {  xhr = new ActiveXObject('Msxml2.XMLHTTP');   }
		    catch (e) 
		    {
		        try {   xhr = new ActiveXObject('Microsoft.XMLHTTP');    }
		        catch (e2) 
		        {
		          try {  xhr = new XMLHttpRequest();     }
		          catch (e3) {  xhr = false;   }
		        }
		     }
		 
			xhr.onreadystatechange  = function()
			{ 
				if(xhr.readyState  == 4)
				{
					if (xhr.status  == 200 && xhr.responseText == "OK")
						alert(swekey_str_attach_success);
					else
						alert(swekey_str_attach_failed);
				}
			}; 
			
			xhr.open("GET", swekey_attach_url.replace(/\$swekey_id/,id), true); 
			xhr.send(null); 
        }
    }
    else
        setTimeout("swekey_propose_to_attach()", 1000);
}


//////////////////////////////////////////////////////////////
// This part is called when a user is logged with a swekey.
// We check that the swekey is still plugged otherwise we
// logout the user
//////////////////////////////////////////////////////////////


var swekey_max_tries = 3;
var swekey_logout_url = null;
var swekey_to_check = null;

function check_swekey_presence()
{
	if (swekey_logout_url == null || swekey_to_check == null)
		return;
		 
	if (Swekey_ListKeyIds().indexOf(swekey_to_check) < 0)
	{
		if (Swekey_Loaded())
		swekey_max_tries --;
	}
	else
		swekey_max_tries = 2; // The plugin is loaded we give 2 tries

	if (swekey_max_tries < 0)
		top.location = swekey_logout_url;
	else
		setTimeout("check_swekey_presence()", 1000);
}


//////////////////////////////////////////////////////////////
// Utilities
//////////////////////////////////////////////////////////////

function swekey_add_load_event(func) 
{
	var oldonload = window.onload;
	if (typeof window.onload != 'function') 
	{
		window.onload = func;
	}
  	else 
	{
		window.onload = function() 
		{
			if (oldonload) 
			{
				oldonload();
			}
			func();
	    }
	}
}


