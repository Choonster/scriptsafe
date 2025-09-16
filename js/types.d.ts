declare type WebRequestEventHandler<
  E extends chrome.webRequest.WebRequestEvent<
    (...args: unknown[]) => void,
    string[]
  >,
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

declare type ItemsEntryKey = 'allowed' | 'blocked';

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

/*
 * - 0 = time
 * - 1 = request url
 * - 2 = type
 * - 3 = extracted request domain
 * - 4 = full tab url
 * - 5 = request domain list
 * - 6 = baddiesCheck
 * - 7 = fingerprint
 */
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

/**
 * - 0 = time
 * - 1 = request url
 * - 2 = type
 * - 3 = extracted request domain
 * - 4 = full tab url
 * - 5 = request domain check
 * - 6 = tab domain check
 * - 7 = baddiesCheck
 * - 8 = fingerprint or not
 */
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

declare type Langs = {
  en_US: string;
  en_GB: string;
  zh_CN: string;
  zh_TW: string;
  cs: string;
  nl: string;
  fr: string;
  de: string;
  hu: string;
  it: string;
  ja: string;
  ko: string;
  lv: string;
  pl: string;
  ro: string;
  ru: string;
  es: string;
  sv: string;
};

declare interface BackgroundWindow extends Window {
  freshSync(force?: boolean): Promise<boolean>;
  getRecents(list: RecentList): string;
  clearRecents(): void;
  getLocale(str: string): string;
  checkTemp(domain: string): false | 1;
  fpDomainHandler(
    domain: string,
    listtype: FingerprintType,
    action: HandlerAction,
    temp?: EnumListType,
  ): boolean;
  getDomain(url: string, type?: never): string;
  trustCheck(domain: string): false | 2 | 1;
  domainHandler(
    domain: string,
    action: HandlerAction,
    listtype?: EnumListType,
  ): boolean;
  topHandler(domain: string, mode: NumericBool | FingerprintType): boolean;
  getLangs(): Langs;
  getWebRTC(): boolean;
  refreshRequestTypes(): void;
  initWebRTC(): void;
  reinitContext(): void;
  initLang(lang: string, mode: NumericBool): void;
  cacheLists(): void;
  cacheFpLists(): void;
  domainCheck(domain: string, req?: 1 | 2): DomainCheckResult;
  baddies(
    src: string,
    amode: AnnoyancesMode,
    antisocial: StringBool,
    lookupmode?: 1 | 2,
  ): BaddiesResult;
  domainSort(hosts: string[]): string[];
  domainSort(hosts: HostsList): HostsList;
  getUpdated(): boolean;
  setUpdated(): void;
  setDefaultOptions(force?: 1 | 2): void;
  importSyncHandle(mode: NumericBool): boolean;
  triggerUpdated(): Promise<void>;
  extractDomainFromURL(url: string): string;
  statuschanger(duration: number): void;
  revokeTemp(): void;
  in_array(needle: string, haystack: string[]): false | 1;
}

declare type ContextMode =
  | 'allow'
  | 'block'
  | 'trust'
  | 'distrust'
  | 'allowtemp'
  | 'blocktemp'
  | 'clear'
  | 'toggle';

declare enum EnumListType {
  Permanent,
  Temporary,
}

declare type LocaleEntry = {
  description: string;
  message: string;
};

declare type Locale = Record<string, LocaleEntry>;
