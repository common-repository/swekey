<?php
/*
Plugin Name: Swekey
Plugin URI: http://www.swekey.com
Description: This 11 plugin enables swekey hardware authentication in wordpress
Author: Musbe, Inc.
Version: 2.0.1
Revision: 5461
Author URI: http://www.swekey.com
*/

add_action ('init', 'swekey_init');
add_action('login_form', 'swekey_login_form');
add_action('wp_authenticate_user', 'swekey_wp_authenticate_user');
add_action('wp_footer', 'swekey_wp_footer');
add_action('admin_footer', 'swekey_wp_footer');
add_action('profile_personal_options', 'swekey_profile_personal_options');
add_action('edit_user_profile', 'swekey_edit_user_profile');
add_action('profile_update', 'swekey_profile_update');
add_action('admin_menu', 'swekey_plugin_menu');


include_once(dirname(__FILE__).'/wordpress_integration.php');

function swekey_init()
{
	load_plugin_textdomain('swekey', false, 'swekey');
	
	if (get_option('swekey_allow_disabled') === false)
		update_option('swekey_allow_disabled', 1);
	
	if (get_option('swekey_user_managment') === false)
		update_option('swekey_user_managment', 1);
		
	if (get_option('swekey_allow_mobile_emulation') === false)
		update_option('swekey_allow_mobile_emulation', 1);

	if (get_option('swekey_loginname_width_offset') === false)
		update_option('swekey_loginname_width_offset', 26);

	if (get_option('swekey_logo_xoffset') === false)
		update_option('swekey_logo_xoffset', "-5px");
		
	if (get_option('swekey_logo_yoffset') === false)
		update_option('swekey_logo_yoffset', "-12px");
}


function swekey_wp_footer()
{
    $integration = new WordpressSwekeyIntegration();
	echo $integration->GetIntegrationScript();
}


Function swekey_wp_authenticate_user($user)
{
    $integration = new WordpressSwekeyIntegration();
	$swekey_id = $user->swekey_id;

	if (strlen($swekey_id) == 32)
	{
		if (! $integration->IsSwekeyAuthenticated($swekey_id))
	    {
    		$user = new WP_Error();
    		$short_id = substr($swekey_id, 0, 1).'..'.substr($swekey_id, 29);
    		$error = sprintf(__('The swekey "%s" is required to login','swekey'), $short_id);
    		$user->add('error',$error);			
    		return $user;
    	}
	}
 		
    return $user;			
}

function swekey_login_form()
{
    $integration = new WordpressSwekeyIntegration();
	echo $integration->GetIntegrationScript();
}


function  swekey_edit_user_profile()
{
    $user = new WP_User($_GET['user_id']);
    echo '<h3>'.__('Authentication','swekey').'</h3>'."\n";
    echo '<table class="form-table">'."\n";
    echo '<tr>'."\n";
    echo '	<th><label for="swekey_id">'.__('Swekey Id','swekey').'</label></th>'."\n";
    echo '	<td><input type="text" value="'.$user->swekey_id.'" id="swekey_id" name="swekey_id"> </td>'."\n";
    echo '</tr>'."\n";
    echo '</table>'."\n";
}


function  swekey_profile_personal_options()
{
    $user = wp_get_current_user();
    $is_admin = current_user_can('level_8');
    if ($is_admin && false)
    {
	    $_GET['user_id'] = $user->ID;
	    swekey_edit_user_profile();
    }
    else if (strlen($user->swekey_id) == 32 && get_option('swekey_user_managment'))
    {
        echo '<h3>'.__('Authentication','swekey').'</h3>'."\n";
        echo '<table class="form-table">'."\n";
        echo '<tr>'."\n";
        echo '	<th><label for="use_swekey">'.__('Use my swekey','swekey').'</label></th>'."\n";
        echo '	<td><input type="checkbox" checked="checked" id="use_swekey" name="use_swekey"> <a "href="http://www.swekey.com" target="_new"><img src="http://artwork.swekey.com/plugged-8x16.png" alt=""></a></td>'."\n";
        echo '</tr>'."\n";
        echo '</table>'."\n";
    }
}


function  swekey_profile_update($user_id)
{
    $is_admin = current_user_can('level_8');
	if (isset($_POST['swekey_id']) && $is_admin)
	{
		update_usermeta($user_id, 'swekey_id', $_POST['swekey_id']);
	}    
	else
	{
		$user = wp_get_current_user();
	    if ($user->ID == $user_id && strlen($user->swekey_id) == 32 && empty($_POST['use_swekey']))
	    {
	        delete_usermeta($user_id, 'swekey_id');
	        unset($user->swekey_id);    
	    }
	}
}


function swekey_plugin_menu() 
{
  add_options_page('Swekey Plugin Options', 'Swekey', 8, __FILE__, 'swekey_plugin_options');
}


