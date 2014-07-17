<?php
/**
 * @file
 * App Link plugin to define iPhone App.
 */

$plugin = array(
  'name' => t('iPhone App'),
  'match' => 'iOS|iPhone',
  'not_match' => 'kindle',
  'js_src' => drupal_get_path('module', 'app_link') . '/platforms/app_link_platform_iphone.js',
  'js_callback' => 'app_link_platform_iphone',
  'form' => 'app_link_platform_iphone_form',
);

/**
 * Helper function to construct a Drupal form for iPhone platform parameters.
 *
 * @param array $conf
 *   An array of existing configurations.
 *
 * @return array
 *   A Drupal form structure.
 */
function app_link_platform_iphone_form(array $conf = array()) {
  $form = array(
    '#type' => 'fieldset',
    '#title' => t('iPhone App'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#tree' => TRUE,
  );
  $form['app_url'] = array(
    '#title' => t('iPhone App URL Scheme'),
    '#description' => t('URL Scheme of the iPhone App to redirect to'),
    '#attributes' => array('placeholder' => 'myapp://'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_url_scheme'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['app_url']) ? $conf['app_url'] : '',
  );
  $form['store_url'] = array(
    '#title' => t('App Store Url'),
    '#description' => t('URL to where the iPhone App lives in the App Store'),
    '#attributes' => array('placeholder' => 'https://itunes.apple.com/us/app/'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_url'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['store_url']) ? $conf['store_url'] : '',
  );
  $form['supports_qs'] = array(
    '#title' => t('iPhone App supports Query Strings?'),
    '#description' => t("If so, we'll pass the query-string, as in\n/app_link/myapp?a=b&c=d\nmyapp://?a=b&c=d"),
    '#type' => 'checkbox',
    '#default_value' => isset($conf['supports_qs']) ? $conf['supports_qs'] : FALSE,
  );
  $form['supports_path'] = array(
    '#title' => t('iPhone App supports Deep Links?'),
    '#description' => t("If so, we'll pass the 'path' query-string, as in\n/app_link/myapp?path=/settings\nmyapp://settings"),
    '#type' => 'checkbox',
    '#default_value' => isset($conf['supports_path']) ? $conf['supports_path'] : FALSE,
  );
  return $form;
}
