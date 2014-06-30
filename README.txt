CONTENTS OF THIS FILE
---------------------
 * Introduction
 * Requirements
 * Installation
 * Configuration

INTRODUCTION
-----------------------------
The App Link module to redirect user's to a native app. Use this module
to link native apps on end-user user platforms, such as mobile devices.
Further, the module falls back to an app store link, when the user does
not have the app installed.

This module provides:
 * A user interface to manage and export your app links.
 * A CTools export plugin for configuration deployment.
 * A CTools plugin api to extend this module to support more platforms.

REQUIREMENTS
------------
This module requires the following modules:
 * CTools (https://drupal.org/project/ctools)

INSTALLATION
------------
 * Install as you would normally install a contributed drupal module. See:
   https://drupal.org/documentation/install/modules-themes/modules-7
   for further information.

CONFIGURATION
-----------------------------
 * Configure user permissions in Administration » People » Permissions:
   - Use the administration pages and help (System module)
   - The default Access Content permission is required to follow App Links
     (by default, everyone has this permission)
   - The "Administer App Link entries" is required to add/edit App Links
     (by default, administrators have this permission)
 * Create an App Link in Configuration » Search and Metadata » App Link:
   1. Click the Add button at the top of the page.
   2. Fill out the Add App Link Form to create a new App Link.
     - Path
       The path will become the link name, for example "my-cool-app",
       will become SITE/app_link/my-cool-app
     - Web URL
       Where users will go on unsupported platforms (like desktop),
       since we can't direct them to an app.
     - iOS App URL
       The URL Scheme to direct the user to the App, example:
       myapp://
     - iOS Store URL
       The URL to the App Store where the user to download the App,
       if they don't have it installed.
       http://itunes.apple.com/us/app/APP
     - iOS Supports Query Strings
       Some apps support passing a query-string information.
       If this is checked, we'll pass query-strings to the app:
         SITE/app_link/my-cool-app?test=2&key=value
       Would direct to
         myapp://live?test=2&key=value
     - iOS Supports Deep Links?
       Some apps support deep links to access specific pieces of content.
       If this is checked, we'll pass deep-links to the app:
         SITE/app_link/my-cool-app?path=/deep/link
       Would direct to
         myapp://deep/link
   3. Hit save, and you'll see your app link listed.
   4. Try it out.
     - If you choose "my-cool-app", try going to `SITE/app_link/my-cool-app`
