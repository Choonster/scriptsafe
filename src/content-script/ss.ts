// ScriptSafe - Copyright (C) andryou
// Distributed under the terms of the GNU General Public License
// The GNU General Public License can be found in the gpl.txt file. Alternatively, see <http://www.gnu.org/licenses/>.

import {
  baddies,
  extractDomainFromURL,
  in_array,
  thirdParty,
} from '../common/common';

// TODO: beforeload seems to be Safari-specific and may or may not work any more, it was removed from Chrome in 2014:
// https://issues.chromium.org/issues/41083119
var savedBeforeloadEvents: Event[] = new Array();
var timer: ReturnType<typeof setTimeout>;
var iframe: NumericBool = 0;
var clipboard = false;
var timestamp = Math.round(new Date().getTime() / 1000.0);
var linktrgt: '_self' | '_blank';

// initialize settings object with default settings (that are overwritten by the actual user-set values later on)
var SETTINGS: ContentScriptSettings = {
  MODE: 'block',
  LISTSTATUS: 'false',
  DOMAINSTATUS: -1,
  WHITELIST: [],
  BLACKLIST: [],
  WHITELISTSESSION: [],
  BLACKLISTSESSION: [],
  SCRIPT: 'true',
  NOSCRIPT: 'true',
  OBJECT: 'true',
  APPLET: 'true',
  EMBED: 'true',
  IFRAME: 'true',
  FRAME: 'true',
  AUDIO: 'true',
  VIDEO: 'true',
  IMAGE: 'false',
  CANVAS: 'false',
  CANVASFONT: 'false',
  CLIENTRECTS: 'false',
  AUDIOBLOCK: 'false',
  BATTERY: 'false',
  WEBGL: 'false',
  KEYBOARD: 'false',
  WEBRTCDEVICE: 'false',
  GAMEPAD: 'false',
  WEBVR: 'false',
  BLUETOOTH: 'false',
  TIMEZONE: 'false',
  ANNOYANCES: 'false',
  ANNOYANCESMODE: 'relaxed',
  ANTISOCIAL: 'false',
  PRESERVESAMEDOMAIN: 'false',
  WEBBUGS: 'true',
  LINKTARGET: 'off',
  EXPERIMENTAL: 0,
  REFERRER: 'true',
  REFERRERSPOOFDENYWHITELISTED: 'true',
  PARANOIA: 'true',
  CLIPBOARD: 'false',
  DATAURL: 'true',
  KEYDELTA: 0,
  BROWSERPLUGINS: 'false',
  USERAGENT: '',
};

document.addEventListener('beforeload', saveBeforeloadEvent, true); // eventually remove

if (window.self != window.top) iframe = 1;

chrome.runtime.sendMessage(
  {
    reqtype: 'get-settings',
    iframe: iframe,
  } satisfies GetSettingsRequest,
  function (response: GetSettingsResponse) {
    document.removeEventListener('beforeload', saveBeforeloadEvent, true); // eventually remove
    if (typeof response === 'object' && response.status == 'true') {
      SETTINGS['MODE'] = response.mode;
      SETTINGS['ANNOYANCES'] = response.annoyances;
      SETTINGS['ANNOYANCESMODE'] = response.annoyancesmode;
      SETTINGS['ANTISOCIAL'] = response.antisocial;
      SETTINGS['WHITELIST'] = response.whitelist;
      SETTINGS['BLACKLIST'] = response.blacklist;
      SETTINGS['WHITELISTSESSION'] = response.whitelistSession;
      SETTINGS['BLACKLISTSESSION'] = response.blackListSession;
      SETTINGS['SCRIPT'] = response.script;
      SETTINGS['PRESERVESAMEDOMAIN'] = response.preservesamedomain;
      SETTINGS['EXPERIMENTAL'] = response.experimental;
      SETTINGS['DOMAINSTATUS'] = domainCheck(window.location.href, 1);
      if (
        SETTINGS['EXPERIMENTAL'] == 0 &&
        (((SETTINGS['PRESERVESAMEDOMAIN'] == 'false' ||
          SETTINGS['DOMAINSTATUS'] == 1) &&
          response.enable == 'true' &&
          SETTINGS['SCRIPT'] == 'true' &&
          SETTINGS['DOMAINSTATUS'] != 0) ||
          (SETTINGS['ANNOYANCES'] == 'true' &&
            (SETTINGS['ANNOYANCESMODE'] == 'strict' ||
              (SETTINGS['ANNOYANCESMODE'] == 'relaxed' &&
                SETTINGS['DOMAINSTATUS'] != 0)) &&
            baddies(
              window.location.hostname,
              SETTINGS['ANNOYANCESMODE'],
              SETTINGS['ANTISOCIAL'],
            ) == 1) ||
          (SETTINGS['ANTISOCIAL'] == 'true' &&
            baddies(
              window.location.hostname,
              SETTINGS['ANNOYANCESMODE'],
              SETTINGS['ANTISOCIAL'],
            ) == 2))
      ) {
        mitigate();
      }
      SETTINGS['LISTSTATUS'] = response.enable;
      SETTINGS['NOSCRIPT'] = response.noscript;
      SETTINGS['OBJECT'] = response.object;
      SETTINGS['APPLET'] = response.applet;
      SETTINGS['EMBED'] = response.embed;
      SETTINGS['IFRAME'] = response.iframe;
      SETTINGS['FRAME'] = response.frame;
      SETTINGS['AUDIO'] = response.audio;
      SETTINGS['VIDEO'] = response.video;
      SETTINGS['IMAGE'] = response.image;
      SETTINGS['CANVAS'] = response.canvas;
      SETTINGS['CANVASFONT'] = response.canvasfont;
      SETTINGS['CLIENTRECTS'] = response.clientrects;
      SETTINGS['AUDIOBLOCK'] = response.audioblock;
      SETTINGS['BATTERY'] = response.battery;
      SETTINGS['WEBGL'] = response.webgl;
      SETTINGS['WEBRTCDEVICE'] = response.webrtcdevice;
      SETTINGS['GAMEPAD'] = response.gamepad;
      SETTINGS['WEBVR'] = response.webvr;
      SETTINGS['BLUETOOTH'] = response.bluetooth;
      SETTINGS['TIMEZONE'] = response.timezone;
      SETTINGS['CLIPBOARD'] = response.clipboard;
      SETTINGS['BROWSERPLUGINS'] = response.browserplugins;
      if (SETTINGS['CANVAS'] != 'false' && response.fp_canvas != -1)
        SETTINGS['CANVAS'] = 'false';
      if (SETTINGS['CANVASFONT'] == 'true' && response.fp_canvasfont != -1)
        SETTINGS['CANVASFONT'] = 'false';
      if (SETTINGS['AUDIOBLOCK'] == 'true' && response.fp_audio != -1)
        SETTINGS['AUDIOBLOCK'] = 'false';
      if (SETTINGS['WEBGL'] == 'true' && response.fp_webgl != -1)
        SETTINGS['WEBGL'] = 'false';
      if (SETTINGS['BATTERY'] == 'true' && response.fp_battery != -1)
        SETTINGS['BATTERY'] = 'false';
      if (SETTINGS['WEBRTCDEVICE'] == 'true' && response.fp_device != -1)
        SETTINGS['WEBRTCDEVICE'] = 'false';
      if (SETTINGS['GAMEPAD'] == 'true' && response.fp_gamepad != -1)
        SETTINGS['GAMEPAD'] = 'false';
      if (SETTINGS['WEBVR'] == 'true' && response.fp_webvr != -1)
        SETTINGS['WEBVR'] = 'false';
      if (SETTINGS['BLUETOOTH'] == 'true' && response.fp_bluetooth != -1)
        SETTINGS['BLUETOOTH'] = 'false';
      if (
        SETTINGS['CLIENTRECTS'] == 'true' &&
        response.fp_clientrectangles != -1
      )
        SETTINGS['CLIENTRECTS'] = 'false';
      if (SETTINGS['CLIPBOARD'] == 'true' && response.fp_clipboard != -1)
        SETTINGS['CLIPBOARD'] = 'false';
      if (
        SETTINGS['BROWSERPLUGINS'] == 'true' &&
        response.fp_browserplugins != -1
      )
        SETTINGS['BROWSERPLUGINS'] = 'false';
      if (
        SETTINGS['CANVAS'] != 'false' ||
        SETTINGS['CANVASFONT'] == 'true' ||
        SETTINGS['CLIENTRECTS'] == 'true' ||
        SETTINGS['AUDIOBLOCK'] == 'true' ||
        SETTINGS['BATTERY'] == 'true' ||
        SETTINGS['WEBGL'] == 'true' ||
        SETTINGS['WEBRTCDEVICE'] == 'true' ||
        SETTINGS['GAMEPAD'] == 'true' ||
        SETTINGS['WEBVR'] == 'true' ||
        SETTINGS['BLUETOOTH'] == 'true' ||
        SETTINGS['TIMEZONE'] != 'false' ||
        SETTINGS['CLIPBOARD'] == 'true' ||
        SETTINGS['BROWSERPLUGINS'] == 'true'
      ) {
        fingerprintProtection();
      }
      SETTINGS['WEBBUGS'] = response.webbugs;
      SETTINGS['LINKTARGET'] = response.linktarget;
      if (SETTINGS['LINKTARGET'] == 'same') linktrgt = '_self';
      else if (SETTINGS['LINKTARGET'] == 'new') linktrgt = '_blank';
      SETTINGS['REFERRER'] = response.referrer;
      SETTINGS['REFERRERSPOOFDENYWHITELISTED'] =
        response.referrerspoofdenywhitelisted;
      SETTINGS['PARANOIA'] = response.paranoia;
      SETTINGS['USERAGENT'] = response.useragent;
      if (
        SETTINGS['USERAGENT'] != '' &&
        (response.uaspoofallow == 'true' || SETTINGS['DOMAINSTATUS'] != 0)
      ) {
        injectAnon(
          function (useragent: ContentScriptSettings['USERAGENT']) {
            Object.defineProperty(navigator, 'userAgent', {
              enumerable: true,
              configurable: false,
              value: useragent,
            });
          },
          "'" + SETTINGS['USERAGENT'] + "'",
        );
      }
      SETTINGS['DATAURL'] = response.dataurl;
      SETTINGS['KEYBOARD'] = response.keyboard;
      SETTINGS['KEYDELTA'] = response.keydelta;
      $(document).ready(function () {
        loaded();
        if (SETTINGS['KEYBOARD'] == 'true') {
          $('div, :input').keyup(randomDelay);
          $('div, :input').keydown(randomDelay);
        }
        if (SETTINGS['CLIPBOARD'] == 'true') {
          clipboardProtect(window);
          clipboardProtect(document);
        }
      });
      document.addEventListener('beforeload', block, true); // eventually remove
      for (
        var i = 0;
        i < savedBeforeloadEvents.length;
        i++ // eventually remove
      )
        block(savedBeforeloadEvents[i]); // eventually remove
    }
    savedBeforeloadEvents = []; // eventually remove
  },
);

