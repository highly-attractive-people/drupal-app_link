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
 * @param {string} web_url
 *    A fallback URL, if we can't direct the user somewhere better.
 */
function app_link_platform_android(platform, web_url) {
  var fallback_url = platform.store_url || web_url;
  var app_url = getAppUrl();
  var intent_url = platform.intent_url;
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
    app_url += platform.supports_path ? (getQueryParams().path || '') : '';
    app_url += platform.supports_qs ? (location.search || '') :  '';
    return app_url;
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
