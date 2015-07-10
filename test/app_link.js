/*eslint-env node, mocha*/
/*global app_link*/
"use strict";
var phantom = require("phantom");
var clone = require("lodash/lang/cloneDeep");
var PLATFORMS = require("./fixtures/example-platforms.json");

// Spin up a web-server to server our simple page.
// Phantom works more naturally with URLs than Files.
require("./fixtures/http-server").listen(3000);
var BASE_URL = "http://localhost:3000/";

var DESKTOP = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.132 Safari/537.36";
var IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25";
var IPAD = "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25";
var ANDROID = "Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";
var ANDROID_CHROME = "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19";
var WINDOWS_PHONE = "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)";
var KINDLE = "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Kindle Fire Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1";

/**
 * Test a given app link
 *   - We'll take the useragent and lie to Phantom.
 * @param {object} applink
 *   Data about this applink. Keyed by Platform ID
 * @param {string} useragent
 *   User Agent that Phantom should prentend to be.
 * @param {string} baseURL
 *   URL to start the browser at.
 * @param {string} targetURL
 *   URL we hope the browser is redirected to.
 * @param {function} done.
 *   Callback to call when done, called with Error if failure.
 */
function testApplinkRedirect (applink, useragent, baseURL, targetURL, done) {
  // This spawns a separate PhantomJS process that will talk back asyncronously via WebSocket.
  phantom.create(function (ph) {
    ph.createPage(function (page) {
      // The "onNavigationRequested" event is async and can easily fire in an
      // unexpected order.  So, we wrap the two tasks in separate promises.
      Promise.all([
        new Promise(function (resolve, reject) {
          page.set("onNavigationRequested", function (url) {
            if (url === "about:blank" || url === baseURL) {
              return;
            }
            if (url !== targetURL) {
              reject(new Error("Result URL (" + url + ") does not match Target URL (" + targetURL + ")"));
              return;
            }
            resolve(url);
          });
          var timelimit = 1000;
          // If something bad happens, and we don't get our expected navigation,
          // then we'd like to catch that rather than wait for Mocha to bail out.
          // This allows us to properly kill the spawned process.
          setTimeout(function() {
            reject(new Error("onNavigationRequested waiting too long after " + timelimit + "ms."));
          }, 1000);
        }),
        new Promise(function (resolve, reject) {
          page.set("settings.userAgent", useragent, function() {
            page.open(baseURL, function() {
              // The first function is copied and run in the PhantomJS browser syncronously.
              // The second function receives the first return value in NodeJS (via WebSocket API).
              page.evaluate(
                function() {
                  // Phantom-Node will not catch thrown errors for us.
                  try {
                    return app_link.apply(this, arguments);
                  }
                  catch (err) {
                    location.href = "";
                    return {
                      message: err.toString(),
                      stack: err.stack
                    };
                  }
                },
                function (result) {
                  if (result && typeof result === "object") {
                    var err = new Error(result.message);
                    err.stack = result.stack;
                    reject(err);
                  }
                  resolve();
                },
                // Arguments for evaluated function
                applink, applink.app_link_platform_fallback.fallback_url
              );
            });
          });
        })
      ]).then(function() {
        ph.exit();
        done();
      }, function (err) {
        ph.exit();
        done(err);
      });
    });
  });
}

// Base line testing for all of our platforms
describe("Platform routing", function() {
  var applink;
  beforeEach(function() {
    applink = clone(PLATFORMS);
  });
  it("Desktop should go to the Fallback.", function(done) {
    testApplinkRedirect(applink, DESKTOP, BASE_URL, applink.app_link_platform_fallback.fallback_url, done);
  });
  it("iPhone should go to the App Url.", function(done) {
    testApplinkRedirect(applink, IPHONE, BASE_URL, applink.app_link_platform_iphone.app_url, done);
  });
  it("iPhone should go to the App Store Url w/o app_url.", function(done) {
    applink.app_link_platform_iphone.app_url = "";
    testApplinkRedirect(applink, IPHONE, BASE_URL, applink.app_link_platform_iphone.store_url, done);
  });
  it("iPad should go to the App Url.", function(done) {
    testApplinkRedirect(applink, IPAD, BASE_URL, applink.app_link_platform_ipad.app_url, done);
  });
  it("iPad should go to the App Store Url w/o app_url.", function(done) {
    applink.app_link_platform_ipad.app_url = "";
    testApplinkRedirect(applink, IPAD, BASE_URL, applink.app_link_platform_ipad.store_url, done);
  });
  it("Android Browser should go to the App Url.", function(done) {
    testApplinkRedirect(applink, ANDROID, BASE_URL, applink.app_link_platform_android.app_url, done);
  });
  it("Android Browser should go to the App Store Url w/o app_url.", function(done) {
    applink.app_link_platform_android.app_url = "";
    testApplinkRedirect(applink, ANDROID, BASE_URL, applink.app_link_platform_android.store_url, done);
  });
  it("Android Chrome should go to the App Url.", function(done) {
    testApplinkRedirect(applink, ANDROID_CHROME, BASE_URL, applink.app_link_platform_android.intent_url, done);
  });
  it("Android Chrome should go to the App Store Url w/o intent_url.", function(done) {
    applink.app_link_platform_android.intent_url = "";
    testApplinkRedirect(applink, ANDROID_CHROME, BASE_URL, applink.app_link_platform_android.store_url, done);
  });
  it("Windows Phone should go to the App Url.", function(done) {
    testApplinkRedirect(applink, WINDOWS_PHONE, BASE_URL, applink.app_link_platform_windows_phone.app_url, done);
  });
  it("Windows Phone should go to the App Store Url w/o app_url.", function(done) {
    applink.app_link_platform_windows_phone.app_url = "";
    testApplinkRedirect(applink, WINDOWS_PHONE, BASE_URL, applink.app_link_platform_windows_phone.store_url, done);
  });
  it("Kindle Fire should go to the App Url.", function(done) {
    testApplinkRedirect(applink, KINDLE, BASE_URL, applink.app_link_platform_kindle_fire.app_url, done);
  });
  it("Kindle Fire should go to the App Store Url w/o app_url.", function(done) {
    applink.app_link_platform_kindle_fire.app_url = "";
    testApplinkRedirect(applink, KINDLE, BASE_URL, applink.app_link_platform_kindle_fire.store_url, done);
  });
});

