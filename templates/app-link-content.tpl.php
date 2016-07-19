<?php
/**
 * @file
 * Inner content of page to display if Link fails.
 *
 * Variables:
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
?>
<style type="text/css">
body { margin: 0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu", "Cantarell", "Helvetica Neue", sans-serif; }
p { margin: 1em; }
img { max-width: 100% }
.hidden { display: none; }
</style>

<?php if (!empty($promo_text)) : ?>
  <p><?php print $promo_text; ?></p>
<?php endif; ?>

<?php if (!empty($promo_image)) : ?>
  <p id="badge" class="hidden">
    <?php foreach ($store_badges as $platform_id => $badge) : ?>
      <a id="<?php print $platform_id ?>_logo" href="<?php print $badge['store_url']; ?>" class="hidden">
        <img src="<?php print $promo_image; ?>" alt="" />
      </a>
    <?php endforeach; ?>
  </p>
<?php endif; ?>

<p class="app-store-badges">
   <?php foreach ($store_badges as $platform_id => $badge) : ?>
     <a id="<?php print $platform_id ?>" href="<?php print $badge['store_url']; ?>" class="hidden">
       <img alt="<?php print $badge['store_text']; ?>" src="<?php print $badge['badge_url']; ?>">
     </a>
   <?php endforeach; ?>
</p>

<p><a href="<?php print $base_url; ?>">Go to <?php print variable_get('site_name', 'Home'); ?></a></p>
