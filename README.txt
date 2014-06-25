INTRODUCTION
-----------------------------
The App Link module to redirect user's to a native app. Use this module
to link native apps on end-user user platforms, such as mobile devices.
Further, the module falls back to an app store link, when the user does
not have the app installed.

This module provides:
  * A user interface to manage and export your app links.
  * A CTools export plugin for configuration deployment.

TO CREATE AN APP LINK
-----------------------------
1. In the Drupal Admin, head to Configuration \ Search and Metadata \ App Link
 - /admin/config/search/applink/add

2. Fill out the Add App Link Form to create a new App Link.

 - Path
   The path will become the link name, for example "my-cool-app",
   will become YOUR_SITE/app_link/my-cool-app
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
     YOUR_SITE/app_link/my-cool-app?test=2&key=value
   Would direct to
     myapp://live?test=2&key=value
 - iOS Supports Deep Links?
   Some apps support deep links to access specific pieces of content.
   If this is checked, we'll pass deep-links to the app:
     YOUR_SITE/app_link/my-cool-app?path=/deep/link
   Would direct to
     myapp://deep/link

3. Hit save, and you'll see your app link listed.

4. Test it out.
 - If you choose "my-cool-app", try going to `YOUR_SITE/app_link/my-cool-app`
