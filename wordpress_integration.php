<?php

include_once(dirname(__FILE__).'/swekey_integration.php');

// OPTIONAL
// include your include files here
require_once(dirname(__FILE__).'/../../../wp-load.php');
require_once(dirname(__FILE__).'/../../../wp-admin/includes/admin.php');


class WordpressSwekeyIntegration extends SwekeyIntegration
{
	function WordpressSwekeyIntegration()
	{
		// REQUIRED
		// Turn this flag to false once your integration is working
	 	$this->show_debug_info = false;

		// REQUIRED
		// Put the relative URL of your swekey directory.
		// This is used load the swekey javascript files
	  	$this->swekey_dir_url = site_url('wp-content/plugins/swekey/');;

		// REQUIRED
		// Put the name of you user name text input of your login form here.
		// This is used to auto-fill the username when a swekey is plugged
		// You can use multiple names
	 	$this->input_names = array("user_login", "log");

		// REQUIRED
		// Set this value to true if a user is logged
		$this->is_user_logged = is_user_logged_in();


		if ($this->is_user_logged)
		{
			// REQUIRED
			// If the logged user has a swekey associated with his account
			// fill this value with the id of that swekey.
            //$this->swekey_id_of_logged_user = DoQuery("SELECT `swekey_id` from `users` where id='{$_SESSION['authenticated_user_id']}'");
			$user = wp_get_current_user();
        	$this->swekey_id_of_logged_user = $user->swekey_id;


			// REQUIRED
			// Provide an URL that should be used to logout the current user
			// This is used when a user unplug its swekey
			if (function_exists("wp_logout_url")) {
				$this->logout_url = str_replace("&amp;", "&", wp_logout_url());
			} else {
				$this->logout_url = site_url('wp-login.php?action=logout');
			}
		}

		// OPTIONAL
	    // Set this value to the current locale
	    // more than one username/password form
	 	//$this->lang = 'en-US';

		// OPTIONAL
	    // Set this member to true if your login window contains
	    // more than one username/password form
	 	//$this->multiple_logos = true;

		// OPTIONAL
	    // Set this member to true if the login form is
	    // created dynamically using javascript after
	    // the page was loaded
	 	//$this->dynamic_login_form = true;

		// DEGUG
	    // To enable logging set the following var to the path of your log file
	 	//$this->logFile = '/tmp/swekey-integration.log';
	}

	// REQUIRED
	// Return the name of the user from a given swekey id
	// This is used to auto-fill the username when a swekey is plugged
	function GetUserNameFromSwekeyId($swekey_id)
	{
	    global $wpdb;
    	$query = $wpdb->prepare("SELECT user_id FROM $wpdb->usermeta WHERE meta_key = 'swekey_id' AND meta_value = %s", $swekey_id);
	    $results = $wpdb->get_col($query);
	    if (! empty($results[0]))
	    {
	        $query = $wpdb->prepare("SELECT user_login FROM $wpdb->users WHERE ID = %s", $results[0]);
	        $results = $wpdb->get_col($query);
	        return $results[0];
	    }
	}

	// REQUIRED
	// Set the swekey_id of the current user
	// returns null in case of sussess
	// returns a string in case of error
	function AttachSwekeyToCurrentUser($swekey_id)
	{
		$user = wp_get_current_user();
		if (isset($user) && ! empty($user->id))
		{
		    update_usermeta($user->id, 'swekey_id', $swekey_id);
		}
		else
		    return "No logged user";
	}
	
	// OPTIONAL
	// You can add your own javascript at the end of each page here.
	function AdditionalJavaScript()
	{
	    return "";
	}

	// OPTIONAL
	// You can add your own javascript files here.
 	function GetJavaScriptIncludes()
  	{
  		// Mandatory includes
    	$res = parent::GetJavaScriptIncludes();

		// Those includes are necessary for the default inplemtation of the ajax calls.
		// If you want to use you own implementation you can remove the following lines and use your own files.
		$res .= '<script type="text/javascript" src="'.$this->swekey_dir_url.'swekey_json_client.js"></script>'."\n";

		return $res;
  	}


	// OPTIONAL
	// by default the swekey configuration is located in the swekey_config.php file
	// You can store those settings somewhere else.
	function GetConfig()
	{
		$cfname = array
		(
			'check_server',
			'status_server',
			'rndtoken_server',
			'allow_disabled',
			'allow_mobile_emulation',
			'allow_when_no_network',
			'user_managment',
			'brands',
			'no_linked_otp',
			'https_server_hostname',
		    'logo_xoffset',
		    'logo_yoffset',
		    'loginname_width_offset',
		    'show_only_plugged',
		 );

		 $config = Array();
		 foreach ($cfname as $name)
		    $config[$name] =  get_option("swekey_".$name);

		return $config;
	}


	// OPTIONAL
	// This functunction gives you a chance to localize the strings
	// You should return '' if you don' t have a value (English will then be used)
	//
    // id             : value
    // -------------- : ---------
    //'logo_gray'     : 'No swekey plugged',
    //'logo_orange'   : 'Authenticating...',
    //'logo_red'      : 'Swekey authentication failed',
    //'logo_green'    : 'Swekey plugged and authentified',
    //'logo_green'    : 'Swekey plugged and validated',
    //'attach_ask'	  : "A swekey authentication key has been detected.\nDo you want to associate it with your account ?",
    //'attach_success': "The plugged swekey is now attached to your account",
    //'attach_failed' : "Failed to attach the plugged swekey to your account",
//	function LocalizedStr($strId)
//	{
//		return '';
//	}



}


?>
