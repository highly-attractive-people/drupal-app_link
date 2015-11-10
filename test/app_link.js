/*eslint-env node, mocha*/
/*global app_link*/
"use strict";
var phantom = require("phantom");
var clone = require("lodash/lang/cloneDeep");
var startServer = require("./fixtures/http-server");
var PLATFORMS = require("./fixtures/example-platforms.json");

var USERAGENTS = {
  "Unsupported": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
  "iPhone": "Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25",
  "iPod": "Mozilla/5.0 (iPod touch; CPU iPhone OS 7_0_4 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B554a Safari/9537.53",
  "iPad": "Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25",
  "Android Browser": "Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
  "Android Chrome": "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.133 Mobile Safari/535.19",
  "Windows Phone": "Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 930) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537",
  "Kindle Fire": "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; Kindle Fire Build/GINGERBREAD) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1",
  "OSX Safari": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/7.1.7 Safari/537.85.16",
  "OSX Chrome": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.134 Safari/537.36",
  "OSX Firefox": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:38.0) Gecko/20100101 Firefox/38.0",
  "Windows Explorer": "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)",
  "Windows Chrome": "Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1667.0 Safari/537.36",
  "Windows Firefox": "Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:27.0) Gecko/20121011 Firefox/27.0"
};

describe("App Link Redirects", function() {
  // Web-server for simple page: Phantom works more naturally with URLs than Files.
  var BASE_URL;
  // This spawns a separate PhantomJS process that will talk back asyncronously via WebSocket.
  var phantom_instance;
  before(function(done) {
    startServer(function(err, server) {
      if (err) {
        return done(err);
      }
      BASE_URL = "http://localhost:" + server.address().port + "/";
      done();
    });
  });
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
   *   - {string} browser
   *     User Agent key that Phantom should pretend to be.
   *   - {string} baseURL
   *     URL to start the browser at.
   *   - {object} headers
   *     Custom HTTP headers to set in browser (such as Referer - intentional typo)
   *   - {boolean} loadImages
   *     TRUE to load images when rendering pages (slower).
   *   - {int} timeLimit
   *     Time in milliseconds to wait for Navigation change.
   *   - {string} inject
   *     Custom HTML to inject in page.
   * @param {string} targetURL
   *   URL we hope the browser is redirected to.
   * @param {function} done.
   *   Callback to call when done, called with Error if failure.
   */
  function testApplinkRedirect (options, targetURL, done) {
    var useragent = USERAGENTS[options.browser || "Unsupported"];
    var baseURL = options.baseURL || BASE_URL;
    var timeLimit = options.timeLimit || 150;
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
        // If something bad happens, and we do not get our expected navigation,
        // then we would like to catch that rather than wait for Mocha to bail out.
        // This allows us to properly kill the spawned process.
        setTimeout(function() {
          reject(new Error("onNavigationRequested waiting too long after " + timeLimit + "ms."));
        }, timeLimit);
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
      if (options.inject) {
        evaluate = evaluate.then(function() {
          return new Promise(function (resolve) {
            page.evaluate(options.inject, resolve); // eslint-disable-line no-eval
          });
        });
      }
      evaluate = evaluate.then(function() {
        return new Promise(function (resolve, reject) {
          // The browserCall function is copied and run in the PhantomJS browser syncronously.
          var browserCall = function() {
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
            applink, applink.app_link_platform_fallback.fallback_url
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

  it("Unsupported Desktop to the Fallback.", function(done) {
    testApplinkRedirect({}, applink.app_link_platform_fallback.fallback_url, done);
  });

  /**
   * Base line testing for all of our platforms
   */
  function testPlatform (browser, platformKey) {
    var urlType = browser === "Android Chrome" ? "intent_url" : "app_url";
    describe("Platform " + browser, function() {
      it("To App URL.", function(done) {
        testApplinkRedirect({browser: browser}, applink[platformKey][urlType], done);
      });
      it("To Store URL w/o App URL.", function(done) {
        applink[platformKey][urlType] = "";
        testApplinkRedirect({browser: browser}, applink[platformKey].store_url, done);
      });
    });
  }
  testPlatform("iPhone", "app_link_platform_iphone");
  testPlatform("iPod", "app_link_platform_iphone");
  testPlatform("iPad", "app_link_platform_ipad");
  testPlatform("Android Browser", "app_link_platform_android");
  testPlatform("Android Chrome", "app_link_platform_android");
  testPlatform("Windows Phone", "app_link_platform_windows_phone");
  testPlatform("Kindle Fire", "app_link_platform_kindle_fire");
  testPlatform("OSX Safari", "app_link_platform_mac");
  testPlatform("OSX Chrome", "app_link_platform_mac");
  testPlatform("OSX Firefox", "app_link_platform_mac");
  testPlatform("Windows Explorer", "app_link_platform_windows");
  testPlatform("Windows Chrome", "app_link_platform_windows");
  testPlatform("Windows Firefox", "app_link_platform_windows");
 
  /**
   * Limit scope to distinct cases: URI Schemes (most) & Intent URLs (Android)
   */
  function testProcessing (browser, platformKey) {
    var urlType = browser === "Android Chrome" ? "intent_url" : "app_url";
    describe("Processing " + urlType, function() {
      it("Fallbacks back w/o App URL or Store URL.", function(done) {
        applink[platformKey][urlType] = applink[platformKey].store_url = "";
        testApplinkRedirect({browser: browser}, applink.app_link_platform_fallback.fallback_url, done);
      });
      it("With the querystring, if supported.", function(done) {
        applink[platformKey].supports_qs = 1;
        var targetURL = applink[platformKey][urlType].split("#");
        targetURL = targetURL[0] +
          (targetURL[0].match(/\?/) ? "&" : "?") + "a=b&c=d" +
          (targetURL.length > 1 ? "#" + targetURL[1] : "");
        testApplinkRedirect({browser: browser, baseURL: BASE_URL + "?a=b&c=d"},
          targetURL, done);
      });
      it("Without the querystring, if not supported.", function(done) {
        applink[platformKey].supports_qs = 0;
        var targetURL = applink[platformKey][urlType];
        testApplinkRedirect({browser: browser, baseURL: BASE_URL + "?a=b&c=d"},
          targetURL, done);
      });
      it("With the path, if supported.", function(done) {
        applink[platformKey].supports_path = 1;
        var targetURL = applink[platformKey][urlType].split("#");
        targetURL = targetURL[0] +
          (targetURL[0][targetURL[0].length - 1] === "/" ? "" : "/") + "a/b/" +
          (targetURL.length > 1 ? "#" + targetURL[1] : "");
        testApplinkRedirect({browser: browser, baseURL: BASE_URL + "?path=/a/b/"},
          targetURL, done);
      });
      it("Without the path, if not supported.", function(done) {
        applink[platformKey].supports_path = 0;
        var targetURL = applink[platformKey][urlType];
        testApplinkRedirect({browser: browser, baseURL: BASE_URL + "?path=/a/b/"},
          targetURL, done);
      });
      it("With the querystring to Store, if supported.", function(done) {
        applink[platformKey][urlType] = "";
        applink[platformKey].supports_store_qs = 1;
        var baseURL = BASE_URL +
          (BASE_URL.match(/\?/) ? "&" : "?") + "a=b&c=d";
        var targetURL = applink[platformKey].store_url +
          (applink[platformKey].store_url.match(/\?/) ? "&" : "?") + "a=b&c=d";
        testApplinkRedirect({browser: browser, baseURL: baseURL},
          targetURL, done);
      });
      it("With the querystring to Store, if not supported.", function(done) {
        applink[platformKey][urlType] = "";
        applink[platformKey].supports_store_qs = 0;
        var targetURL = applink[platformKey].store_url;
        testApplinkRedirect({browser: browser, baseURL: BASE_URL + "?a=b&c=d"},
          targetURL, done);
      });
    });
  }
  testProcessing("iPhone", "app_link_platform_iphone");
  testProcessing("Android Chrome", "app_link_platform_android");
  // TODO: Fallback is processed is server-side logic.  Not currently Testable client-side.
  // This is tough to port since we need it in HTML places like <link rel=canonical />
  // it("Fallback should pass the querystring if supported.", function(done) {
  //   applink.app_link_platform_fallback.supports_qs = 1;
  //   testApplinkRedirect(applink, {baseURL: BASE_URL + "?a=b&c=d"},
  //     applink.app_link_platform_fallback.fallback_url + "?a=b&c=d",
  //     done
  //   );
  // });

  /**
   * Test Async Before Hook.
   */
  describe("Before Hook", function() {
    it("Modifies fallback variable.", function(done) {
      testApplinkRedirect({inject: function() {
        app_link.before = function(cb){
          app_link.fallbackUrl += "?a=b";
          cb();
        };
      }}, applink.app_link_platform_fallback.fallback_url + "?a=b", done);
    });
    it("Modifies platform variables.", function(done) {
      testApplinkRedirect({browser: "iPhone", inject: function() {
        app_link.before = function(cb){
          app_link.platforms.app_link_platform_iphone.app_url += "?a=b";
          cb();
        };
      }}, applink.app_link_platform_iphone.app_url + "?a=b", done);
    });
    it("Wait for async.", function(done) {
      testApplinkRedirect({inject: function() {
        app_link.before = function(cb){ setTimeout(cb, 33); };
      }}, applink.app_link_platform_fallback.fallback_url, done);
    });
    it("Should wait indefinitely for broken async.", function(done) {
      testApplinkRedirect({inject: function() {
        app_link.before = function(){ };
      }}, applink.app_link_platform_fallback.fallback_url, function (err) {
        if (err) {
          done();
        } else {
          done(new Error("App Link did not wait for before hook."));
        }
      });
    });
  });
});
