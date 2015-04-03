<?php

/**
 * @file
 * Hooks documentation file.
 */

/**
 * Alters the form values of the app link.
 *
 * @param array $applink_info
 *   Array containing information about the app path and the submitted platform
 *   data.
 *
 * @return array
 *   A multidimensional array containing the platform key as the first level. In
 *   the second level an array of key value pairs is expected. The submitted
 *   values will be overwritten by the ones returned by this hook.
 */
function hook_app_link_default_link_values($applink_info) {
  if (!empty($applink_info['platform_data']['app_link_platform_fallback']['fallback_url'])) {
    return array();
  }
  return array(
    'app_link_platform_fallback' => array(
      'fallback_url' => '<front>',
    ),
  );
}
