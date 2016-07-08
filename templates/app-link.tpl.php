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
 *   - supports_qs: (boolean) True if App URL supports appending a query-string
 *   - supports_path: (boolean) True if App URL supports appending a path
 *   - path_whitelist: (array)  RegExp strings to filter the query-string path.
 *
 * - $platform_data: (string) JSON-encoded object, containing data by platform:
 *    See plugin javascript for more information.
 *
 * - $fallback_url: (string) URL to fallback if we cannot to link to a platform.
 *
 * - $canonical_link: (string) URL to send web crawlers to for full detail.
 *
 * - $promo_text: (string) Text displayed when we cannot redirect the user.
 *
 * - $promo_image: (string) Image displayed when we cannot redirect the user.
 *
 * - $store_badges: (associative array)
 *    Keys are Platform ID
 *    - badge: (associative array)
 *      - store_url: (string) URL to app in store
 *      - store_text: (string) Name of store
 *      - badge_url: (string) URL to badge image
 */
?><!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php foreach ($metatags as $metatag) : ?>
  <?php print $metatag ?>
<?php endforeach; ?>
<?php if (isset($canonical_link)): ?>
  <link rel="canonical" href="<?php print $canonical_link; ?>" />
<?php endif; ?>
</head>
<body>

<?php print theme('app_link_content', array(
  'base_url' => $base_url,
  'promo_text' => $promo_text,
  'promo_image' => $promo_image,
  'store_badges' => $store_badges,
)); ?>

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