class FakeDOMRectList extends Array implements DOMRectList, Array<DOMRect> {
  constructor(item: DOMRect) {
    super(1);

    this[0] = item;
  }

  item(index: number): DOMRect {
    if (index < 0) {
      return null;
    }

    return this.at(index);
  }
}

function fingerprintProtection() {
  injectAnon(
    function (
      canvas: ContentScriptSettings['CANVAS'],
      canvasfont: ContentScriptSettings['CANVASFONT'],
      audioblock: ContentScriptSettings['AUDIOBLOCK'],
      battery: ContentScriptSettings['BATTERY'],
      webgl: ContentScriptSettings['WEBGL'],
      webrtcdevice: ContentScriptSettings['WEBRTCDEVICE'],
      gamepad: ContentScriptSettings['GAMEPAD'],
      webvr: ContentScriptSettings['WEBVR'],
      bluetooth: ContentScriptSettings['BLUETOOTH'],
      timezone: ContentScriptSettings['TIMEZONE'],
      clientrects: ContentScriptSettings['CLIENTRECTS'],
      clipboard: ContentScriptSettings['CLIPBOARD'],
      browserplugins: ContentScriptSettings['BROWSERPLUGINS'],
    ) {
      function processFunctions(scope: Window & typeof globalThis) {
        /* Browser Plugins */
        if (browserplugins == 'true') {
          scope.Object.defineProperty(navigator, 'plugins', {
            enumerable: true,
            configurable: true,
            get: function () {
              var browserplugins_triggerblock =
                scope.document.createElement('div');
              browserplugins_triggerblock.className =
                'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_browserplugins';
              browserplugins_triggerblock.title = 'navigator.plugins';
              document.documentElement.appendChild(browserplugins_triggerblock);
              return '';
            },
          });
        }
        /* Canvas */
        if (canvas != 'false') {
          var fakecanvas = scope.document.createElement('canvas');
          fakecanvas.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvas';
          if (canvas == 'random') {
            var fakewidth = (fakecanvas.width =
              Math.floor(Math.random() * 999) + 1);
            var fakeheight = (fakecanvas.height =
              Math.floor(Math.random() * 999) + 1);
          }
          var canvas_a = scope.HTMLCanvasElement;
          var origToDataURL = canvas_a.prototype.toDataURL;
          var origToBlob = canvas_a.prototype.toBlob;
          canvas_a.prototype.toDataURL = function (...args) {
            fakecanvas.title = 'toDataURL';
            document.documentElement.appendChild(fakecanvas);
            if (canvas == 'block') return 'false';
            else if (canvas == 'blank') {
              fakecanvas.width = this.width;
              fakecanvas.height = this.height;
              return origToDataURL.apply(fakecanvas, args);
            } else if (canvas == 'random') {
              return origToDataURL.apply(fakecanvas, args);
            }
          };
          canvas_a.prototype.toBlob = function (...args) {
            fakecanvas.title = 'toBlob';
            document.documentElement.appendChild(fakecanvas);
            if (canvas == 'block') return false;
            else if (canvas == 'blank') {
              fakecanvas.width = this.width;
              fakecanvas.height = this.height;
              return origToBlob.apply(fakecanvas, args);
            } else if (canvas == 'random') {
              return origToBlob.apply(fakecanvas, args);
            }
          };
          var canvas_b = scope.CanvasRenderingContext2D;
          var origGetImageData = canvas_b.prototype.getImageData;
          canvas_b.prototype.getImageData = function (...args) {
            fakecanvas.title = 'getImageData';
            document.documentElement.appendChild(fakecanvas);
            if (canvas == 'block') return undefined;
            else if (canvas == 'blank') {
              fakecanvas.width = this.canvas.width;
              fakecanvas.height = this.canvas.height;
              return origGetImageData.apply(fakecanvas.getContext('2d'), args);
            } else if (canvas == 'random') {
              return origGetImageData.apply(fakecanvas.getContext('2d'), [
                Math.floor(Math.random() * fakewidth) + 1,
                Math.floor(Math.random() * fakeheight) + 1,
                Math.floor(Math.random() * fakewidth) + 1,
                Math.floor(Math.random() * fakeheight) + 1,
              ]);
            }
          };
          var origGetLineDash = canvas_b.prototype.getLineDash;
          canvas_b.prototype.getLineDash = function () {
            fakecanvas.title = 'getLineDash';
            document.documentElement.appendChild(fakecanvas);
            if (canvas == 'block') return undefined;
            else if (canvas == 'blank') {
              fakecanvas.width = this.canvas.width;
              fakecanvas.height = this.canvas.height;
              return origGetLineDash.apply(fakecanvas.getContext('2d'));
            } else if (canvas == 'random') {
              return origGetLineDash.apply(fakecanvas.getContext('2d'));
            }
          };
          var canvas_c = scope.WebGLRenderingContext;
          var origReadPixels = canvas_c.prototype.readPixels;
          canvas_c.prototype.readPixels = function (...args) {
            fakecanvas.title = 'readPixels';
            document.documentElement.appendChild(fakecanvas);
            if (canvas == 'block') return false;
            else if (canvas == 'blank') {
              fakecanvas.width = this.canvas.width;
              fakecanvas.height = this.canvas.height;
              return origReadPixels.apply(fakecanvas.getContext('webgl'), args);
            } else if (canvas == 'random') {
              return origReadPixels.apply(fakecanvas.getContext('webgl'), [
                Math.floor(Math.random() * fakewidth) + 1,
                Math.floor(Math.random() * fakeheight) + 1,
                Math.floor(Math.random() * fakewidth) + 1,
                Math.floor(Math.random() * fakeheight) + 1,
                args[4],
                args[5],
                args[6],
              ]);
            }
          };
        }
        /* Audio Block */
        if (audioblock == 'true') {
          var audioblock_triggerblock = scope.document.createElement('div');
          audioblock_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_audio';
          var audioblock_a = scope.AudioBuffer;
          audioblock_a.prototype.copyFromChannel = function () {
            audioblock_triggerblock.title = 'copyFromChannel';
            document.documentElement.appendChild(audioblock_triggerblock);
            return false;
          };
          audioblock_a.prototype.getChannelData = function () {
            audioblock_triggerblock.title = 'getChannelData';
            document.documentElement.appendChild(audioblock_triggerblock);
            return Float32Array.of();
          };
          var audioblock_b = scope.AnalyserNode;
          audioblock_b.prototype.getFloatFrequencyData = function () {
            audioblock_triggerblock.title = 'getFloatFrequencyData';
            document.documentElement.appendChild(audioblock_triggerblock);
            return false;
          };
          audioblock_b.prototype.getByteFrequencyData = function () {
            audioblock_triggerblock.title = 'getByteFrequencyData';
            document.documentElement.appendChild(audioblock_triggerblock);
            return false;
          };
          audioblock_b.prototype.getFloatTimeDomainData = function () {
            audioblock_triggerblock.title = 'getFloatTimeDomainData';
            document.documentElement.appendChild(audioblock_triggerblock);
            return false;
          };
          audioblock_b.prototype.getByteTimeDomainData = function () {
            audioblock_triggerblock.title = 'getByteTimeDomainData';
            document.documentElement.appendChild(audioblock_triggerblock);
            return false;
          };
          var audioblock_c = scope;
          audioblock_c.AudioContext = function () {
            audioblock_triggerblock.title = 'AudioContext';
            document.documentElement.appendChild(audioblock_triggerblock);
            return false;
          } as unknown as typeof AudioContext;
          //@ts-ignore
          audioblock_c.webkitAudioContext = function () {
            audioblock_triggerblock.title = 'webkitAudioContext';
            document.documentElement.appendChild(audioblock_triggerblock);
            return false;
          };
        }
        /* Canvas Font */
        if (canvasfont == 'true') {
          var canvasfont_triggerblock = scope.document.createElement('div');
          canvasfont_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvasfont';
          var canvasfont_a = scope.CanvasRenderingContext2D;
          canvasfont_a.prototype.measureText = function () {
            canvasfont_triggerblock.title = 'measureText';
            document.documentElement.appendChild(canvasfont_triggerblock);
            return undefined;
          };
        }
        /* Battery */
        if (battery == 'true') {
          var battery_triggerblock = scope.document.createElement('div');
          battery_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_battery';
          var battery_a = scope.navigator;
          //@ts-ignore
          battery_a.getBattery = function () {
            battery_triggerblock.title = 'getBattery';
            document.documentElement.appendChild(battery_triggerblock);
            return undefined;
          };
        }
        /* WebGL */
        if (webgl == 'true') {
          var webgl_triggerblock = scope.document.createElement('div');
          webgl_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webgl';
          var webgl_a = scope.HTMLCanvasElement;
          var origGetContext = webgl_a.prototype.getContext;
          webgl_a.prototype.getContext = function (
            this: HTMLCanvasElement,
            ...args
          ) {
            if (args[0].match(/webgl/i)) {
              webgl_triggerblock.title = 'getContext';
              document.documentElement.appendChild(webgl_triggerblock);
              return undefined;
            }
            return origGetContext.apply(this, args);
          } as HTMLCanvasElement['getContext'];
        }
        /* WebRTC */
        if (webrtcdevice == 'true') {
          var webrtc_triggerblock = scope.document.createElement('div');
          webrtc_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webrtc';
          var webrtc_a = scope.MediaStreamTrack;
          ///@ts-ignore
          webrtc_a.getSources = function () {
            webrtc_triggerblock.title = 'getSources';
            document.documentElement.appendChild(webrtc_triggerblock);
            return false;
          };
          ///@ts-ignore
          webrtc_a.getMediaDevices = function () {
            webrtc_triggerblock.title = 'getMediaDevices';
            document.documentElement.appendChild(webrtc_triggerblock);
            return false;
          };
          var webrtc_b = scope.navigator.mediaDevices;
          webrtc_b.enumerateDevices = function () {
            webrtc_triggerblock.title = 'enumerateDevices';
            document.documentElement.appendChild(webrtc_triggerblock);
            return undefined;
          };
        }
        /* Gamepad */
        if (gamepad == 'true') {
          var gamepad_triggerblock = scope.document.createElement('div');
          gamepad_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_gamepad';
          var gamepad_a = scope.navigator;
          gamepad_a.getGamepads = function () {
            gamepad_triggerblock.title = 'getGamepads';
            document.documentElement.appendChild(gamepad_triggerblock);
            return undefined;
          };
        }
        /* WebVR */
        if (webvr == 'true') {
          var webvr_triggerblock = scope.document.createElement('div');
          webvr_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webvr';
          var webvr_a = scope.navigator;
          ///@ts-ignore
          webvr_a.getVRDisplays = function () {
            webvr_triggerblock.title = 'getVRDisplays';
            document.documentElement.appendChild(webvr_triggerblock);
            return false;
          };
        }
        /* Bluetooth */
        if (bluetooth == 'true') {
          ///@ts-ignore
          if (scope.navigator.bluetooth) {
            var bluetooth_triggerblock = scope.document.createElement('div');
            bluetooth_triggerblock.className =
              'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_bluetooth';
            ///@ts-ignore
            var bluetooth_a = scope.navigator.bluetooth;
            bluetooth_a.requestDevice = function () {
              bluetooth_triggerblock.title = 'requestDevice';
              document.documentElement.appendChild(bluetooth_triggerblock);
              return false;
            };
          }
        }
        /* Client Rectangles */
        if (clientrects == 'true') {
          var clientrects_triggerblock = scope.document.createElement('div');
          clientrects_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_clientrects';
          Element.prototype.getClientRects = function () {
            clientrects_triggerblock.title = 'getClientRects';
            document.documentElement.appendChild(clientrects_triggerblock);
            return new FakeDOMRectList(new DOMRect());
          };
        }
        /* Timezone */
        if (timezone != 'false') {
          var timezone_triggerblock = scope.document.createElement('div');
          timezone_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_timezone';
          var timezone_a = scope.Date;
          timezone_a.prototype.getTimezoneOffset = function () {
            timezone_triggerblock.title = 'getTimezoneOffset';
            document.documentElement.appendChild(timezone_triggerblock);
            if (timezone == 'random')
              return [
                720, 660, 600, 570, 540, 480, 420, 360, 300, 240, 210, 180, 120,
                60, 0, -60, -120, -180, -210, -240, -270, -300, -330, -345,
                -360, -390, -420, -480, -510, -525, -540, -570, -600, -630,
                -660, -720, -765, -780, -840,
              ][Math.floor(Math.random() * 39)];
            return Number(timezone);
          };
        }
        /* Clipboard */
        if (clipboard == 'true') {
          var clipboard_triggerblock = scope.document.createElement('div');
          clipboard_triggerblock.className =
            'scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_clipboard';
          var clipboard_a = document;
          var origExecCommand = clipboard_a.execCommand;
          clipboard_a.execCommand = function (
            commandId: string,
            showUI?: boolean,
            value?: string,
          ) {
            clipboard_triggerblock.title = 'execCommand';
            document.documentElement.appendChild(clipboard_triggerblock);
            if (commandId == 'cut' || commandId == 'copy') return false;
            return origExecCommand.apply(this, [commandId, showUI, value]);
          };
        }
      }
      processFunctions(window);
      //@ts-ignore
      var iwin = HTMLIFrameElement.prototype.__lookupGetter__('contentWindow'),
        //@ts-ignore
        idoc = HTMLIFrameElement.prototype.__lookupGetter__('contentDocument');
      Object.defineProperties(HTMLIFrameElement.prototype, {
        contentWindow: {
          get: function () {
            var frame = iwin.apply(this);
            if (
              this.src &&
              this.src.indexOf('//') != -1 &&
              location.host != this.src.split('/')[2]
            )
              return frame;
            try {
              frame.HTMLCanvasElement;
            } catch (err) {
              /* do nothing*/
            }
            processFunctions(frame);
            return frame;
          },
        },
        contentDocument: {
          get: function () {
            if (
              this.src &&
              this.src.indexOf('//') != -1 &&
              location.host != this.src.split('/')[2]
            )
              return idoc.apply(this);
            var frame = iwin.apply(this);
            try {
              frame.HTMLCanvasElement;
            } catch (err) {
              /* do nothing*/
            }
            processFunctions(frame);
            return idoc.apply(this);
          },
        },
      });
    },
    "'" +
      SETTINGS['CANVAS'] +
      "','" +
      SETTINGS['CANVASFONT'] +
      "','" +
      SETTINGS['AUDIOBLOCK'] +
      "','" +
      SETTINGS['BATTERY'] +
      "','" +
      SETTINGS['WEBGL'] +
      "','" +
      SETTINGS['WEBRTCDEVICE'] +
      "','" +
      SETTINGS['GAMEPAD'] +
      "','" +
      SETTINGS['WEBVR'] +
      "','" +
      SETTINGS['BLUETOOTH'] +
      "','" +
      SETTINGS['TIMEZONE'] +
      "','" +
      SETTINGS['CLIENTRECTS'] +
      "','" +
      SETTINGS['CLIPBOARD'] +
      "', '" +
      SETTINGS['BROWSERPLUGINS'] +
      "'",
  );
}

