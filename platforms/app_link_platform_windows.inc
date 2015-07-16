<?php
/**
 * @file
 * App Link plugin to define Windows App.
 */

global $language;

$plugin = array(
  'title' => t('Windows App'),
  'badge_url' => '//cmsresources.windowsphone.com/devcenter/en-us/legacy_v1/img/badgegenerator/' . $language->name . '_wstore_cyan_258x67.png',
  'store_text' => t('Download from Windows Store'),
  'store_title' => t('Windows Store'),
  'store_pattern' => 'https://www.microsoft.com/en-us/store/apps/<product-code>/<product-id>',
);
