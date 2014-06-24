App Link
===================

Drupal module to redirect user's to a native app.

Use this module when you want to link your user's to a native app on their platform,
this module will auto-redirect the store if they do not have the app installed.

This module provides:
  * A user interface to manage and export your app links.
  * A CTools export plugin for configuration deployment.

TO CREATE AN APP LINK
------------
1. In the Drupal Admin, head to Configuration \ Search and Metadata \ App Link
 - /admin/config/search/applink/add

2. Fill out the Add App Link Form to create a new App Link.

 - Path
   This is the path the link will become, if we enter "my-cool-app" then the link will be YOUR_SITE/app_link/my-cool-app
 - Web URL
   This is where user's on an unsupported platform ( like desktops! ) will go, since we can't direct them to the app.
 - iOS App URL
   This is the URL Scheme to direct the user to the App, example:
   myapp://
 - iOS Store URL
   This is the URL to the App Store where the user may download the App if they don't have it installed.
   http://itunes.apple.com/us/app/APP
 - iOS Supports Query Strings
   Some apps support passing a query-string of information to the app.
   If this is checked, we'll pass these deep links over to the app, continuing our example
     YOUR_SITE/app_link/my-cool-app?test=2&key=value
   Would direct to
     myapp://live?test=2&key=value
 - iOS Supports Deep Links?
   Some apps support deep links to access specific pieces of content.
   If this is checked, we'll pass these deep links over to the app, continuing our example
     YOUR_SITE/app_link/my-cool-app?path=/deep/link
   Would direct to
     myapp://deep/link

3. Hit save, and you'll see your app link listed.

4. Test it out.
 - Example: If you choose "my-cool-app", the link will be `YOUR_SITE/app_link/my-cool-app`
