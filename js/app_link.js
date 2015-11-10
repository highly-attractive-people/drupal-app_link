/**
 * Determine platform based on userAgent, and redirect with it's respective data.
 *
 * You may set a before hook to run before
 *   - It is expected that these hooks will accept a callback parameter.
 * @example
 *   app_link.before = function(callback) {
 *     setTimeout(function() {
 *       callback();
 *     }, 1000);
 *   };
 *
 * @param {object:<platformKey:plaform>} platforms
 *   Data about the App Link per platform.
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
 *   The URL to route to if we cannot route another way.
 *
 * @return {string}
 *   Primary URL that we will attempt to redirect to.
 */
function app_link (platforms, fallbackUrl) {
  var isRedirectPage = !!location.href.match("app_link_redirect=true");
  // Set variables, allowing before hooks to alter.
  app_link.platforms = platforms;
  app_link.fallbackUrl = fallbackUrl;
  // Exexcute any before hooks.
  if (app_link.before && !isRedirectPage) {
    return app_link.before(function() {
      app_link.before = null;
      app_link(app_link.platforms, app_link.fallbackUrl);
    });
  }
  // Add referrer to fallback (Server is unable to do this accurately).
  var platform = platforms.app_link_platform_fallback;
  if (platform && platform.supports_qs) {
    app_link.fallbackUrl = app_link.applyReferrer(app_link.fallbackUrl);
  }
  // Determine the user's platform.
  var platformKey = app_link.getPlatformKey(navigator.userAgent) || app_link.getPlatformKey(navigator.appVersion);
  platform = platforms[platformKey];
  // Display correct store badge in case the redirect fails or user returns to page.
  var el = platformKey && document.getElementById(platformKey);
  if (el) {
    el.className = "";
  }
  // If we don't recognize the platform, or have data about the platform -- fallback.
  if (!platform) {
    return app_link.fallback();
  }
  // Transform App Urls according to rules.
  var appUrl = app_link.transformUrl(platform.app_url, platform.supports_qs, platform.supports_path, platform.path_whitelist);
  var intentUrl = app_link.transformUrl(platform.intent_url, platform.supports_qs, platform.supports_path, platform.path_whitelist);
  // We have a platform, update fallback to be the store.
  app_link.fallbackUrl = app_link.transformUrl(platform.store_url, platform.supports_store_qs) || fallbackUrl;

  var UA = navigator.userAgent;

  // Android w/ Chrome must use Intents
  if (platformKey === 'app_link_platform_android' && UA.match(/Chrome/)) {
    return app_link.directOrIframe(intentUrl);
  }
  // Firefox likes direct.
  else if (platformKey === 'app_link_platform_android' && UA.match(/Firefox/)) {
    return app_link.directOrIframe(appUrl);
  }
  // iOS9 needs middle redirect and confirm handling.
  // The dialog flow is not pretty - sorry.
  else if ((platformKey === 'app_link_platform_iphone' || platformKey === 'app_link_platform_ipad') && app_link.getOS(UA) >= 9) {
    if (isRedirectPage) {
      return app_link.fallback();
    }
    else {
      return app_link.directOrRedirect(appUrl);
    }
  }
  // iOS8 Chrome prefers directOrIframe trick.
  else if((platformKey === 'app_link_platform_iphone' || platformKey === 'app_link_platform_ipad') &&  UA.match(/CriOS/)) {
    return app_link.directOrIframe(appUrl);
  }
  // Most iOS & Android: Prefers hidden iframe trick over direct.
  else {
    return app_link.iframe(appUrl);
  }
}

/**
 * Detecting user's platform (their device / operating-system).
 *
 * @param {string} UA
 *   Browser userAgent or appVersion (Sometimes we need the version info).
 *
 * @return {string}
 *   A key to App Link platforms data that matches user's platform.
 */
app_link.getPlatformKey = function (UA) {
  return (
    UA.match(/Windows Phone/i) ? 'app_link_platform_windows_phone' :
    UA.match(/Kindle/i) ? 'app_link_platform_kindle_fire' :
    UA.match(/Android/i) ? 'app_link_platform_android' :
    UA.match(/iPhone|iPod/i) ? 'app_link_platform_iphone' :
    UA.match(/iPad/i) ? 'app_link_platform_ipad' :
    (UA.match(/Windows NT/) && app_link.getOS(UA) >= 6.2) ? 'app_link_platform_windows' :
    (UA.match(/OS X/) && app_link.getOS(UA) >= 10.6) ? 'app_link_platform_mac' :
    ''
  );
};

