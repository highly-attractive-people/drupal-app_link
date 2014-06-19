App Link
===================

Drupal module to redirect user's to a native app.

Use this module when you want to link your user's to a native app on their platform,
this module will auto-redirect the store if they do not have the app installed.

This module provides:
  * A user interface to manage and export your app links.
  * A CTools export plugin for configuration deployment.

QUICK GUIDE
------------
1. Create an App Link.
 - Go to `admin/config/search/applink`.

2. Fill out details about your apps.
 - You'll need to pick a path for app, this will be prepended with "app_link"

3. Test it out.
 - Example: If you choose "my-awesome-app", the link will be `/app_link/my-awesome-app`
