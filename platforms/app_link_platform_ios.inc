<?php
/**
 * @file
 * App Link plugin to define iOS App.
 */

$plugin = array(
  'name' => t('iOS App'),
  'match' => 'iOS|iPhone|iPad|iPod',
  'not_match' => 'kindle',
  'js_src' => drupal_get_path('module', 'app_link') . '/platforms/app_link_platform_ios.js',
  'js_callback' => 'app_link_platform_ios',
  'form' => 'app_link_platform_ios_form',
);

/**
 * Helper function to construct a Drupal form for iOS platform parameters.
 *
 * @param array $conf
 *   An array of existing configurations.
 *
 * @return array
 *   A Drupal form structure.
 */
function app_link_platform_ios_form(array $conf = array()) {
  $form = array(
    '#type' => 'fieldset',
    '#title' => t('iOS App'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#tree' => TRUE,
  );
  $form['app_url'] = array(
    '#title' => t('App URL Scheme'),
    '#description' => t('URL Scheme of the iOS App to redirect to'),
    '#attributes' => array('placeholder' => 'myapp://'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_url_scheme'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['app_url']) ? $conf['app_url'] : '',
  );
  $form['store_url'] = array(
    '#title' => t('App Page on the App Store'),
    '#description' => t('The URL where you can download App lives in the App Store.'),
    '#attributes' => array('placeholder' => 'https://itunes.apple.com/us/app/'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_url'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['store_url']) ? $conf['store_url'] : '',
  );
  $form['supports_qs'] = array(
    '#title' => t('Append the query string to the App\'s URL Scheme'),
    '#description' => t("If checked, the query string will be appended the App's URL Scheme, example:\n/app_link/myapp?a=b&c=d\nmyapp://?a=b&c=d"),
    '#type' => 'checkbox',
    '#default_value' => isset($conf['supports_qs']) ? $conf['supports_qs'] : FALSE,
  );
  $form['supports_path'] = array(
    '#title' => t('Append the "path" param to the App\'s URL Scheme'),
    '#description' => t("If checked, we'll pass the 'path' query-string parameter will be appended to the App's URL Scheme, example:\n/app_link/myapp?path=/settings\nmyapp://settings"),
    '#type' => 'checkbox',
    '#default_value' => isset($conf['supports_path']) ? $conf['supports_path'] : FALSE,
  );
  return $form;
}
