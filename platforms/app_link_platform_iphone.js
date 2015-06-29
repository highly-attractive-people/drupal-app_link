/**
 * Directs user to the Mobile App
 * Alternatively, the app store if they don't have the App.
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
function app_link_platform_iphone(platform, fallback_url, referrer) {
  fallback_url = platform.store_url || fallback_url;
  var app_url = getAppUrl();

  /*
   * Attaches the referrer to the destination URL.
   */
  function attachReferrer(url, referrer) {
    var destURL = url;
    if (destURL.indexOf('referrer') == -1 && referrer.length > 0) {
      if (destURL.indexOf('?') > -1) {
        destURL = destURL + '&referrer=' + referrer;
      }
      else {
        destURL = destURL + '?referrer=' + referrer;
      }
      return destURL;
    }
  }

  // Attach 'referrer' to URLs if necessary.
  if (referrer) {
    fallback_url = attachReferrer(fallback_url, referrer);
    app_url = attachReferrer(app_url, referrer);
  }

  var supports_path = platform.supports_path;
  var supports_qs = platform.supports_qs;
  if (!app_url) {
    window.location = fallback_url;
  }

  setTimeout(fallback, 25);

  tryIframeApproach();

  /**
   * Newer iOS versions complain about direct location
   */
  function tryIframeApproach() {
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.onload = fallback;
    iframe.onerror = fallback;
    iframe.src = app_url;
  }

  /**
   * Fallback if they don't have app installed
   */
  function fallback () {
    if (!document.webkitHidden) {
      window.location = fallback_url;
    }
  }

  /**
   * Apply configuration details to the app URL, including
   * optional query string params.
   */
  function getAppUrl () {
    var app_url = platform.app_url;
    app_url += getFilteredPath();
    app_url += platform.supports_qs ? (location.search || '') :  '';

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
