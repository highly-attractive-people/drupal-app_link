APP LINK - https://www.drupal.org/sandbox/robcolburn/2289011
======================================================

CONTENTS OF THIS FILE
---------------------
 * Introduction
 * Requirements
 * Installation
 * Configuration
 * Troubleshooting

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
 * Create an App Link:
   For brevity, we'll assume you only have an iOS App… about cats.
   1. Navigate to Configuration » Search and Metadata » App Link
   2. Click the Add button near the top of the page (by page title).
   3. Fill out the Add App Link Form.
     - Path
       The path that will link to the app, example:
       mycatapp
       http://mysite.com/app_link/mycatapp
     - Fallback Web URL
       Where users will go on unsupported platforms (like desktop),
       since we can't direct them to an app.
     - iOS App URL
       The URL Scheme to direct the user to the App, example:
       mycatapp://
     - App Page on the App Store
       The URL to the App Store where the user can download the App.
       https://itunes.apple.com/us/app/game-for-cats/id406740405?mt=8
     - Append the query string to the App's URL Scheme
       If checked, the query string will be appended the App's URL Scheme, example:
       http://mysite.com/app_link/mycatapp?a=b&c=d
       mycatapp://?a=b&c=d
     - Append the "path" param to the App\'s URL Scheme
       If checked, the query string will be appended the App's URL Scheme, example:
       http://mysite.com/app_link/mycatapp?path=cat/video
       mycatapp://cat/video
   4. Hit save, and you'll see your link listed.
   5. Try it out.  Navigate to the desired path:
     http://mysite.com/app_link/mycatapp

TROUBLESHOOTING
 * Please report any issues to the Project's Issue Queue
   https://www.drupal.org/project/issues/2289011
