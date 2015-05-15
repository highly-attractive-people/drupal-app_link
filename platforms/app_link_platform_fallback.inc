<?php
/**
 * @file
 * App Link plugin to define the web fallback.
 */

$plugin = array(
  'title' => t('Web Fallback'),
  'form' => 'app_link_platform_fallback_form',
  'fallback' => TRUE,
  'weight' => -10,
);

/**
 * Helper function to construct a Drupal form for the web platform parameters.
 *
 * @param array $conf
 *   An array of existing configurations.
 *
 * @return array
 *   A Drupal form structure.
 */
function app_link_platform_fallback_form(array $conf = array()) {
  $form = array(
    '#type' => 'fieldset',
    '#title' => t('Web Fallback'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#tree' => TRUE,
  );
  $form['fallback_url'] = array(
    '#title' => t('Fallback URL'),
    '#description' => t('Absolute URL to redirect when there is no other match. Do not use the domain name.'),
    '#attributes' => array('placeholder' => '<permalink>'),
    '#type' => 'textfield',
    '#element_validate' => array('app_link_valid_url'),
    '#maxlength' => 2000,
    '#required' => FALSE,
    '#default_value' => isset($conf['fallback_url']) ? $conf['fallback_url'] : '',
  );
  app_link_qs_path_form($conf, $form);

  // Support qs and path by default.
  $form['supports_qs']['#default_value'] = isset($conf['supports_qs']) ? $conf['supports_qs'] : TRUE;
  $form['supports_path']['#default_value'] = isset($conf['supports_path']) ? $conf['supports_qs'] : TRUE;
  return $form;
}
