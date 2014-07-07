<?php
/**
 * @file
 * App Link plugin to define Android App.
 */

$plugin = array(
  'name' => t('Android App'),
  'match' => 'Android',
  'js_src' => drupal_get_path('module', 'app_link') . '/platforms/app_link_platform_android.js',
  'js_callback' => 'app_link_platform_android',
  'form' => 'app_link_platform_android_form',
);

/**
 * Helper function to construct a Drupal form for Android platform parameters.
 *
 * @param array $conf
 *   An array of existing configurations.
 *
 * @return array
 *   A Drupal form structure.
 */
function app_link_platform_android_form(array $conf = array()) {
  $form = array(
    '#type' => 'fieldset',
    '#title' => t('Android App'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#tree' => TRUE,
  );
  $form['app_url'] = array(
    '#title' => t('App URL Scheme'),
    '#description' => t('URL Scheme of the Android App to redirect to'),
    '#attributes' => array('placeholder' => 'myapp://'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_url_scheme'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['app_url']) ? $conf['app_url'] : '',
  );
  $form['intent_url'] = array(
    '#title' => t('App Intent URL'),
    '#description' => t('The Android Intent URL to direct Android 4.x Chrome to'),
    '#attributes' => array('placeholder' => 'intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_platform_android_valid_intent'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['intent_url']) ? $conf['intent_url'] : '',
  );
  $form['store_url'] = array(
    '#title' => t('App Page on Google Play'),
    '#description' => t('The URL where you can download App lives in Google Play.'),
    '#attributes' => array('placeholder' => 'https://play.google.com/store/apps/details/?id=<package_name>'),
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

/**
 * Ensures that, if a value is entered, it is a valid Android Intent identifier.
 */
function app_link_platform_android_valid_intent($element, &$form_state) {
  if (!empty($element['#value']) && !preg_match('#^intent://#', $element['#value'])) {
    form_error($element, t('The @field is an invalid Android Intent URL', array(
      '@field' => $element['#title'],
    )));
  }
}