function clipboardProtect(el: Window | Document) {
  var arr = [
    'copy',
    'cut',
    'paste',
    'selectstart',
    'contextmenu',
    'mousedown',
    'mouseup',
  ] as const;

  type OnEvent = `on${(typeof arr)[number]}`;

  for (var i = 0; i < arr.length; i++) {
    const onEventKey = ('on' + arr[i]) as OnEvent;
    if (el[onEventKey]) el[onEventKey] = null;
    el.addEventListener(
      arr[i],
      function (e) {
        if (!clipboard) {
          clipboard = true;
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: window.location.href + ' (' + e.type + '())',
            node: 'Clipboard Interference',
          } satisfies UpdateBlockedRequest);
        }
        e.stopPropagation();
      },
      true,
    );
  }
}

function loaded() {
  ScriptSafe();
  new MutationObserver(ScriptSafe).observe(document.querySelector('body'), {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  });
}

function ScriptSafe() {
  if (
    SETTINGS['LINKTARGET'] != 'off' ||
    SETTINGS['DATAURL'] == 'true' ||
    SETTINGS['REFERRER'] == 'alldomains' ||
    (SETTINGS['REFERRER'] == 'true' &&
      (SETTINGS['DOMAINSTATUS'] != 0 ||
        SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))
  ) {
    $('a[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      var attr: JQuery.PlainObject = {};
      if (
        (SETTINGS['REFERRER'] == 'alldomains' ||
          (SETTINGS['REFERRER'] == 'true' &&
            (SETTINGS['DOMAINSTATUS'] != 0 ||
              SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))) &&
        thirdParty(elSrc)
      )
        attr['rel'] = 'noreferrer';
      if (SETTINGS['LINKTARGET'] != 'off') {
        if ($(this).attr('target') != linktrgt) attr['target'] = linktrgt;
      }
      if (SETTINGS['DATAURL'] == 'true' && elSrc.match(/^\s*data:text\//i)) {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: $(this).attr('href'),
          node: 'Data URL',
        } satisfies UpdateBlockedRequest);
        attr['target'] = '';
        attr['href'] =
          'data:text/html,<h1>This data:text/html link has been sanitized by ScriptSafe.</h1><p>Original link:<br><strong>' +
          $(this)
            .attr('href')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/^\s*data:text/i, 'data-SCRIPTSAFE:text') +
          '</strong></p><p>If you would like to still load it (not recommended), copy and paste the above string into your address bar and remove "-SCRIPTSAFE" which is inserted as a safeguard.</p><p><a href="javascript:history.go(-1);">Go Back</a></p>';
      }
      attr['data-ss' + timestamp] = '1';
      $(this).attr(attr);
    });
  }
  if (SETTINGS['CANVAS'] != 'false') {
    $('canvas.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvas').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Canvas Fingerprint',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['CLIPBOARD'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_clipboard').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Clipboard Interference',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['CANVASFONT'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_canvasfont').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Canvas Font Access',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['AUDIOBLOCK'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_audio').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Audio Fingerprint',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['WEBGL'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webgl').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'WebGL Fingerprint',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['BATTERY'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_battery').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Battery Fingerprint',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['WEBRTCDEVICE'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webrtc').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Device Enumeration',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['GAMEPAD'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_gamepad').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Gamepad Enumeration',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['WEBVR'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_webvr').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'WebVR Enumeration',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['BLUETOOTH'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_bluetooth').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Bluetooth Enumeration',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['CLIENTRECTS'] == 'true') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_clientrects').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Client Rectangles',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['TIMEZONE'] != 'false') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_timezone').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Spoofed Timezone',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['BROWSERPLUGINS'] != 'false') {
    $('div.scriptsafe_oiigbmnaadbkfbmpbfijlflahbdbdgdf_browserplugins').each(
      function () {
        chrome.runtime.sendMessage({
          reqtype: 'update-blocked',
          src: window.location.href + ' (' + $(this).attr('title') + '())',
          node: 'Browser Plugins Enumeration',
        } satisfies UpdateBlockedRequest);
        $(this).remove();
      },
    );
  }
  if (SETTINGS['NOSCRIPT'] == 'true' && SETTINGS['LISTSTATUS'] == 'true') {
    $('noscript').each(function () {
      chrome.runtime.sendMessage({
        reqtype: 'update-blocked',
        src: $(this).html(),
        node: 'NOSCRIPT',
      } satisfies UpdateBlockedRequest);
      $(this).remove();
    });
  }
  if (SETTINGS['APPLET'] == 'true')
    $('applet[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = $(this).attr('code');
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'APPLET',
          } satisfies UpdateBlockedRequest);
          $(this).remove();
        } else {
          chrome.runtime.sendMessage({
            reqtype: 'update-allowed',
            src: elSrc,
            node: 'APPLET',
          } satisfies UpdateAllowedRequest);
          $(this).attr('data-ss' + timestamp, '1');
        }
      }
    });
  if (SETTINGS['VIDEO'] == 'true')
    $('video[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'VIDEO',
          } satisfies UpdateBlockedRequest);
          removeMedia($(this as HTMLVideoElement));
        } else {
          chrome.runtime.sendMessage({
            reqtype: 'update-allowed',
            src: elSrc,
            node: 'VIDEO',
          } satisfies UpdateAllowedRequest);
          $(this).attr('data-ss' + timestamp, '1');
        }
      }
    });
  if (SETTINGS['AUDIO'] == 'true')
    $('audio[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'AUDIO',
          } satisfies UpdateBlockedRequest);
          removeMedia($(this as HTMLAudioElement));
        } else {
          chrome.runtime.sendMessage({
            reqtype: 'update-allowed',
            src: elSrc,
            node: 'AUDIO',
          } satisfies UpdateAllowedRequest);
          $(this).attr('data-ss' + timestamp, '1');
        }
      }
    });
  if (SETTINGS['IFRAME'] == 'true')
    $('iframe[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'FRAME',
          } satisfies UpdateBlockedRequest);
          $(this).remove();
        } else {
          chrome.runtime.sendMessage({
            reqtype: 'update-allowed',
            src: elSrc,
            node: 'FRAME',
          } satisfies UpdateAllowedRequest);
          $(this).attr('data-ss' + timestamp, '1');
        }
      }
    });
  if (SETTINGS['OBJECT'] == 'true')
    $('object[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'OBJECT',
          } satisfies UpdateBlockedRequest);
          $(this).remove();
        } else {
          chrome.runtime.sendMessage({
            reqtype: 'update-allowed',
            src: elSrc,
            node: 'OBJECT',
          } satisfies UpdateAllowedRequest);
          $(this).attr('data-ss' + timestamp, '1');
        }
      }
    });
  if (SETTINGS['EMBED'] == 'true')
    $('embed[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'EMBED',
          } satisfies UpdateBlockedRequest);
          $(this).remove();
        } else {
          chrome.runtime.sendMessage({
            reqtype: 'update-allowed',
            src: elSrc,
            node: 'EMBED',
          } satisfies UpdateAllowedRequest);
          $(this).attr('data-ss' + timestamp, '1');
        }
      }
    });
  if (SETTINGS['IMAGE'] == 'true')
    $('picture[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'IMAGE',
          } satisfies UpdateBlockedRequest);
          $(this).remove();
        } else {
          chrome.runtime.sendMessage({
            reqtype: 'update-allowed',
            src: elSrc,
            node: 'IMAGE',
          } satisfies UpdateAllowedRequest);
          $(this).attr('data-ss' + timestamp, '1');
        }
      }
    });
  if (SETTINGS['IMAGE'] == 'true')
    $('img[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'IMAGE',
          } satisfies UpdateBlockedRequest);
          $(this).remove();
        } else {
          chrome.runtime.sendMessage({
            reqtype: 'update-allowed',
            src: elSrc,
            node: 'IMAGE',
          } satisfies UpdateAllowedRequest);
          $(this).attr('data-ss' + timestamp, '1');
        }
      }
    });
  /* Fallback Inline Script Handling */
  if (SETTINGS['SCRIPT'] == 'true' && SETTINGS['EXPERIMENTAL'] == 0) {
    clearUnloads();
    $('script[data-ss' + timestamp + "!='1']").each(function () {
      var elSrc = getElSrc(this);
      if (elSrc) {
        elSrc = relativeToAbsoluteUrl(elSrc);
        if (postLoadCheck(elSrc.toLowerCase())) {
          chrome.runtime.sendMessage({
            reqtype: 'update-blocked',
            src: elSrc,
            node: 'SCRIPT',
          } satisfies UpdateBlockedRequest);
          $(this).remove();
        } else {
          if (elSrc.substr(0, 4) == 'http') {
            chrome.runtime.sendMessage({
              reqtype: 'update-allowed',
              src: elSrc,
              node: 'SCRIPT',
            } satisfies UpdateAllowedRequest);
            $(this).attr('data-ss' + timestamp, '1');
          }
        }
      }
    });
    if (
      SETTINGS['PRESERVESAMEDOMAIN'] == 'false' ||
      SETTINGS['DOMAINSTATUS'] == 1
    ) {
      $("a[href^='javascript']").attr('href', 'javascript:;');
      $('[onClick]').removeAttr('onClick');
      $('[onAbort]').removeAttr('onAbort');
      $('[onBlur]').removeAttr('onBlur');
      $('[onChange]').removeAttr('onChange');
      $('[onDblClick]').removeAttr('onDblClick');
      $('[onDragDrop]').removeAttr('onDragDrop');
      $('[onError]').removeAttr('onError');
      $('[onFocus]').removeAttr('onFocus');
      $('[onKeyDown]').removeAttr('onKeyDown');
      $('[onKeyPress]').removeAttr('onKeyPress');
      $('[onKeyUp]').removeAttr('onKeyUp');
      $('[onLoad]').removeAttr('onLoad');
      $('[onMouseDown]').removeAttr('onMouseDown');
      $('[onMouseMove]').removeAttr('onMouseMove');
      $('[onMouseOut]').removeAttr('onMouseOut');
      $('[onMouseOver]').removeAttr('onMouseOver');
      $('[onMouseUp]').removeAttr('onMouseUp');
      $('[onMove]').removeAttr('onMove');
      $('[onReset]').removeAttr('onReset');
      $('[onResize]').removeAttr('onResize');
      $('[onSelect]').removeAttr('onSelect');
      $('[onSubmit]').removeAttr('onSubmit');
      $('[onUnload]').removeAttr('onUnload');
    }
  }
}

