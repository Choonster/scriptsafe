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

declare type CanvasMode = 'false' | 'blank' | 'random' | 'block';

declare type TimeZoneMode =
  | 'false'
  | 'random'
  | '720'
  | '660'
  | '600'
  | '570'
  | '540'
  | '480'
  | '420'
  | '360'
  | '300'
  | '240'
  | '210'
  | '180'
  | '120'
  | '60'
  | '0'
  | '-60'
  | '-120'
  | '-180'
  | '-210'
  | '-240'
  | '-270'
  | '-300'
  | '-330'
  | '-345'
  | '-360'
  | '-390'
  | '-420'
  | '-480'
  | '-510'
  | '-525'
  | '-540'
  | '-570'
  | '-600'
  | '-630'
  | '-660'
  | '-720'
  | '-765'
  | '-780'
  | '-840';

declare type XmlMode = StringBool | 'all';

declare type AnnoyancesMode = 'strict' | 'relaxed';

declare type Mode = 'allow' | 'block';

declare type WebRtcMode =
  | 'off'
  | 'default_public_interface_only'
  | 'disable_non_proxied_udp';

declare type LinkTargetMode = 'off' | 'same' | 'new';

declare type UserAgentInterval = 'off' | 'interval' | 'request';

declare type PreserveSameDomainMode = StringBool | 'strict';

declare type ReferrerMode = StringBool | 'alldomains';

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
  applet: StringBool;
  embed: StringBool;
  iframe: StringBool;
  frame: StringBool;
  audio: StringBool;
  video: StringBool;
  image: StringBool;
  showcontext: StringBool;
  canvas: CanvasMode;
  canvasfont: StringBool;
  clientrects: StringBool;
  audioblock: StringBool;
  webgl: StringBool;
  battery: StringBool;
  webrtcdevice: StringBool;
  gamepad: StringBool;
  webvr: StringBool;
  bluetooth: StringBool;
  timezone: TimeZoneMode;
  keyboard: StringBool;
  keydelta: number;
  xml: XmlMode;
  annoyances: StringBool;
  annoyancesmode: AnnoyancesMode;
  antisocial: StringBool;
  preservesamedomain: PreserveSameDomainMode;
  webbugs: StringBool;
  utm: StringBool;
  hashchecking: StringBool;
  hashallow: StringBool;
  webrtc: WebRtcMode;
  classicoptions: StringBool;
  rating: StringBool;
  referrer: ReferrerMode;
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

declare type StringSettings = {
  [Key in keyof Settings]: Settings[Key] extends string
    ? Settings[Key]
    : `${Settings[Key]}`;
};

// Add settings to localStorage
declare interface Storage extends StringSettings {}

declare type ContentScriptSettings = {
  MODE: GetSettingsResponse['mode'];
  LISTSTATUS: GetSettingsResponse['enable'];
  DOMAINSTATUS: DomainCheckResult;
  WHITELIST: GetSettingsResponse['whitelist'];
  BLACKLIST: GetSettingsResponse['blacklist'];
  WHITELISTSESSION: GetSettingsResponse['whitelistSession'];
  BLACKLISTSESSION: GetSettingsResponse['blackListSession'];
  SCRIPT: GetSettingsResponse['script'];
  NOSCRIPT: GetSettingsResponse['noscript'];
  OBJECT: GetSettingsResponse['object'];
  APPLET: GetSettingsResponse['applet'];
  EMBED: GetSettingsResponse['embed'];
  IFRAME: GetSettingsResponse['iframe'];
  FRAME: GetSettingsResponse['frame'];
  AUDIO: GetSettingsResponse['audio'];
  VIDEO: GetSettingsResponse['video'];
  IMAGE: GetSettingsResponse['image'];
  CANVAS: GetSettingsResponse['canvas'];
  CANVASFONT: GetSettingsResponse['canvasfont'];
  CLIENTRECTS: GetSettingsResponse['clientrects'];
  AUDIOBLOCK: GetSettingsResponse['audioblock'];
  BATTERY: GetSettingsResponse['battery'];
  WEBGL: GetSettingsResponse['webgl'];
  KEYBOARD: GetSettingsResponse['keyboard'];
  WEBRTCDEVICE: GetSettingsResponse['webrtcdevice'];
  GAMEPAD: GetSettingsResponse['gamepad'];
  WEBVR: GetSettingsResponse['webvr'];
  BLUETOOTH: GetSettingsResponse['bluetooth'];
  TIMEZONE: GetSettingsResponse['timezone'];
  ANNOYANCES: GetSettingsResponse['annoyances'];
  ANNOYANCESMODE: GetSettingsResponse['annoyancesmode'];
  ANTISOCIAL: GetSettingsResponse['antisocial'];
  PRESERVESAMEDOMAIN: GetSettingsResponse['preservesamedomain'];
  WEBBUGS: GetSettingsResponse['webbugs'];
  LINKTARGET: GetSettingsResponse['linktarget'];
  EXPERIMENTAL: GetSettingsResponse['experimental'];
  REFERRER: GetSettingsResponse['referrer'];
  REFERRERSPOOFDENYWHITELISTED: GetSettingsResponse['referrerspoofdenywhitelisted'];
  PARANOIA: GetSettingsResponse['paranoia'];
  CLIPBOARD: GetSettingsResponse['clipboard'];
  DATAURL: GetSettingsResponse['dataurl'];
  KEYDELTA: GetSettingsResponse['keydelta'];
  BROWSERPLUGINS: GetSettingsResponse['browserplugins'];
  USERAGENT: GetSettingsResponse['useragent'];
};

declare type AllowedEntry = [
  string,
  WebRequestTypeUpper | BlockedNode,
  string,
  FingerprintEnabledType | DomainCheckResult,
  BaddiesResult,
  true?,
];

declare type BlockedEntry = [
  string,
  WebRequestTypeUpper | BlockedNode,
  string,
  DomainCheckResult,
  DomainCheckResult,
  BaddiesResult,
  boolean,
];

declare type AllowedOrBlockedEntry = AllowedEntry | BlockedEntry;

declare type ItemsEntry = {
  allowed?: AllowedEntry[];
  blocked?: BlockedEntry[];
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

declare type SplitHostsEntry = [
  string,
  AllowedOrBlockedEntry[0],
  AllowedOrBlockedEntry[1],
  AllowedOrBlockedEntry[2],
  AllowedOrBlockedEntry[3],
  AllowedOrBlockedEntry[4],
  AllowedOrBlockedEntry[5],
  AllowedOrBlockedEntry[6],
];

declare type HostsEntry = [
  SplitHostsEntry[1],
  SplitHostsEntry[2],
  SplitHostsEntry[3],
  SplitHostsEntry[4],
  SplitHostsEntry[5],
  SplitHostsEntry[6],
  SplitHostsEntry[7],
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
  domainSort(hosts: AllowedEntry[] | BlockedEntry[]): HostsList;
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
