/**
 * @file
 * Directs an Android user to the Mobile App
 * Alternatively, the Google Play Store if they don't have the App.
 *
 * @param {object} platform
 *   Device platform to direct the user to, contains:
 *   {string} platform.app_url
 *      URL Scheme to the app
 *   {string} platform.store_url
 *      URL of the store page to go to, if app is not installed
 *   {boolean} platform.supports_path
 *     True if the App URL supports appending a path
 *   {boolean} platform.supports_qs
 *     True if the App URL supports appending a query-string
 * @param {string} fallback_url
 *    A fallback URL, if we can't direct the user somewhere better.
 */
/*global app_link_is_path_whitelisted*/
function app_link_platform_android(platform, fallback_url) {
  var app_url = getAppUrl();
  var store_url = getStoreUrl();
  fallback_url = store_url || fallback_url;

  var intent_url = getIntentUrl();
  var UA = navigator.userAgent;
  if (!app_url) {
    document.location = fallback_url;
  }

  var timer_heartbeat = setInterval(intervalHeartbeat, 200);
  var timer_iframe;
  var timer_webkit;
  if (UA.match(/Chrome/)) {
    useIntent(intent_url);
  } else if (UA.match(/Firefox/)) {
    tryWebkitApproach();
    timer_iframe = setTimeout(tryIframeApproach, 1500);
  } else {
    tryIframeApproach();
  }

  /**
   * Clear all previously set timers, we're done here ;)
   */
  function clearTimers() {
    clearTimeout(timer_heartbeat);
    clearTimeout(timer_webkit);
    clearTimeout(timer_iframe);
  }

  /**
   * If PageVisiblityAPI has hidden in the page, we're good
   */
  function intervalHeartbeat() {
    if (document.webkitHidden || document.hidden) {
      clearTimers();
    }
  }

  /**
   * A lot of Androids, like the hidden iframe trick.
   */
  function tryIframeApproach() {
    var iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.onload = function () {
      document.location = fallback_url;
    };
    iframe.onerror = function () {
      document.location = fallback_url;
    };
    iframe.src = app_url;
    document.body.appendChild(iframe);
  }

  /**
   * Most webkits are cool with timeout.
   */
  function tryWebkitApproach() {
    document.location = app_url;
    timer_webkit = setTimeout(function () {
      document.location = fallback_url;
    }, 2500);
  }

  /**
   * Newer Droids must use Intents
   */
  function useIntent() {
    document.location = intent_url;
  }

  /**
   * Apply configuration details to the app URL, including
   * optional query string params.
   */
  function getAppUrl () {
    var app_url = platform.app_url;
    app_url += getFilteredPath();
    if (platform.supports_qs) {
      // Pass-Through Query-String values.
      app_url = app_link_set_qs(app_url, location.search && location.search.slice(1));
      // Attempt to set a referrer.
      app_url = app_link_set_referrer(app_url);
    }
    return app_url;
  }

  /**
   * Get the path if it exists and is whitelisted.
   *
   * @returns {string}
   *   A string of the path, or an empty string if the path is missing, not
   *   supported, or invalid.
   */
  function getFilteredPath() {
    if (platform.supports_path) {
      var path = getQueryParams().path;
      if (app_link_is_path_whitelisted(path, platform.path_whitelist)) {
        return path;
      }
    }

    return '';
  }

  /**
   * Apply configuration details to the app store URL, including
   * optional query string params.
   */
  function getStoreUrl () {
    var url = platform.store_url;
    if (url && platform.supports_qs) {
      // Pass-Through Query-String values.
      url = app_link_set_qs(url, location.search && location.search.slice(1));
    }
    return url;
  }

  /**
   * Get the intent URL, replacing any path with one specified in the path
   * query string.
   *
   * @returns {string}
   *   Returns an intent:// URL.
   */
  function getIntentUrl() {
    var intent = platform.intent_url;
    var path = getFilteredPath();
    if (!path) {
      return intent;
    }

    // Replace the path specified in the intent with whatever was passed in.
    var parser = document.createElement('a');
    parser.href = intent;

    return parser.protocol + '//' + path + parser.hash;
  }

  /**
   * Parse Query String parameters
   * @return {object<key:value>}
   *   Returns a map of key values from the query string
   */
  function getQueryParams () {
    var query = {};
    (location.search || '')
    // Remove the '?'
    .substr(1)
    // Replace space characters
    .replace(/\+/g, ' ')
    // Grab key-value pairs
    .replace(/([^&;=]+)=?([^&;]*)/g, function (m, k, v) {
      // Decode keys and values separately
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    });
    return query;
  }
}