function postLoadCheck(elSrc: string) {
  if (elSrc.substring(0, 4) != 'http') return false;
  var domainCheckStatus;
  var thirdPartyCheck;
  var elementStatusCheck;
  var baddiesCheck = baddies(
    elSrc,
    SETTINGS['ANNOYANCESMODE'],
    SETTINGS['ANTISOCIAL'],
    2,
  );
  if (
    SETTINGS['DOMAINSTATUS'] == 1 ||
    (SETTINGS['MODE'] == 'block' &&
      SETTINGS['PARANOIA'] == 'true' &&
      SETTINGS['PRESERVESAMEDOMAIN'] == 'false')
  ) {
    elementStatusCheck = true;
    thirdPartyCheck = true;
  } else {
    domainCheckStatus = domainCheck(elSrc, 1);
    var elementDomain = extractDomainFromURL(elSrc);
    if (
      (domainCheckStatus == 0 &&
        !(
          SETTINGS['DOMAINSTATUS'] == -1 &&
          SETTINGS['MODE'] == 'block' &&
          SETTINGS['PARANOIA'] == 'true'
        )) ||
      (SETTINGS['PRESERVESAMEDOMAIN'] == 'strict' &&
        elementDomain == window.location.hostname)
    )
      thirdPartyCheck = false;
    else if (
      SETTINGS['PRESERVESAMEDOMAIN'] == 'strict' &&
      elementDomain != window.location.hostname
    )
      thirdPartyCheck = true;
    else thirdPartyCheck = thirdParty(elSrc);
    if (
      (SETTINGS['DOMAINSTATUS'] == -1 &&
        SETTINGS['MODE'] == 'block' &&
        SETTINGS['PARANOIA'] == 'true') ||
      (domainCheckStatus != 0 &&
        (domainCheckStatus == 1 ||
          (domainCheckStatus == -1 && SETTINGS['MODE'] == 'block'))) ||
      (SETTINGS['ANNOYANCES'] == 'true' &&
        (SETTINGS['ANNOYANCESMODE'] == 'strict' ||
          (SETTINGS['ANNOYANCESMODE'] == 'relaxed' &&
            domainCheckStatus != 0)) &&
        baddiesCheck == 1) ||
      (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == 2)
    )
      elementStatusCheck = true;
    else elementStatusCheck = false;
  }
  if (
    elementStatusCheck &&
    ((SETTINGS['PRESERVESAMEDOMAIN'] != 'false' &&
      (thirdPartyCheck || domainCheckStatus == 1 || baddiesCheck)) ||
      SETTINGS['PRESERVESAMEDOMAIN'] == 'false')
  )
    return true;
  return false;
}