/**
 * Detect version of OS operating system.
 *
 * @param {string} UA
 *   Browser userAgent or appVersion.
 *
 * @return {number}
 *   Representing version of operating system.
 */
app_link.getOS = function (UA) {
  var version;
  // Windows
  version = UA.match(/Windows NT (\d+?.\d+?)/i);
  if (version) {
    return version[1] - 0;
  }
  // Mac & iOS
  version = UA.match(/(iPhone.+OS|iPad.+OS|iPod.+OS|OS X) (\d+?[._]\d+?)/i);
  if (version) {
    return version[2].replace('_', '.') - 0;
  }
  return 0;
}

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
app_link.transformUrl = function (url, applyQs, applyPath, pathWhitelist) {
  if (url && applyPath) {
    var path = app_link.getQueryParams().path;
    if (app_link.isPathWhitelisted(path, pathWhitelist)) {
      url = app_link.applyUrl(url, {pathname: path});
    }
  }
  if (url && applyQs) {
    // Pass-Through Query-String values.
    url = app_link.applyUrl(url, {search: location.search});
    // Attempt to set a referrer.
    url = app_link.applyReferrer(url);
  }
  return url;
};

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
app_link.isPathWhitelisted = function (path, whitelist) {
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
    // Remove carriage return character (\r) if any from whitelist item.
    item = whitelist[i].replace(/\r/g, '');
    rx = new RegExp(item);
    if (rx.test(path)) {
      return true;
    }
  }

  return false;
};

/**
 * Parse Query String parameters.
 *
 * @return {object<key:value>}
 *   A map of key values from the query string.
 */
app_link.getQueryParams = function () {
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
};

/**
 * Attaches the referrer to a destination URL.
 *
 * @param {string} url
 *   The URL to apply transformation.
 *
 * @return {string}
 *   The transformed URL.
 */
app_link.applyReferrer = function (url) {
  if (url && document.referrer && url.indexOf("referrer") === -1) {
    return app_link.applyUrl(url, {search: "referrer=" + encodeURIComponent(document.referrer)});
  }
  return url;
};

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
app_link.applyUrl = function (url, parts) {
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
};

/**
 * The browser doesn't tell us if we were successful or not.
 *   Keep a heartbeat to see if the page is still visible.
 *
 * @param {function} callback
 *   Called when we failed to do what was exected.
 */
app_link.onFailure = function (callback) {
  var timerFailed = setTimeout(callback, 2000);
  // If we know the page is hidden, then we did not fail.
  // Cancel the failure and attempt to close out.
  var timerHeartbeat = setInterval(function () {
    if (document.webkitHidden || document.hidden) {
      clearInterval(timerHeartbeat);
      clearTimeout(timerFailed);
      window.close();
    }
  }, 100);
};

/**
 * Redirect. If it fails, try iframe trick.
 *
 * @param {string} url
 *   The URL to direct to.
 *
 * @return {string}
 *   The URL directed to.
 */
app_link.directOrIframe = function (url) {
  if (!url) {
    return app_link.fallback();
  }
  // If we're still here, try the iframe trick.
  app_link.onFailure(function() {
    app_link.iframe(url);
  });
  document.location = url;
  return url;
};

/**
 * Redirect. If it fails, redirect to temp page with the store.
 *
 * @param {string} url
 *   The URL to direct to.
 *
 * @return {string}
 *   The URL directed to.
 */
app_link.directOrRedirect = function (url) {
  if (!url) {
    return app_link.fallback();
  }
  // If we're still here, try the iframe trick.
  app_link.onFailure(function() {
    var href = url = location.href;
    document.location = href + (href.match(/\?/) ? "&" : "?") + "app_link_redirect=true";
  });
  document.location = url;
  return url;
};

/**
 * A lot of Androids, like the hidden iframe trick.
 *
 * @param {string} url
 *   The URL to direct to.
 *
 * @return {string}
 *   The URL directed to.
 */
app_link.iframe = function (url) {
  if (!url) {
    return app_link.fallback();
  }
  // If we're still here, then give up and go to fallback.
  app_link.onFailure(app_link.fallback);
  var iframe = document.createElement("iframe");
  iframe.style.border = "none";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.onload = app_link.fallback;
  iframe.onerror = app_link.fallback;
  iframe.src = url;
  document.body.appendChild(iframe);
  return url;
};

/**
 * Fallback if they don't have app installed.
 * Unless, PageVisiblityAPI has hidden the page.
 */
app_link.fallback = function () {
  if (!document.webkitHidden && !document.hidden) {
    window.location = app_link.fallbackUrl;
    return app_link.fallbackUrl;
  }
  else {
    window.close();
  }
  return "";
};
