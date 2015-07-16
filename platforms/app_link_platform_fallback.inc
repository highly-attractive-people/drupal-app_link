<?php
/**
 * @file
 * App Link plugin to define the web fallback.
 */

$plugin = array(
  'title' => t('Web Fallback'),
  'form' => 'app_link_platform_fallback_form',
  'weight' => -10,
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
function app_link_platform_fallback_form(array $platform, array $conf = array()) {
  $form = array(
    '#type' => 'fieldset',
    '#title' => $platform['title'],
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
  $form['supports_qs'] = array(
    '#title' => t("Append the query string to the Fallback URL"),
    '#description' => t("If checked, the query string will be appended the Fallback URL, example:\n/app_link/myapp?a=b&c=d\nmyapp://?a=b&c=d"),
    '#type' => 'checkbox',
    '#default_value' => isset($conf['supports_qs']) ? $conf['supports_qs'] : FALSE,
  );
  $form['supports_path'] = array(
    '#title' => t('Append the "path" param to the Fallback URL'),
    '#description' => t("If checked, we'll pass the 'path' query-string parameter will be appended to the Fallback URL, example:\n/app_link/myapp?path=/settings\nhttp://mysite.com/settings"),
    '#type' => 'checkbox',
    '#default_value' => isset($conf['supports_path']) ? $conf['supports_path'] : FALSE,
  );
  $form['path_whitelist'] = array(
    '#title' => t('Whitelisted paths'),
    '#description' => t('JavaScript regular expressions, one per line, without leading or trailing slashes, that describe allowed paths within a URL or intent. Paths that do not match will not be redirected to. Do not whitelist all paths, as that could allow open redirects if an app is vulnerable.'),
    '#type' => 'textarea',
    '#default_value' => isset($conf['path_whitelist']) ? $conf['path_whitelist'] : '',
  );
  return $form;
}
