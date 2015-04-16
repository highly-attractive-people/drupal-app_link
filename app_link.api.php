<?php

/**
 * @file
 * Hooks documentation file.
 */

/**
 * Alters the form values of the app link.
 *
 * @param array $applink
 *   Containing information about the app, called before App Link is used:
 *   - platform_info - array keyed by platform key, rules about how to app link.
 *   - platform_data - array keyed by platform key, urls to use for app link.
 *   - fallback_url - string of the url to use as a fallback.
 *   - scripts - array of inline script tags (strings) to include.
 */
function hook_applink_info_alter(&$applink) {
  if (!empty($applink['platform_data']['app_link_platform_fallback']['fallback_url'])) {
    $applink['fallback_url'] = 'http://www.google.com';
  }
}
