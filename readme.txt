=== Plugin Name ===
Contributors: Musbe, Inc.
Donate link: http://www.swekey.com/
Tags: login,authentication,swekey
Requires at least: 2.6
Tested up to: 3.8
Stable tag: trunk


This plugin let you use the swekey authentication USB dongle to secure your login.

== Description ==

This plugin let you use the swekey authentication USB dongle to secure your login.
Using this plugin, swekey owners will be able to attach their swekey to their account.

Once a swekey is attached to an account the following features will be available:
<ul>
<li>When your swekey is plugged the login dialog will automatically fill the 'username' input box.</li>
<li>You won't be able to login without the swekey plugged.</li>
<li>If you unplug your swekey while you are logged, you are automatically logged out.</li>
<li>You can detach the swekey from your account in your profile.</li>
</ul>

Administrators can attach/detach swekeys to/from a user account using the user settings dialog.

== Installation ==

1. Upload this directory to your plugins directory. It will create a 'wp-content/plugins/swekey/' directory.

== Frequently Asked Questions ==

= What is a swekey? =

A swekey is a small USB dongle that let you perform hardware authentication.

= Why should I use a swekey to login? =

Because using the swekey nobody will be able to use your account without having the swekey plugged in his computer.
 
= Where can I get a swekey? =

You can get a swekey from the <a href="http://store.swekey.com?promo=wordpress">swekey store</a>.
 
= Where can I get more information about the swekey =

On the swekey web site <a href="http://www.swekey.com?promo=wordpress">http://www.swekey.com</a>.
 
= I'm a developer. Can I intergrate swekey support in my site or application =

Yes, you can find all the documentation in our developer site <a href="http://developer.swekey.com">http://developer.swekey.com</a>.
 
== Version History ==

Current Version: 2.0.1 rev 5461 (01/20/14)

= 2,0.1 =
<ul>
<li>Added support for mobile emulation.</li>
<li>Using the new SDK.</li>
</ul>

= 2,0.0 =
<ul>
<li>Added support for mobile emulation.</li>
<li>Using the new SDK.</li>
</ul>

= 1.0.7 =
<ul>
<li>Added support for logo link in settings (for partnership program).</li>
<li>Fixed a potential security issue in Ajax.</li>
</ul>

= 1.0.4 =
<ul>
<li>No longer retreive the swekey logo from the swekey web server.</li>
</ul>

= 1.0.3 =
<ul>
<li>Added swekey settings.</li>
<li>Administrators can set the swekey id of users.</li>
<li>Support for branding.</li>
</ul>

= 1.0.1 =
<ul>
<li>Added french translation.</li>
<li>User is now logged out if his swekey is unplugged.</li>
</ul>

= 1.0.0 =
<ul>
<li>First release.</li>
</ul>

