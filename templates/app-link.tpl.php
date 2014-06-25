<?php
/**
 * @file
 * Display minimal html page to hand off to javascript.
 *
 * Variables:
 * - $web_url: (string) URL to fallback if we are unable to link to a platform
 * - $platforms: (array) An associative array containing the key-values for
 *   -  name: Proper name of an app on platform
 *   -  match: RegExp that user-agent must match
 *   -  not_match: RegExp that user-agent must not match
 *   -  app_url: URL to the App
 *   -  store_url: URL to the App Store
 *   -  supports_path: Does App URL Support paths?
 *   -  supports_qs: Does App URL Support query strings?
 */
?><!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title><?php print t('Mobile App'); ?></title>
</head>
<body>
<script>
// Insert data from server-side
var PLATFORMS = <?php print $platforms; ?>;
var web_url = <?php print $web_url; ?>;

var platform = getPlatform(PLATFORMS);
if (platform) {
  gotoApp(platform);
}
else {
  location.href = web_url;
}

/**
 * Determine if the user agent matches any of the known platform apps
 * @param {object<id:object>} platforms
 *   A key-value map of platform: conditions, urls, and options
 * @return {object|null}
 *   A platform's conditions, urls, and options
 *   Or, null if no matching platform was found
 */
function getPlatform (platforms) {
  var ua = navigator.userAgent;
  var id, platform;
  for (id in platforms) {
    platform = platforms[id];
    // If a platform matches the "match" expression, or there is no "match" expression
    if (platform.match && !ua.match(new RegExp(platform.match, 'i'))) {
      continue;
    }
    // If a platform does not match the "not_match" expression, or there is no "not_match" expression
    if (platform.not_match && ua.match(new RegExp(platform.not_match, 'i'))) {
      continue;
    }
    if (!platform.app_url) {
      continue;
    }
    return platform;
  }
  return null;
}

/**
 * Directs a user to the Mobile App on their platform
 * Alternatively, the app store if they don't have the App.
 *
 * @param {object} platform
 *   Device platform to direct the user to, contains:
 *   {string} platform.app_url
 *      URL Scheme to the app 
 *   {string} platform.store_url
 *      URL of the store page to go to, if app is not installed
 *   {boolean} platform.supports_path
 *     True if the App URL supports appending a path
 *   {boolean} platform.supports_qs
 *     True if the App URL supports appending a query-string
 */
function gotoApp (platform) {
  var app_url = platform.app_url;
  var store_url = platform.store_url;
  var supports_path = platform.supports_path;
  var supports_qs = platform.supports_qs;
  var _GET = getQuery();
  app_url += (supports_path && _GET.path) || '';
  app_url += (supports_qs && location.search) || '';

  // Attempt to send to app
  try {
    location.href = app_url;
  }
  // Fallback: Can't get to app, go to store
  catch (e) {
    location.href = store_url;
  }
  // Backup fallback - sometimes the catch doesn't work… Apple. Wait, and try again.
  var now = Date.now || function () { return (new Date()).getTime(); };
  var start = now();
  setTimeout(function () {
    if (now() - start < 3000) {
      try {
        location.href = store_url;
      }
      catch (e) {
        // c'est la vie
      }
    }
  }, 25);
}

/**
 * Parse Query String parameters
 * @return {object<key:value>}
 *   Returns a map of key values from the query string
 */
function getQuery () {
  var query = {};
  (location.search || '')
    // Remove the '?'
    .substr(1)
    // Replace space characters
    .replace(/\+/g, ' ')
    // Grab key-value pairs
    .replace(/([^&;=]+)=?([^&;]*)/g, function (m, k, v) {
      // Decode keys and values separately
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    });
  return query;
}

</script>
</body>
</html>
