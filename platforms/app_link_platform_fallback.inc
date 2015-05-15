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
  $form['meta_fetch'] = array(
    '#title' => t('Acquire Meta Tags from Fallback'),
    '#description' => t('Request metatags from Fallback URL on App Link page.'),
    '#type' => 'checkbox',
    '#default_value' => isset($conf['meta_fetch']) ? $conf['meta_fetch'] : FALSE,
  );
  app_link_qs_path_form($conf, $form);
  return $form;
}