function domainCheck(domain: string, req: 1 | 2): DomainCheckResult {
  if (!domain) return -1;
  if (req === undefined) {
    var baddiesCheck = baddies(
      domain,
      SETTINGS['ANNOYANCESMODE'],
      SETTINGS['ANTISOCIAL'],
    );
    if (
      (SETTINGS['ANNOYANCES'] == 'true' &&
        SETTINGS['ANNOYANCESMODE'] == 'strict' &&
        baddiesCheck == 1) ||
      (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == 2)
    )
      return 1;
  }
  var domainname = extractDomainFromURL(domain);
  if (req != 2) {
    if (
      SETTINGS['MODE'] == 'block' &&
      in_array(domainname, SETTINGS['WHITELISTSESSION'])
    )
      return 0;
    if (
      SETTINGS['MODE'] == 'allow' &&
      in_array(domainname, SETTINGS['BLACKLISTSESSION'])
    )
      return 1;
  }
  if (in_array(domainname, SETTINGS['WHITELIST'])) return 0;
  if (in_array(domainname, SETTINGS['BLACKLIST'])) return 1;
  if (req === undefined) {
    if (
      SETTINGS['ANNOYANCES'] == 'true' &&
      SETTINGS['ANNOYANCESMODE'] == 'relaxed' &&
      baddiesCheck
    )
      return 1;
  }
  return -1;
}