function swekey_plugin_options() 
{
	echo 
	'<div class="wrap">'.
	'<h2>'.__('Swekey Settings','swekey').'</h2>'.
	'<form method="post" action="options.php">'.
	wp_nonce_field('update-options').
	
	'<table class="form-table">'.
	
	'<tr valign="top">'.
	'<th scope="row">'.__('Check Server Url','swekey').'</th>'.
	'<td><input type="text" name="swekey_check_server" size=80 value="'.get_option('swekey_check_server').'" />'.
	'<br />'.__('This is the url of the server that is used to validate OTPs','swekey').' ('.__('empty means default value','swekey').').'.
	'</td></tr>'.
	 
	'<tr valign="top">'.
	'<th scope="row">'.__('Token Server Url','swekey').'</th>'.
	'<td><input type="text" name="swekey_rndtoken_Server" size=80 value="'.get_option('swekey_rndtoken_Server').'" />'.
	'<br />'.__('This is the url of the server that generates random tokens','swekey').' ('.__('empty means default value','swekey').').'.
	'</td></tr>'.
	 
	'<tr valign="top">'.
	'<th scope="row">'.__('Status Server Url','swekey').'</th>'.
	'<td><input type="text" name="swekey_status_server" size=80 value="'.get_option('swekey_status_server').'" />'.
	'<br />'.__('This is the url of the server that returns the status of a swekey','swekey').' ('.__('empty means default value','swekey').').'.
	'</td></tr>'.
	 
	'<tr valign="top">'.
	'<th scope="row">'.__('Allow disabled swekeys','swekey').'</th>'.
	'<td><fieldset><legend class="hidden">'.__('Allow disabled swekeys','swekey').'</legend>'.
	'<p><input id="swekey_allow_disabled1" type="radio" name="swekey_allow_disabled" value="1" '.(get_option('swekey_allow_disabled') ? 'checked="checked"' : '').' />'.
	'<label for="swekey_allow_disabled1">'.__('Accept to login a user that has lost or disabled his swekey <i>(user friendly)</i>','swekey').'</label></p>'.
	'<p><input id="swekey_allow_disabled0" type="radio" name="swekey_allow_disabled" value="0" '.(get_option('swekey_allow_disabled') ? '' : 'checked="checked"').'/>'.
	'<label for="swekey_allow_disabled0">'.__('Refuse to login a user that has lost or disabled his swekey <i>(paranoid security)</i>','swekey').'</label></p>'.
	'</fieldset></td>'.
	'</tr>'.

	'<tr valign="top">'.
	'<th scope="row">'.__('Allow user to manage his swekey','swekey').'</th>'.
	'<td><fieldset><legend class="hidden">'.__('Allow user to manage his swekey','swekey').'</legend>'.
	'<p><input id="swekey_allow_disabled1" type="radio" name="swekey_user_managment" value="1" '.(get_option('swekey_user_managment') ? 'checked="checked"' : '').' />'.
	'<label for="swekey_allow_disabled1">'.__('Each user can choose to attach or detach a swekey with his account <i>(user friendly)</i>','swekey').'</label></p>'.
	'<p><input id="swekey_allow_disabled0" type="radio" name="swekey_user_managment" value="0" '.(get_option('swekey_user_managment') ? '' : 'checked="checked"').'/>'.
	'<label for="swekey_allow_disabled0">'.__('Only administrators can attach or detach a swekey with a user account <i>(needs more managment for the administrator)</i>','swekey').'</label></p>'.
	'</fieldset></td>'.
	'</tr>'.

	'<tr valign="top">'.
	'<th scope="row">'.__('Supported Brands','swekey').'</th>'.
	'<td><input type="text" name="swekey_brands" size=80 value="'.get_option('swekey_brands').'" />'.
	'<br />'.__('A brand is a 8 chars hexadecimal upper case value. Brands are comma separated.<br>If you don\'t known what to put here, keep these field empty.','swekey').
	'</td></tr>'.

	'<tr valign="top">'.
	'<th scope="row">'.__('Swekey Logo Link','swekey').'</th>'.
	'<td><input type="text" name="swekey_promo" size=80 value="'.get_option('swekey_promo').'" />'.
	'<br />'.__('This is the web page linked to the swekey logo next to the user name field of the login form.<br>If you don\'t known what to put here, keep these field empty.','swekey').
	'</td></tr>'.

 	'<tr valign="top">'.
	'<th scope="row">'.__('Allow Mobile Emulation','swekey').'</th>'.
	'<td><fieldset><legend class="hidden">'.__('Allow Swekey users to log from theirs Smartphone','swekey').'</legend>'.
	'<p><input id="swekey_allow_mobile_emulation1" type="radio" name="swekey_allow_mobile_emulation" value="1" '.(get_option('swekey_allow_mobile_emulation') ? 'checked="checked"' : '').' />'.
	'<label for="swekey_allow_mobile_emulation1">'.__('Swekey users can login from their authenticated Smartphone <i>(user friendly)</i>','swekey').'</label></p>'.
	'<p><input id="swekey_allow_mobile_emulation0" type="radio" name="swekey_allow_mobile_emulation" value="0" '.(get_option('swekey_allow_mobile_emulation') ? '' : 'checked="checked"').'/>'.
	'<label for="swekey_allow_mobile_emulation0">'.__('Swekey users can login only from a desktop computer <i>(highly secure)</i>','swekey').'</label></p>'.
	'</fieldset></td>'.
	'</tr>'.

 	'<tr valign="top">'.
	'<th scope="row">'.__('Allow login when network is down','swekey').'</th>'.
	'<td><fieldset><legend class="hidden">'.__('Allow Swekey users to login even if the Swekey swerver can not be reached','swekey').'</legend>'.
	'<p><input id="swekey_allow_when_no_network1" type="radio" name="swekey_allow_when_no_network" value="1" '.(get_option('swekey_allow_when_no_network') ? 'checked="checked"' : '').' />'.
	'<label for="swekey_allow_when_no_network1">'.__('Allow Swekey users to login even if the Swekey swerver can not be reached <i>(user friendly)</i>','swekey').'</label></p>'.
	'<p><input id="swekey_allow_when_no_network0" type="radio" name="swekey_allow_when_no_network" value="0" '.(get_option('swekey_allow_when_no_network') ? '' : 'checked="checked"').'/>'.
	'<label for="swekey_allow_when_no_network0">'.__('Swekey users can not login when the server can not be reached <i>(secure)</i>','swekey').'</label></p>'.
	'</fieldset></td>'.
	'</tr>'.

 	'<tr valign="top">'.
	'<th scope="row">'.__('Disable Linked OTP feature','swekey').'</th>'.
	'<td><fieldset><legend class="hidden">'.__('Try to disable linked OTP feature if the Swekey logo is red in the login page','swekey').'</legend>'.
	'<p><input id="swekey_no_linked_otp1" type="radio" name="swekey_no_linked_otp" value="1" '.(get_option('swekey_no_linked_otp') ? 'checked="checked"' : '').' />'.
	'<label for="swekey_no_linked_otp1">'.__('Disable the linked OTP feature','swekey').'</label></p>'.
	'<p><input id="swekey_no_linked_otp0" type="radio" name="swekey_no_linked_otp" value="0" '.(get_option('swekey_no_linked_otp') ? '' : 'checked="checked"').'/>'.
	'<label for="swekey_no_linked_otp0">'.__('Enable the linked OTP feature <i>(phishing safe)</i>','swekey').'</label></p>'.
	'</fieldset></td>'.
	'</tr>'.

  	'<tr valign="top">'.
	'<th scope="row">'.__('HTTPS server name','swekey').'</th>'.
	'<td><input type="text" name="swekey_https_server_hostname" size=80 value="'.get_option('swekey_https_server_hostname').'" />'.
	'<br />'.__('Use this value is you use a reverse proxy for your https server, keep it empty in most cases','swekey').'.'.
	'</td></tr>'.

  	'<tr valign="top">'.
	'<th scope="row">'.__('Swekey Logo horizontal offset','swekey').'</th>'.
	'<td><input type="text" name="swekey_logo_xoffset" size=80 value="'.get_option('swekey_logo_xoffset').'" />'.
	'<br />'.__('Helps you move the Swekey logo in the login page','swekey').'.'.
	'</td></tr>'.

  	'<tr valign="top">'.
	'<th scope="row">'.__('Swekey Logo vertical offset','swekey').'</th>'.
	'<td><input type="text" name="swekey_logo_yoffset" size=80 value="'.get_option('swekey_logo_yoffset').'" />'.
	'<br />'.__('Helps you move the Swekey logo in the login page','swekey').'.'.
	'</td></tr>'.

  	'<tr valign="top">'.
	'<th scope="row">'.__('Login name width offest','swekey').'</th>'.
	'<td><input type="text" name="swekey_loginname_width_offset" size=80 value="'.get_option('swekey_loginname_width_offset').'" />'.
	'<br />'.__('Helps you resize the login name field to let more space for the Swekey logo','swekey').'.'.
	'</td></tr>'.

	'</table>'.

	'<input type="hidden" name="action" value="update" />'.
	'<input type="hidden" name="page_options" value="swekey_check_server,swekey_rndtoken_Server,swekey_status_server,swekey_allow_disabled,swekey_user_managment,swekey_brands,swekey_promo,swekey_allow_mobile_emulation,swekey_allow_when_no_network,swekey_no_linked_otp,swekey_https_server_hostname,swekey_logo_xoffset,swekey_logo_yoffset,swekey_loginname_width_offset" />'.
	
	'<p class="submit">'.
	'<input type="submit" name="Submit" value="'.__('Save Changes').'" />'.
	'</p>'.
	
	'</form>'.
	'</div>';
}

?>