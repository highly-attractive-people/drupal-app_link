<?php
/**
 * @file
 * Display minimal html page to hand off to javascript.
 *
 * Variables:
 * - $scripts: (array) Raw javascript strings from platform plugins.
 *
 * - $platform_info: (string) JSON-encoded object, containing data by platform:
 *   -  name: Proper name of an app on platform.
 *   -  match: RegExp that user-agent must match.
 *   -  not_match: RegExp that user-agent must not match.
 *   -  js_callback: Name of javascript function to call if matched.
 *
 * - $platform_data: (string) JSON-encoded object, containing data by platform:
 *    See plugin javascript for more information.
 *
 * - $web_url: (string) URL to fallback if we are unable to link to a platform.
 */
?><!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title><?php print t('Mobile App'); ?></title>
</head>
<body>

<?php foreach ($scripts as $script) : ?>
  <script>
    <?php print $script ?>
  </script>
<?php endforeach; ?>

<script>
var PLATFORM_INFO = <?php print $platform_info; ?>;
var PLATFORM_DATA = <?php print $platform_data; ?>;
var WEB_URL = <?php print $web_url; ?>;

/**
 * Determine platform based on userAgent, and call it's hook.
 * If we don't have a hook, bail to redirect.
 */
function app_link_route () {
  var UA = navigator.userAgent;
  var platform;
  for (var id in PLATFORM_INFO) {
    platform = PLATFORM_INFO[id];
    // Validate if UA matches the platform's "match" expression.
    if (platform.match && !UA.match(new RegExp(platform.match, 'i'))) {
      continue;
    }
    // Validate if UA does not matche the platform's "match" expression.
    if (platform.not_match && UA.match(new RegExp(platform.not_match, 'i'))) {
      continue;
    }
    window[platform.js_callback](PLATFORM_DATA[id], WEB_URL);
    return true;
  }
  window.location = WEB_URL;
}

app_link_route();

</script>
</body>
</html>
