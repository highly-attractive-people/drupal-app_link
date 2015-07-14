/**
 * Determine platform based on userAgent, and call it's router.
 * If we don't have a router, bail to fallback.
 *
 * @param {object} platforms
 *   Data about the App Link per platform.
 * @param {string} fallbackUrl
 *   The URL to route to if we cannot route another way.
 *
 * @return {string}
 *   Primary URL that we will attempt to redirect to.
 */
function app_link (platforms, fallbackUrl) {
  /**
   * You may set a before hook to run before
   *   - It is expected that these hooks will accept a callback parameter.
   * @example
   *   app_link.before = function(callback) {
   *     setTimeout(function() {
   *       callback();
   *     }, 1000);
   *   };
   */
  if (app_link.before) {
    // return app_link.before(function() {
    //   app_link(platforms, fallbackUrl);
    // });
    return app_link.before(function() {
      app_link.before = null;
      app_link(platforms, fallbackUrl);
    });
  }
  var UA = navigator.userAgent;
  var platform = platforms.app_link_platform_fallback;
  if (platform && platform.supports_qs) {
    fallbackUrl = applyReferrer(fallbackUrl);
  }
  for (var id in platforms) {
    platform = platforms[id];
    // Platforms should have at least a match rule.
    if (!platform.match) {
      continue;
    }
    // Validate if UA matches the platform's "match" expression.
    if (platform.match && !UA.match(new RegExp(platform.match, "i"))) {
      continue;
    }
    // Validate if UA does not matches the platform's "match" expression.
    if (platform.not_match && UA.match(new RegExp(platform.not_match, "i"))) {
      continue;
    }

    // Display correct store badge in case the redirect doesn't work
    var el = document.getElementById(id);
    if (el) {
      el.className = "";
    }

    if (!platform.router) {
      throw new TypeError("Platform '" + id + "': Cannot read property 'router'. Platform:\n" + JSON.stringify(platform));
    }
    if (!app_link.routers[platform.router]) {
      throw new TypeError("Platform '" + id + "': Router " + JSON.stringify(platform.router) + " does not exist.");
    }

    return app_link.routers[platform.router](platforms[id], fallbackUrl);
  }
  window.location = fallbackUrl;
  return fallbackUrl;
}

/**
 * Callbacks for individual routing logic.
 */
app_link.routers = {};

/**
 * Transform a given URL URL.
 *  - Optionally, appending any path with one specified in the path query string.
 *  - Optionally, appending any query-sting.
 *
 * @param {string} url
 *   The URL to trnasform
 * @param {boolean} applyQs
 *   True if the App URL supports appending a query-string
 * @param {boolean} applyPath
 *   True if the App URL supports appending a path
 * @param {array} pathWhitelist
 *   RegExp strings to filter the query-string path by.
 *
 * @return {string}
 *   The transformed URL.
 */
function transformUrl (url, applyQs, applyPath, pathWhitelist) {
  if (url && applyPath) {
    var path = getQueryParams().path;
    if (isPathWhitelisted(path, pathWhitelist)) {
      url = applyUrl(url, {pathname: path});
    }
  }
  if (url && applyQs) {
    // Pass-Through Query-String values.
    url = applyUrl(url, {search: location.search});
    // Attempt to set a referrer.
    url = applyReferrer(url);
  }
  return url;
}

/**
 * Validate that path matches at least one regular expression in a whitelist.
 *
 * @param {string} path
 *   The path to validate.
 * @param {array} whitelist
 *   An array of regular expression strings.
 *
 * @return {boolean}
 *   True if a match is found or if whitelist is empty. False otherwise.
 */
