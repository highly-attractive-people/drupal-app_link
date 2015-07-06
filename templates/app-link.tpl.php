<?php
/**
 * @file
 * Display minimal html page to hand off to javascript.
 *
 * Variables:
 * - $scripts: (array) Raw javascript strings from platform plugins.
 *
 * - $platform_info: (string) JSON-encoded object, containing data by platform:
 *   -  title: Proper name of an app on platform.
 *   -  match: RegExp that user-agent must match.
 *   -  not_match: RegExp that user-agent must not match.
 *   -  js_callback: Name of javascript function to call if matched.
 *
 * - $platform_data: (string) JSON-encoded object, containing data by platform:
 *    See plugin javascript for more information.
 *
 * - $fallback_url: (string) URL to fallback if we cannot to link to a platform.
 *
 * - $canonical_link: (string) URL to send web crawlers to for full detail.
 */
?><!DOCTYPE html>
<html>
<head>
<?php foreach ($metatags as $metatag) : ?>
  <?php print $metatag ?>
<?php endforeach; ?>
</head>
<?php if (isset($canonical_link)): ?>
  <link rel="canonical" href="<?php print $canonical_link; ?>" />
<?php endif; ?>
<body>

<?php foreach ($scripts as $script) : ?>
  <?php print $script ?>
<?php endforeach; ?>

<script>
var PLATFORM_INFO = <?php print $platform_info; ?>;
var PLATFORM_DATA = <?php print $platform_data; ?>;
var FALLBACK_URL = <?php print $fallback_url; ?>;

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
    // Validate if UA does not matches the platform's "match" expression.
    if (platform.not_match && UA.match(new RegExp(platform.not_match, 'i'))) {
      continue;
    }
    window[platform.js_callback](PLATFORM_DATA[id], FALLBACK_URL);
    return true;
  }
  window.location = FALLBACK_URL;
}

/**
 * Validate that path matches at least one regular expression in a whitelist.
 *
 * @param {string} path
 *   The path to validate.
 * @param {array} whitelist
 *   An array of regular expression strings.
 *
 * @returns {boolean}
 *   True if a match is found or if whitelist is empty. False otherwise.
 */
function app_link_is_path_whitelisted(path, whitelist) {
  // If there are no paths to white-list, everything is accepted.
  if (!whitelist || !whitelist.length) {
    return true;
  }

  // Check each item for a RegEx match.
  for (var i = 0, item, rx; i < whitelist.length; i++) {
    item = whitelist[i];
    rx = new RegExp(item);
    if (rx.test(path)) {
      return true;
    }
  }

  return false;
}

app_link_route();

</script>
</body>
</html>