function relativeToAbsoluteUrl(url: string) {
  // credit: NotScripts
  if (!url || url.indexOf('://') != -1) return url;
  if (url[0] == '/' && url[1] == '/') return document.location.protocol + url;
  if (url[0] == '/')
    return document.location.protocol + '//' + window.location.hostname + url;
  var base = document.baseURI.match(/.+\//);
  if (!base) return document.baseURI + '/' + url;
  return base[0] + url;
}

function removeMedia($el: JQuery<HTMLAudioElement> | JQuery<HTMLVideoElement>) {
  $el[0].pause();
  $el[0].src = '';
  $el.children('source').prop('src', '');
  $el.trigger('load');
  //$el.hide();
  $el.remove().length = 0;
}

function getElSrc(el: HTMLElement): string {
  const reStartWProtocol = /^[^\.\/:]+:\/\//i; // credit: NotScripts
  switch (el.nodeName.toUpperCase()) {
    case 'PICTURE': {
      const plistSource = el.getElementsByTagName('source');
      for (var i = 0; i < plistSource.length; i++) {
        if (plistSource[i].srcset) return plistSource[i].srcset;
      }
      const plistImg = el.getElementsByTagName('img');
      for (var i = 0; i < plistImg.length; i++) {
        if (plistImg[i].src) return plistImg[i].src;
      }
      return window.location.href;
    }
    case 'AUDIO': {
      const audioElement = el as HTMLAudioElement;
      if (audioElement.src) {
        if (reStartWProtocol.test(audioElement.src)) return audioElement.src;
      }
      const plist = el.getElementsByTagName('source');
      for (var i = 0; i < plist.length; i++) {
        if (plist[i].src) return plist[i].src;
      }
      return window.location.href;
    }
    case 'VIDEO': {
      const videoElement = el as HTMLVideoElement;
      if (videoElement.src) {
        if (reStartWProtocol.test(videoElement.src)) return videoElement.src;
      }
      const plist = el.getElementsByTagName('source');
      for (var i = 0; i < plist.length; i++) {
        if (plist[i].src) return plist[i].src;
      }
      return window.location.href;
    }
    case 'OBJECT': {
      // credit: NotScripts
      const objectElement = el as HTMLObjectElement;
      if (objectElement.codeBase) codeBase = objectElement.codeBase;
      if (objectElement.data) {
        if (reStartWProtocol.test(objectElement.data))
          return objectElement.data;
        else return codeBase;
      }
      const plist = el.getElementsByTagName('param');
      for (let i = 0; i < plist.length; i++) {
        const paramName = plist[i].name.toLowerCase();
        if (
          paramName === 'movie' ||
          paramName === 'src' ||
          paramName === 'codebase' ||
          paramName === 'data'
        )
          return plist[i].value;
        else if (paramName === 'code' || paramName === 'url')
          return plist[i].value;
      }
      return window.location.href;
    }
    case 'EMBED': {
      // credit: NotScripts
      const embedElement = el as HTMLEmbedElement & {
        codeBase?: string;
        data?: string;
        code?: string;
      };

      var codeBase = window.location.href;
      if (embedElement.codeBase) codeBase = embedElement.codeBase;
      if (embedElement.src) {
        if (reStartWProtocol.test(embedElement.src)) return embedElement.src;
        else return codeBase;
      }
      if (embedElement.data) {
        if (reStartWProtocol.test(embedElement.data)) return embedElement.data;
        else return codeBase;
      }
      if (embedElement.code) {
        if (reStartWProtocol.test(embedElement.code)) return embedElement.code;
        else return codeBase;
      }
      return window.location.href;
    }
    case 'A': {
      const aElement = el as HTMLAnchorElement;
      return aElement.href;
    }
    default: {
      const unknownElement = el as { src?: string };
      return unknownElement.src;
    }
  }
}

function randomDelay() {
  var zzz = Date.now() + Math.floor(Math.random() * SETTINGS['KEYDELTA']);
  while (Date.now() < zzz) {}
}

function injectAnon(f: (...params: any[]) => void, val: string = undefined) {
  var script = document.createElement('script');
  val = val || '';
  script.type = 'text/javascript';
  script.textContent = '(' + f + ')(' + val + ');';
  document.documentElement.appendChild(script);
}

type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function
    ? T[K] extends null
      ? never
      : K
    : never;
}[keyof T];

