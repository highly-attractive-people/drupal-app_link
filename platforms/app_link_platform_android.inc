<?php
/**
 * @file
 * App Link plugin to define Android App.
 */

global $language;

$plugin = array(
  'title' => t('Android App'),
  'form' => 'app_link_platform_android_form',
  'badge_url' => '//developer.android.com/images/brand/' . $language->language . '_generic_rgb_wo_60.png',
  'store_text' => t('Get it on Google Play'),
  'store_title' => t('Google Play'),
  'store_pattern' => 'https://play.google.com/store/apps/details/?id=<package_name>',
);

/**
 * Construct a Drupal form for the platform parameters.
 *
 * @param array $platform
 *   An array of information about plaform.
 * @param array $conf
 *   An array of existing configurations.
 *
 * @return array
 *   A Drupal form structure.
 */
function app_link_platform_android_form(array $platform, array $conf = array()) {
  $form = array(
    '#type' => 'fieldset',
    '#title' => $platform['title'],
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#tree' => TRUE,
  );
  $form['app_url'] = array(
    '#title' => t('App URL Scheme'),
    '#description' => t('URL Scheme of the @title to redirect to', array(
      '@title' => $platform['title'],
    )),
    '#attributes' => array('placeholder' => 'myapp://'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_url_scheme'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['app_url']) ? $conf['app_url'] : '',
  );
  $form['intent_url'] = array(
    '#title' => t('App Intent URL'),
    '#description' => t('Intent URL of the @title to direct Android 4.x Chrome to', array(
      '@title' => $platform['title'],
    )),
    '#attributes' => array('placeholder' => 'intent://scan/#Intent;scheme=zxing;package=com.google.zxing.client.android;end'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_intent'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['intent_url']) ? $conf['intent_url'] : '',
  );
  $form['store_url'] = array(
    '#title' => t('Store Page on @store_title', array(
      '@store_title' => $platform['store_title'],
    )),
    '#description' => t('URL where you can download the App.', array(
      '@store_title' => $platform['store_title'],
    )),
    '#attributes' => array('placeholder' => $platform['store_pattern']),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_url'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['store_url']) ? $conf['store_url'] : '',
  );
  app_link_qs_path_form($conf, $form);
  return $form;
}