/**
 * Limit scope to distinct cases: URI Schemes (most) & Intent URLs (Android)
 */
describe("URL Processing", function() {
  var applink;
  beforeEach(function() {
    applink = clone(PLATFORMS);
  });
  // TODO: Fallback is processed is server-side logic.  Not currently Testable client-side.
  // This is tough to port since we need it in HTML places like <link rel=canonical />
  // it("Fallback should pass the querystring if supported.", function(done) {
  //   applink.app_link_platform_fallback.supports_qs = 1;
  //   testApplinkRedirect(applink, DESKTOP,
  //     BASE_URL + "?a=b&c=d",
  //     applink.app_link_platform_fallback.fallback_url + "?a=b&c=d",
  //     done
  //   );
  // });
  it("iPhone should pass the querystring if supported.", function(done) {
    applink.app_link_platform_iphone.supports_qs = 1;
    testApplinkRedirect(applink, IPHONE,
      BASE_URL + "?a=b&c=d",
      applink.app_link_platform_iphone.app_url + "?a=b&c=d",
      done
    );
  });
  it("iPhone should not pass the querystring if not supported.", function(done) {
    applink.app_link_platform_iphone.supports_qs = 0;
    testApplinkRedirect(applink, IPHONE,
      BASE_URL + "?a=b&c=d",
      applink.app_link_platform_iphone.app_url,
      done
    );
  });
  it("iPhone should pass the path if supported.", function(done) {
    applink.app_link_platform_iphone.supports_path = 1;
    testApplinkRedirect(applink, IPHONE,
      BASE_URL + "?path=/a/b/",
      applink.app_link_platform_iphone.app_url + "a/b/",
      done
    );
  });
  it("iPhone should not pass the path if not supported.", function(done) {
    applink.app_link_platform_iphone.supports_path = 0;
    testApplinkRedirect(applink, IPHONE,
      BASE_URL + "?path=/a/b/",
      applink.app_link_platform_iphone.app_url,
      done
    );
  });
  it("iPhone should pass the querystring to Store if supported.", function(done) {
    applink.app_link_platform_iphone.app_url = "";
    applink.app_link_platform_iphone.supports_store_qs = 1;
    testApplinkRedirect(applink, IPHONE,
      BASE_URL + "?a=b&c=d",
      applink.app_link_platform_iphone.store_url + "&a=b&c=d",
      done
    );
  });
  it("iPhone should not pass the querystring to Store if not supported.", function(done) {
    applink.app_link_platform_iphone.app_url = "";
    applink.app_link_platform_iphone.supports_store_qs = 0;
    testApplinkRedirect(applink, IPHONE,
      BASE_URL + "?a=b&c=d",
      applink.app_link_platform_iphone.store_url,
      done
    );
  });
  it("Android Chrome should pass the querystring if supported.", function(done) {
    applink.app_link_platform_android.supports_qs = 1;
    var targetParts = applink.app_link_platform_android.intent_url.split("#");
    testApplinkRedirect(applink, ANDROID_CHROME,
      BASE_URL + "?a=b&c=d",
      (targetParts[0] + "?a=b&c=d#" + targetParts[1]),
      done
    );
  });
  it("Android Chrome should not pass the querystring if not supported.", function(done) {
    applink.app_link_platform_android.supports_qs = 0;
    testApplinkRedirect(applink, ANDROID_CHROME,
      BASE_URL + "?a=b&c=d",
      applink.app_link_platform_android.intent_url,
      done
    );
  });
  it("Android Chrome should pass the path if supported.", function(done) {
    applink.app_link_platform_android.supports_path = 1;
    var targetParts = applink.app_link_platform_android.intent_url.split("#");
    testApplinkRedirect(applink, ANDROID_CHROME,
      BASE_URL + "?path=/a/b/",
      (targetParts[0] + "/a/b/#" + targetParts[1]),
      done
    );
  });
  it("Android Chrome should not pass the path if not supported.", function(done) {
    applink.app_link_platform_android.supports_path = 0;
    testApplinkRedirect(applink, ANDROID_CHROME,
      BASE_URL + "?path=/a/b/",
      applink.app_link_platform_android.intent_url,
      done
    );
  });
  it("Android Chrome should pass the querystring to Store if supported.", function(done) {
    applink.app_link_platform_android.intent_url = "";
    applink.app_link_platform_android.supports_store_qs = 1;
    testApplinkRedirect(applink, ANDROID_CHROME,
      BASE_URL + "?a=b&c=d",
      applink.app_link_platform_android.store_url + "&a=b&c=d",
      done
    );
  });
  it("Android Chrome should not pass the querystring to Store if not supported.", function(done) {
    applink.app_link_platform_android.intent_url = "";
    applink.app_link_platform_android.supports_store_qs = 0;
    testApplinkRedirect(applink, ANDROID_CHROME,
      BASE_URL + "?a=b&c=d",
      applink.app_link_platform_android.store_url,
      done
    );
  });
});
