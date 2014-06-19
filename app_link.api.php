<?php
/**
 * @file
 * API documentation for App Link.
 */

/**
 * Define Supported Platforms and associated matching criteria.
 *
 * This hook allows a module to specify additional App Platforms to support.
 *
 * @return array
 *   An array of information defining the App Platforms, attributes:
 *     name: (required)  Proper name of an app on platform
 *     match: (optional) RegExp (JS impl) that user-agent must match
 *     not_match: (optional) RegExp (JS impl) that user-agent must not match
 */
function app_link_app_platform_info() {
  $platforms['bb'] = array(
    'name' => t('Blackberry App'),
    'match' => 'bb\d+',
  );
  return $platforms;
}
