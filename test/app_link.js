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

var USERAGENTS = {
  "Unsupported": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
  "iPhone": "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25",
  "iPod": "Mozilla/5.0 (iPod touch; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53",
  "iPad": "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
  "Android Browser": "Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
  "Android Chrome": "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19",
  "Windows Phone": "Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)",
  "Kindle Fire": "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Kindle Fire Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
};

describe("Test Applink Redirects", function() {
  // This spawns a separate PhantomJS process that will talk back asyncronously via WebSocket.
  var phantom_instance;
  before(function(done) {
    phantom.create(function (ph) {
      phantom_instance = ph;
      done();
    });
  });
  after(function() {
    phantom_instance.exit();
  });

  /** @var {object} applink: Data about this applink. Keyed by Platform ID */
  var applink;
  beforeEach(function() {
    applink = clone(PLATFORMS);
  });

  /**
   * Test a given app link
   *   - We will take the useragent and lie to Phantom.
   * @param {object} options
   *   - {string} useragent
   *     User Agent that Phantom should prentend to be.
   *   - {string} baseURL
   *     URL to start the browser at.
   *   - {object} headers
   *     Custom HTTP headers to set in browser (such as Referer - intentional typo)
   *   - {boolean} loadImages
   *     TRUE to load images when rendering pages (slower).
   *   - {string} inject
   *     Custom HTML to inject in page.
   * @param {string} targetURL
   *   URL we hope the browser is redirected to.
   * @param {function} done.
   *   Callback to call when done, called with Error if failure.
   */
  function testApplinkRedirect (options, targetURL, done) {
    var useragent = options.useragent || USERAGENTS.Unsupported;
    var baseURL = options.baseURL || BASE_URL;
    phantom_instance.createPage(function (page) {
      // The "onNavigationRequested" event is async and can easily fire in an
      // unexpected order.  So, we wrap the two tasks in separate promises.
      var listen = new Promise(function (resolve, reject) {
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
        var timelimit = 300;
        // If something bad happens, and we do not get our expected navigation,
        // then we would like to catch that rather than wait for Mocha to bail out.
        // This allows us to properly kill the spawned process.
        setTimeout(function() {
          reject(new Error("onNavigationRequested waiting too long after " + timelimit + "ms."));
        }, timelimit);
      });
      var evaluate = new Promise(function (resolve) {
        page.set("settings.userAgent", useragent, resolve);
      });
      if (!options.loadImages) {
        evaluate = evaluate.then(function() {
          return new Promise(function (resolve) {
            page.set("settings.loadImages", false, resolve);
          });
        });
      }
      if (options.headers) {
        evaluate = evaluate.then(function() {
          return new Promise(function (resolve) {
            page.set("customHeaders", options.headers, resolve);
          });
        });
      }
      evaluate = evaluate.then(function() {
        return new Promise(function (resolve) {
          page.open(baseURL, resolve);
        });
      });
      evaluate = evaluate.then(function() {
        return new Promise(function (resolve, reject) {
          // The browserCall function is copied and run in the PhantomJS browser syncronously.
          var browserCall = function(evalCode) {
            // Phantom-Node will not catch thrown errors for us.
            try {
              if (evalCode) {
                eval(evalCode); // eslint-disable-line no-eval
              }
              var args = Array.prototype.slice.call(arguments, 1);
              return app_link.apply(this, args);
            }
            catch (err) {
              location.href = "";
              return {
                message: err.toString(),
                stack: err.stack
              };
            }
          };
          var nodeReceive = function (result) {
            if (result && typeof result === "object") {
              var err = new Error(result.message);
              err.stack = result.stack;
              reject(err);
            }
            resolve();
          };
          page.evaluate(browserCall, nodeReceive,
            // Arguments for browser call
            options.inject, applink, applink.app_link_platform_fallback.fallback_url
          );
        });
      });
      Promise.all([listen, evaluate])
        .then(function() {
          page.close();
          done();
        })
        .catch(function (err) {
          page.close();
          done(err);
        });
    });
  }

  describe("Platform", function() {
    it("Unsupported Desktop to the Fallback.", function(done) {
      testApplinkRedirect({}, applink.app_link_platform_fallback.fallback_url, done);
    });
    function testPlatform (browser, key) {
      key = "app_link_platform_" + key;
      it(browser + " to the App Url.", function(done) {
        var target = browser === "Android Chrome" ? "intent_url" : "app_url";
        testApplinkRedirect({useragent: USERAGENTS[browser]}, applink[key][target], done);
      });
      it(browser + " to the App Store Url w/o app_url.", function(done) {
        applink[key].app_url = applink[key].intent_url = "";
        testApplinkRedirect({useragent: USERAGENTS[browser]}, applink[key].store_url, done);
      });
      it(browser + " should go to the App Store Url w/o app_url or store_url.", function(done) {
        applink[key].app_url = applink[key].intent_url = applink[key].store_url = "";
        testApplinkRedirect({useragent: USERAGENTS[browser]}, applink.app_link_platform_fallback.fallback_url, done);
      });
    }
    testPlatform("iPhone", "iphone");
    testPlatform("iPod", "iphone");
    testPlatform("iPad", "ipad");
    testPlatform("Android Browser", "android");
    testPlatform("Android Chrome", "android");
    testPlatform("Windows Phone", "windows_phone");
    testPlatform("Kindle Fire", "kindle_fire");
   });
 
  /**
   * Limit scope to distinct cases: URI Schemes (most) & Intent URLs (Android)
   */
  describe("URL Processing on URI Schemes", function() {
    function testPlatform (browser, key, type) {
      key = "app_link_platform_" + key;
      it(type + " should pass the querystring if supported.", function(done) {
        applink[key].supports_qs = 1;
        var target = applink[key][type].split("#");
        target = target[0] +
          (target[0].match(/\?/) ? "&" : "?") + "a=b&c=d" +
          (target.length > 1 ? "#" + target[1] : "");
        testApplinkRedirect({useragent: USERAGENTS[browser], baseURL: BASE_URL + "?a=b&c=d"},
          target, done);
      });
      it(type + " should not pass the querystring if not supported.", function(done) {
        applink[key].supports_qs = 0;
        var target = applink[key][type];
        testApplinkRedirect({useragent: USERAGENTS[browser], baseURL: BASE_URL + "?a=b&c=d"},
          target, done);
      });
      it(type + " should pass the path if supported.", function(done) {
        applink[key].supports_path = 1;
        var target = applink[key][type].split("#");
        target = target[0] +
          (target[0][target[0].length - 1] === "/" ? "" : "/") + "a/b/" +
          (target.length > 1 ? "#" + target[1] : "");
        testApplinkRedirect({useragent: USERAGENTS[browser], baseURL: BASE_URL + "?path=/a/b/"},
          target, done);
      });
      it(type + " should not pass the path if not supported.", function(done) {
        applink[key].supports_path = 0;
        var target = applink[key][type];
        testApplinkRedirect({useragent: USERAGENTS[browser], baseURL: BASE_URL + "?path=/a/b/"},
          target, done);
      });
      it(type + " should pass the querystring to Store if supported.", function(done) {
        applink[key][type] = "";
        applink[key].supports_store_qs = 1;
        var base = BASE_URL +
          (BASE_URL.match(/\?/) ? "&" : "?") + "a=b&c=d";
        var target = applink[key].store_url +
          (applink[key].store_url.match(/\?/) ? "&" : "?") + "a=b&c=d";
        testApplinkRedirect({useragent: USERAGENTS[browser], baseURL: base},
          target, done);
      });
      it(type + " should not pass the querystring to Store if not supported.", function(done) {
        applink[key][type] = "";
        applink[key].supports_store_qs = 0;
        var target = applink[key].store_url;
        testApplinkRedirect({useragent: USERAGENTS[browser], baseURL: BASE_URL + "?a=b&c=d"},
          target, done);
      });
    }
    testPlatform("iPhone", "iphone", "app_url");
    testPlatform("Android Chrome", "android", "intent_url");
    // TODO: Fallback is processed is server-side logic.  Not currently Testable client-side.
    // This is tough to port since we need it in HTML places like <link rel=canonical />
    // it("Fallback should pass the querystring if supported.", function(done) {
    //   applink.fallback.supports_qs = 1;
    //   testApplinkRedirect(applink, {baseURL: BASE_URL + "?a=b&c=d"},
    //     applink.fallback.fallback_url + "?a=b&c=d",
    //     done
    //   );
    // });
  });

  /**
   * Test Async Before Hook.
   */
  describe("Asyncronous Before Hook", function() {
    it("Should run sync before hook.", function(done) {
      testApplinkRedirect(
        {inject: "app_link.before = function(cb){ cb(); }"},
        applink.app_link_platform_fallback.fallback_url,
        done
      );
    });
    it("Should wait for async before hook.", function(done) {
      testApplinkRedirect(
        {inject: "app_link.before = function(cb){ setTimeout(cb, 100); }"},
        applink.app_link_platform_fallback.fallback_url,
        done
      );
    });
    it("Should wait indefinitely for broken async before hook.", function(done) {
      testApplinkRedirect(
        {inject: "app_link.before = function(cb){ }"},
        applink.app_link_platform_fallback.fallback_url,
        function (err) {
          if (err) {
            done();
          } else {
            done(new Error("App Link did not wait for before hook."));
          }
        }
      );
    });
  });
});
