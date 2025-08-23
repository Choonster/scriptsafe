declare type WebRequestEventHandler<
  E extends chrome.webRequest.WebRequestEvent<unknown, unknown>,
> = Parameters<E['addListener']>[0];

declare type NumericBool = 1 | 0;

declare type StringBool = 'true' | 'false';

declare type FingerprintEnabledType = -1 | 1 | 2;

declare type FingerprintType =
  | 'fpCanvas'
  | 'fpCanvasFont'
  | 'fpAudio'
  | 'fpWebGL'
  | 'fpBattery'
  | 'fpDevice'
  | 'fpGamepad'
  | 'fpWebVR'
  | 'fpBluetooth'
  | 'fpClientRectangles'
  | 'fpClipboard'
  | 'fpBrowserPlugins';

declare type FingerprintDescription =
  | 'Canvas Fingerprint'
  | 'Canvas Font Access'
  | 'Audio Fingerprint'
  | 'WebGL Fingerprint'
  | 'Battery Fingerprint'
  | 'Device Enumeration'
  | 'Gamepad Enumeration'
  | 'WebVR Enumeration'
  | 'Bluetooth Enumeration'
  | 'Client Rectangles'
  | 'Clipboard Interference'
  | 'Browser Plugins Enumeration';

declare type WebRequestType =
  | chrome.webRequest.OnBeforeRequestDetails['type']
  | 'frame'
  | 'page'
  | 'webbug';

declare type WebRequestTypeUpper = Uppercase<WebRequestType>;

declare type DomainCheckResult = -1 | 0 | 1;
declare type EnableValue = DomainCheckResult | 3 | 4;
declare type BaddiesResult = 1 | 2 | false;

declare type AnnoyancesMode = 'strict' | 'relaxed';

declare type Mode = 'allow' | 'block';

declare type WebRtcMode =
  | 'default_public_interface_only'
  | 'disable_non_proxied_udp';

declare type LinkTargetMode = 'off' | 'same' | 'new';

declare type UserAgentInterval = 'off' | 'interval' | 'request';

declare type ReferrerSpoofMode = 'off' | 'same' | 'domain' | 'custom';

declare type Settings = {
  version: string;
  sync: StringBool;
  syncenable: StringBool;
  syncnotify: StringBool;
  syncfromnotify: StringBool;
  lastSync: number;
  updatenotify: StringBool;
  enable: StringBool;
  mode: Mode;
  refresh: StringBool;
  script: StringBool;
  noscript: StringBool;
  object: StringBool;
  applet;
  embed: StringBool;
  iframe: StringBool;
  frame: StringBool;
  audio: StringBool;
  video: StringBool;
  image: StringBool;
  showcontext: StringBool;
  canvas: StringBool;
  canvasfont: StringBool;
  clientrects: StringBool;
  audioblock: StringBool;
  webgl: StringBool;
  battery: StringBool;
  webrtcdevice: StringBool;
  gamepad: StringBool;
  webvr: StringBool;
  bluetooth: StringBool;
  timezone: StringBool;
  keyboard: StringBool;
  keydelta: number;
  xml: StringBool;
  annoyances: StringBool;
  annoyancesmode: AnnoyancesMode;
  antisocial: StringBool;
  preservesamedomain: StringBool;
  webbugs: StringBool;
  utm: StringBool;
  hashchecking: StringBool;
  hashallow: StringBool;
  webrtc: WebRtcMode;
  classicoptions: StringBool;
  rating: StringBool;
  referrer: StringBool;
  linktarget: LinkTargetMode;
  domainsort: StringBool;
  useragentspoof: string; // TODO: Replace with union if needed
  useragentspoof_os: string;
  useragentinterval: UserAgentInterval;
  useragentintervalmins: number;
  uaspoofallow: StringBool;
  referrerspoof: ReferrerSpoofMode;
  referrerspoofdenywhitelisted: StringBool;
  cookies: StringBool;
  paranoia: StringBool;
  dataurl: StringBool;
  clipboard: StringBool;
  optionslist: StringBool;
  browserplugins: StringBool;
};

declare type Setting = keyof Settings;

declare type ItemsEntry = {
  length: 1;
  allowed?: [
    string,
    WebRequestTypeUpper | BlockedNode,
    string,
    FingerprintEnabledType | DomainCheckResult,
    DomainCheckResult | BaddiesResult,
    true?,
  ][];
  blocked?: [
    string,
    string,
    string,
    DomainCheckResult,
    DomainCheckResult,
    BaddiesResult,
    boolean,
  ][];
} & [number];

declare type BlockedNode =
  | 'NOSCRIPT'
  | 'APPLET'
  | 'VIDEO'
  | 'AUDIO'
  | 'FRAME'
  | 'OBJECT'
  | 'EMBED'
  | 'IMAGE'
  | 'SCRIPT'
  | 'Data URL'
  | 'Spoofed Timezone'
  | FingerprintDescription;

declare type AllowedRecentLogEntry = [
  number,
  string,
  WebRequestTypeUpper | BlockedNode,
  string,
  string,
  DomainCheckResult | FingerprintEnabledType,
  BaddiesResult | 0,
  boolean?,
];

declare type BlockedRecentLogEntry = [
  number,
  string,
  WebRequestTypeUpper | BlockedNode,
  string,
  string,
  DomainCheckResult,
  DomainCheckResult,
  BaddiesResult,
  boolean,
];

declare type RecentLog = {
  allowed: AllowedRecentLogEntry[];
  blocked: BlockedRecentLogEntry[];
};

declare type RecentList = keyof RecentLog;

// TODO: Fill in types
declare type HostsEntry = [
  unknown,
  unknown,
  string,
  unknown,
  unknown,
  unknown,
  unknown,
];

declare type SplitHostsEntry = [
  string,
  HostsEntry[0],
  HostsEntry[1]?,
  HostsEntry[2]?,
  HostsEntry[3]?,
  HostsEntry[4]?,
  HostsEntry[5]?,
  HostsEntry[6]?,
];

declare type HostsList = HostsEntry[];

// TODO: string[] may be inaccurate
declare type HostsOrStringList = HostsList | string[];

declare type HandlerAction = -1 | 0 | 1 | 2;

declare type ListType = 'whiteList' | 'blackList' | 'useragent';

type ListTypeCount = `${ListType}Count` | `${ListType}Count2`;

declare type OptionName =
  | Setting
  | FingerprintType
  | 'updatemessagenotify'
  | 'useragentcustom'
  | ListType
  | ListTypeCount
  | 'fpCount'
  | 'locale'
  | 'tempregexflag';

declare interface Window {
  freshSync(force?: boolean): Promise<boolean>;
}