/* Fallback Inline Script Handling (if Chrome doesn't support chrome.webRequest API) / */
function mitigate() {
  // credit: NotScripts
  injectAnon(function () {
    for (let i of Object.keys(window) as (keyof Window)[]) {
      try {
        var jsType = typeof window[i];
        switch (jsType) {
          case 'function': {
            const key = i as FunctionKeys<Window>;
            if (window[key] !== window.location) {
              if (window[key] === window.open)
                window[key] = function () {
                  return true;
                } as any;
              else if (window[key] === window.onbeforeunload)
                window.onbeforeunload = null;
              else if (window[key] === window.onunload) window.onunload = null;
              else
                window[key] = function () {
                  return '';
                } as any;
            }
            break;
          }
        }
      } catch (err) {}
    }
    for (let i of Object.keys(document) as (keyof Document)[]) {
      try {
        var jsType = typeof document[i];
        switch (jsType) {
          case 'function':
            document[i as FunctionKeys<Document>] = function () {
              return '';
            } as any;
            break;
        }
      } catch (err) {}
    }
    try {
      globalThis['eval'] = function () {
        return '';
      };
      //@ts-ignore
      unescape = function () {
        return '';
      };
      //@ts-ignore
      String = function () {
        return '';
      };
      //@ts-ignore
      parseInt = function () {
        return '';
      };
      //@ts-ignore
      parseFloat = function () {
        return '';
      };
      //@ts-ignore
      Number = function () {
        return '';
      };
      //@ts-ignore
      isNaN = function () {
        return '';
      };
      //@ts-ignore
      isFinite = function () {
        return '';
      };
      //@ts-ignore
      escape = function () {
        return '';
      };
      //@ts-ignore
      encodeURIComponent = function () {
        return '';
      };
      //@ts-ignore
      encodeURI = function () {
        return '';
      };
      //@ts-ignore
      decodeURIComponent = function () {
        return '';
      };
      //@ts-ignore
      decodeURI = function () {
        return '';
      };
      //@ts-ignore
      Array = function () {
        return '';
      };
      //@ts-ignore
      Boolean = function () {
        return '';
      };
      //@ts-ignore
      Date = function () {
        return '';
      };
      //@ts-ignore
      Math = function () {
        return '';
      };
      //@ts-ignore
      Number = function () {
        return '';
      };
      //@ts-ignore
      RegExp = function () {
        return '';
      };
      //@ts-ignore
      navigator = function () {
        return '';
      };
    } catch (err) {}
  });
}

function clearUnloads() {
  // credit: NotScripts
  clearTimeout(timer);
  var keepGoing = window.onbeforeunload || window.onunload;
  window.onbeforeunload = null;
  window.onunload = null;
  if (keepGoing)
    timer = setTimeout(function () {
      clearUnloads();
    }, 5000);
}

/* / Fallback Inline Script Handling */
/* Deprecated beforeload Handling / */
function saveBeforeloadEvent(e: Event) {
  savedBeforeloadEvents.push(e);
}

