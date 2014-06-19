<?php
/**
 * @file
 * Export UI plugin to define an App Link.
 */

$plugin = array(
  'schema' => 'applink',
  'access' => 'administer app link',

  // Define the menu item.
  'menu' => array(
    'menu prefix' => 'admin/config/search',
    'menu item' => 'applink',
    'menu title' => 'App Link',
    'menu description' => 'Add Mobile App Links.',
  ),

  // Define user interface texts.
  'title singular' => t('app link'),
  'title plural' => t('app links'),
  'title singular proper' => t('Mobile App Link'),
  'title plural proper' => t('Mobile App Links'),

  // Define the names of the functions that provide the add/edit forms.
  'form' => array(
    'settings' => 'app_link_ctools_export_ui_form',
  ),
);
