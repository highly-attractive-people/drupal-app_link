<?php
/**
 * @file
 * App Link plugin to define Windows Phone App.
 */

global $language;

$plugin = array(
  'title' => t('Windows Phone App'),
  'badge_url' => '//cmsresources.windowsphone.com/devcenter/en-us/legacy_v1/img/badgegenerator/' . $language->name . '_wphone_cyan_258x67.png',
  'store_text' => t('Download from Windows Store'),
  'store_title' => t('Windows Phone Store'),
  'store_pattern' => 'https://www.windowsphone.com/en-us/store/app/<product-code>/<product-id>',
);
