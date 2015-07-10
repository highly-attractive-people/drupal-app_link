<?php
/**
 * @file
 * Display minimal html page to hand off to javascript.
 *
 * Variables:
 * - $scripts: (array) Raw javascript strings from platform plugins.
 *
 * - $platforms: (string) JSON-encoded object, containing data by platform:
 *     (data about platform)
 *   -  router: (string) Name of javascript function to call if matched.
 *   -  match: (string) RegExp that user-agent must match.
 *   -  not_match: (string) RegExp that user-agent must not match.
 *     (data from db description)
 *   - app_url: (string) URI Scheme to direct users to.
 *   - intent_url: (string) Intent URL to direct users to.
 *   - store_url: (string) URL to find this app in the app store.
 *   - supports_qs: {boolean} True if App URL supports appending a query-string
 *   - supports_path: {boolean} True if App URL supports appending a path
 *   - path_whitelist; {array}  RegExp strings to filter the query-string path.
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
<?php if (isset($canonical_link)): ?>
  <link rel="canonical" href="<?php print $canonical_link; ?>" />
<?php endif; ?>
<style type="text/css">
.app-store-badges { text-align: center; }
.app-store-badges .hidden { display: none; }
</style>
</head>
<body>

<div class="app-store-badges">
   <?php foreach ($store_badges as $platform_id => $badge) : ?>
     <a id="<?php print $platform_id ?>" href="<?php print $badge['store_url']; ?>" class="hidden">
       <img alt="<?php print $badge['store_text']; ?>" src="<?php print $badge['badge_url']; ?>">
     </a>
   <?php endforeach; ?>
</div>

<?php foreach ($scripts as $script) : ?>
  <?php print $script ?>
<?php endforeach; ?>

<script>
var PLATFORMS = <?php print $platforms; ?>;
var FALLBACK_URL = <?php print $fallback_url; ?>;

app_link(PLATFORMS, FALLBACK_URL);
</script>
</body>
</html>