function isPathWhitelisted(path, whitelist) {
  // We must have something to work with.
  if (!path) {
    return false;
  }

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

/**
 * Parse Query String parameters.
 *
 * @return {object<key:value>}
 *   A map of key values from the query string.
 */
function getQueryParams () {
  var query = {};
  (location.search || "")
    // Remove the "?"
    .substr(1)
    // Replace space characters
    .replace(/\+/g, " ")
    // Grab key-value pairs
    .replace(/([^&;=]+)=?([^&;]*)/g, function (m, k, v) {
      // Decode keys and values separately
      query[decodeURIComponent(k)] = decodeURIComponent(v);
    });
  return query;
}

/**
 * Attaches the referrer to a destination URL.
 *
 * @param {string} url
 *   The URL to apply transformation.
 *
 * @return {string}
 *   The transformed URL.
 */
function applyReferrer(url) {
  if (url && document.referrer && url.indexOf("referrer") === -1) {
    return applyUrl(url, {search: "referrer=" + encodeURIComponent(document.referrer)});
  }
  return url;
}

/**
 * Apply a query-string to a destination URL.
 *
 * @param {string} url
 *   The URL to apply transformation.
 * @param {object} parts
 *   - {string} pathname: Path to append.
 *   - {string} search: Query String to append.
 *   - {string} hash: Hash String to replace.
 *
 * @return {string}
 *   The transformed URL.
 */
function applyUrl (url, parts) {
  var parser = document.createElement("a");
  parser.href = url;
  if (typeof parts.pathname === "string") {
    var origin = parser.origin || (parser.protocol + "//" + (parser.host || ""));
    var pathname = parser.pathname.replace(/^\/+/, "") + parts.pathname.replace(/^\/+/, "");
    var search = parser.search;
    var hash = parser.hash;
    if (origin[origin.length - 1] !== "/") {
      origin += "/";
    }
    parser.href = origin + pathname;
    if (search) {
      parser.search = search;
    }
    if (hash) {
      parser.hash = hash;
    }
  }
  if (typeof parts.search === "string") {
    if (parts.search[0] === "?") {
      parts.search = parts.search.slice(1);
    }
    parser.search = (parser.search && parts.search) ? parser.search + "&" + parts.search : (parser.search || parts.search);
  }
  if (typeof parts.hash === "string") {
    parser.hash = parts.hash;
  }
  return parser.href;
}

/**
 * Directs an iPhone-like device to the Mobile App or Store.
 *
 * @param {object} platform
 *   - {string} platform.app_url
 *     URL Scheme to the app.
 *   - {string} platform.store_url
 *     URL to find this app in the app store.
 *   - {boolean} platform.supports_qs
 *     True if the App URL supports appending a query-string
 *   - {boolean} platform.supports_path
 *     True if the App URL supports appending a path
 *   - {array} platform.path_whitelist
 *     RegExp strings to filter the query-string path by.
 * @param {string} fallbackUrl
 *   URL to go to, if app is not installed.
 *
 * @return {string}
 *   Primary URL that we will attempt to redirect to.
 */
app_link.routers.iphone = function (platform, fallbackUrl) {
  var appUrl = transformUrl(platform.app_url, platform.supports_qs, platform.supports_path, platform.path_whitelist);
  fallbackUrl = transformUrl(platform.store_url, platform.supports_store_qs) || fallbackUrl;

  setTimeout(fallback, 25);
  return tryIframeApproach();

  /**
   * Newer iOS versions complain about direct location
   */
  function tryIframeApproach() {
    if (!appUrl) {
      return fallback();
    }
    var iframe = document.createElement("iframe");
    document.body.appendChild(iframe);
    iframe.onload = fallback;
    iframe.onerror = fallback;
    iframe.src = appUrl;
    return appUrl;
  }

  /**
   * Fallback if they don't have app installed
   */
  function fallback () {
    if (!document.webkitHidden && !document.hidden) {
      window.location = fallbackUrl;
    }
    return fallbackUrl;
  }
};

/**
 * Directs an Android-like device to the Mobile App or Store.
 *
 * @param {object} platform
 *   - {string} platform.app_url
 *     URL Scheme to the app.
 *   - {string} platform.intent_url
 *     Intent URL to the app.
 *   - {string} platform.store_url
 *     URL to find this app in the app store.
 *   - {boolean} platform.supports_qs
 *     True if the App URL supports appending a query-string
 *   - {boolean} platform.supports_path
 *     True if the App URL supports appending a path
 *   - {array} platform.path_whitelist
 *     RegExp strings to filter the query-string path by.
 * @param {string} fallbackUrl
 *   URL to go to, if app is not installed.
 *
 * @return {string}
 *   Primary URL that we will attempt to redirect to.
 */
app_link.routers.android = function (platform, fallbackUrl) {
  var appUrl = transformUrl(platform.app_url, platform.supports_qs, platform.supports_path, platform.path_whitelist);
  var intentUrl = transformUrl(platform.intent_url, platform.supports_qs, platform.supports_path, platform.path_whitelist);
  fallbackUrl = transformUrl(platform.store_url, platform.supports_store_qs) || fallbackUrl;
  var UA = navigator.userAgent;
  var timerHeartbeat = setInterval(intervalHeartbeat, 200);
  var timerIframe;
  var timerWebkit;

  if (UA.match(/Chrome/)) {
    return useIntent();
  } else if (UA.match(/Firefox/)) {
    return tryWebkitApproach();
  } else {
    return tryIframeApproach();
  }

  /**
   * If PageVisiblityAPI has hidden the page, we're done here.
   * Clear all previously set timers.
   */
  function intervalHeartbeat() {
    if (document.webkitHidden || document.hidden) {
      clearInterval(timerHeartbeat);
      clearTimeout(timerWebkit);
      clearTimeout(timerIframe);
    }
  }

  /**
   * A lot of Androids, like the hidden iframe trick.
   */
  function tryIframeApproach() {
    if (!appUrl) {
      return fallback();
    }
    var iframe = document.createElement("iframe");
    iframe.style.border = "none";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.onload = fallback;
    iframe.onerror = fallback;
    iframe.src = appUrl;
    document.body.appendChild(iframe);
    return appUrl;
  }

  /**
   * Most webkits are cool with timeout.
   */
  function tryWebkitApproach() {
    if (!appUrl) {
      return fallback();
    }
    timerIframe = setTimeout(tryIframeApproach, 1500);
    timerWebkit = setTimeout(fallback, 2500);
    document.location = appUrl;
    return appUrl;
  }

  /**
   * Newer Droids must use Intents
   */
  function useIntent() {
    if (!intentUrl) {
      return fallback();
    }
    document.location = intentUrl;
    return intentUrl;
  }

  /**
   * Fallback if they don't have app installed.
   * PageVisiblityAPI has hidden the page.
   */
  function fallback () {
    if (!document.webkitHidden && !document.hidden) {
      window.location = fallbackUrl;
    }
    return fallbackUrl;
  }
};