function block(event: any) {
  var el = event.target;
  var elSrc = getElSrc(el);
  if (!elSrc) return;
  var elType = el.nodeName.toUpperCase();
  if (
    !(
      elType == 'A' ||
      elType == 'IFRAME' ||
      elType == 'FRAME' ||
      (elType == 'SCRIPT' && SETTINGS['EXPERIMENTAL'] == 0) ||
      elType == 'EMBED' ||
      elType == 'OBJECT' ||
      elType == 'IMG'
    )
  )
    return;
  elSrc = elSrc.toLowerCase();
  var absoluteUrl = relativeToAbsoluteUrl(elSrc);
  if (absoluteUrl.substr(0, 4) != 'http') return;
  var thirdPartyCheck;
  var elementStatusCheck;
  var domainCheckStatus;
  var $el = $(el);
  var elWidth = Number($el.attr('width'));
  var elHeight = Number($el.attr('height'));
  var elStyle = $el.attr('style');
  var baddiesCheck = baddies(
    absoluteUrl,
    SETTINGS['ANNOYANCESMODE'],
    SETTINGS['ANTISOCIAL'],
  );
  if (
    SETTINGS['DOMAINSTATUS'] == 1 ||
    (SETTINGS['DOMAINSTATUS'] == -1 &&
      SETTINGS['MODE'] == 'block' &&
      SETTINGS['PARANOIA'] == 'true' &&
      SETTINGS['PRESERVESAMEDOMAIN'] == 'false')
  ) {
    elementStatusCheck = true;
    thirdPartyCheck = true;
    domainCheckStatus = '1';
  } else {
    domainCheckStatus = domainCheck(absoluteUrl, 1);
    var elementDomain = extractDomainFromURL(absoluteUrl);
    if (
      (domainCheckStatus == 0 &&
        !(
          SETTINGS['DOMAINSTATUS'] == -1 &&
          SETTINGS['MODE'] == 'block' &&
          SETTINGS['PARANOIA'] == 'true'
        )) ||
      (SETTINGS['PRESERVESAMEDOMAIN'] == 'strict' &&
        elementDomain == window.location.hostname)
    )
      thirdPartyCheck = false;
    else if (
      SETTINGS['PRESERVESAMEDOMAIN'] == 'strict' &&
      elementDomain != window.location.hostname
    )
      thirdPartyCheck = true;
    else thirdPartyCheck = thirdParty(absoluteUrl);
    if (
      (SETTINGS['DOMAINSTATUS'] == -1 &&
        SETTINGS['MODE'] == 'block' &&
        SETTINGS['PARANOIA'] == 'true') ||
      (domainCheckStatus != 0 &&
        (domainCheckStatus == 1 ||
          (domainCheckStatus == -1 && SETTINGS['MODE'] == 'block'))) ||
      (SETTINGS['ANNOYANCES'] == 'true' &&
        (SETTINGS['ANNOYANCESMODE'] == 'strict' ||
          (SETTINGS['ANNOYANCESMODE'] == 'relaxed' &&
            domainCheckStatus != 0)) &&
        baddiesCheck == 1) ||
      (SETTINGS['ANTISOCIAL'] == 'true' && baddiesCheck == 2)
    )
      elementStatusCheck = true;
    else elementStatusCheck = false;
  }
  if (
    elementStatusCheck &&
    ((((elType == 'IFRAME' && SETTINGS['IFRAME'] == 'true') ||
      (elType == 'FRAME' && SETTINGS['FRAME'] == 'true') ||
      (elType == 'EMBED' && SETTINGS['EMBED'] == 'true') ||
      (elType == 'OBJECT' && SETTINGS['OBJECT'] == 'true') ||
      (elType == 'SCRIPT' &&
        SETTINGS['SCRIPT'] == 'true' &&
        SETTINGS['EXPERIMENTAL'] == 0) ||
      (elType == 'VIDEO' && SETTINGS['VIDEO'] == 'true') ||
      (elType == 'AUDIO' && SETTINGS['AUDIO'] == 'true') ||
      (elType == 'IMG' && SETTINGS['IMAGE'] == 'true') ||
      (elType == 'A' &&
        (SETTINGS['REFERRER'] == 'alldomains' ||
          (SETTINGS['REFERRER'] == 'true' &&
            (SETTINGS['DOMAINSTATUS'] != 0 ||
              SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))))) &&
      ((SETTINGS['PRESERVESAMEDOMAIN'] != 'false' &&
        (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)) ||
        SETTINGS['PRESERVESAMEDOMAIN'] == 'false')) ||
      (SETTINGS['WEBBUGS'] == 'true' &&
        (elType == 'IMG' ||
          elType == 'IFRAME' ||
          elType == 'FRAME' ||
          elType == 'EMBED' ||
          elType == 'OBJECT') &&
        (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck) &&
        ((typeof elWidth !== 'undefined' &&
          elWidth <= 5 &&
          typeof elHeight !== 'undefined' &&
          elHeight <= 5) ||
          (typeof elStyle !== 'undefined' &&
            elStyle.match(
              /(.*?;\s*|^\s*?)(height|width)\s*?:\s*?[0-5]\D.*?;\s*(height|width)\s*?:\s*?[0-5]\D/i,
            )))) ||
      ((SETTINGS['REFERRER'] == 'alldomains' ||
        (SETTINGS['REFERRER'] == 'true' &&
          (SETTINGS['DOMAINSTATUS'] != 0 ||
            SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))) &&
        elType == 'A' &&
        (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)))
  ) {
    if (
      (SETTINGS['REFERRER'] == 'alldomains' ||
        (SETTINGS['REFERRER'] == 'true' &&
          (SETTINGS['DOMAINSTATUS'] != 0 ||
            SETTINGS['REFERRERSPOOFDENYWHITELISTED'] == 'true'))) &&
      elType == 'A' &&
      (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck)
    ) {
      $(el).attr('rel', 'noreferrer');
    } else {
      event.preventDefault();
      if (
        SETTINGS['WEBBUGS'] == 'true' &&
        (thirdPartyCheck || domainCheckStatus == '1' || baddiesCheck) &&
        (elType == 'IFRAME' ||
          elType == 'FRAME' ||
          elType == 'EMBED' ||
          elType == 'OBJECT' ||
          elType == 'IMG') &&
        ((typeof elWidth !== 'undefined' &&
          elWidth <= 5 &&
          typeof elHeight !== 'undefined' &&
          elHeight <= 5) ||
          (typeof elStyle !== 'undefined' &&
            elStyle.match(
              /(.*?;\s*|^\s*?)(height|width)\s*?:\s*?[0-5]\D.*?;\s*(height|width)\s*?:\s*?[0-5]\D/i,
            )))
      ) {
        elType = 'WEBBUG';
      }
      chrome.runtime.sendMessage({
        reqtype: 'update-blocked',
        src: absoluteUrl,
        node: elType,
      } satisfies UpdateBlockedRequest);
      if (elType == 'VIDEO' || elType == 'AUDIO') removeMedia($el);
      else $(el).remove();
    }
  } else {
    if (
      SETTINGS['EXPERIMENTAL'] == 0 &&
      (elType == 'IFRAME' ||
        elType == 'FRAME' ||
        elType == 'EMBED' ||
        elType == 'OBJECT' ||
        elType == 'SCRIPT')
    ) {
      chrome.runtime.sendMessage({
        reqtype: 'update-allowed',
        src: absoluteUrl,
        node: elType,
      } satisfies UpdateAllowedRequest);
    }
  }
}

/* / Deprecated beforeload Handling */
