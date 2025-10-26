declare type GetSettingsRequest = {
  reqtype: 'get-settings';
  iframe: NumericBool;
};

declare type GetSettingsResponse = {
  status: Settings['enable'];
  enable: StringBool;
  fp_canvas: FingerprintEnabledType;
  fp_canvasfont: FingerprintEnabledType;
  fp_audio: FingerprintEnabledType;
  fp_webgl: FingerprintEnabledType;
  fp_battery: FingerprintEnabledType;
  fp_device: FingerprintEnabledType;
  fp_gamepad: FingerprintEnabledType;
  fp_webvr: FingerprintEnabledType;
  fp_bluetooth: FingerprintEnabledType;
  fp_clientrectangles: FingerprintEnabledType;
  fp_clipboard: FingerprintEnabledType;
  fp_browserplugins: FingerprintEnabledType;
  experimental: NumericBool;
  mode: Settings['mode'];
  annoyancesmode: Settings['annoyancesmode'];
  antisocial: Settings['antisocial'];
  whitelist: string[];
  blacklist: string[];
  whitelistSession: string[];
  blackListSession: string[];
  script: Settings['script'];
  noscript: Settings['noscript'];
  object: Settings['object'];
  applet: Settings['applet'];
  embed: Settings['embed'];
  iframe: Settings['iframe'];
  frame: Settings['frame'];
  audio: Settings['audio'];
  video: Settings['video'];
  image: Settings['image'];
  annoyances: Settings['annoyances'];
  preservesamedomain: Settings['preservesamedomain'];
  canvas: Settings['canvas'];
  canvasfont: Settings['canvasfont'];
  audioblock: Settings['audioblock'];
  webgl: Settings['webgl'];
  battery: Settings['battery'];
  webrtcdevice: Settings['webrtcdevice'];
  gamepad: Settings['gamepad'];
  webvr: Settings['webvr'];
  bluetooth: Settings['bluetooth'];
  clientrects: Settings['clientrects'];
  timezone: Settings['timezone'];
  browserplugins: Settings['browserplugins'];
  keyboard: Settings['keyboard'];
  keydelta: Settings['keydelta'];
  webbugs: Settings['webbugs'];
  referrer: Settings['referrer'];
  referrerspoofdenywhitelisted: Settings['referrerspoofdenywhitelisted'];
  linktarget: Settings['linktarget'];
  paranoia: Settings['paranoia'];
  clipboard: Settings['clipboard'];
  dataurl: Settings['dataurl'];
  useragent: string;
  uaspoofallow: Settings['uaspoofallow'];
};

declare type GetListRequest = {
  reqtype: 'get-list';
  url: string;
  tid: number;
};

declare type GetListResponse =
  | 'reload'
  | {
      status: StringBool;
      enable: EnableValue;
      mode: Mode;
      annoyancesmode: AnnoyancesMode;
      antisocial: StringBool;
      annoyances: StringBool;
      closepage: StringBool;
      rating: StringBool;
      temp: string[];
      tempfp: boolean;
      blockeditems: ItemsEntry['blocked'];
      alloweditems: ItemsEntry['allowed'];
      domainsort: StringBool;
    };

declare type UpdateBlockedRequest = {
  reqtype: 'update-blocked';
  src: string;
  node: BlockedNode;
};

declare type UpdateAllowedRequest = {
  reqtype: 'update-allowed';
  src: string;
  node: BlockedNode;
};

declare type SaveRequest = {
  reqtype: 'save';
  url: string;
  list: HandlerAction;
};

declare type TempRequest = {
  reqtype: 'temp';
  url: string | string[];
  mode: Mode;
};

declare type RemoveTempRequest = {
  reqtype: 'remove-temp';
  url: string | string[];
};

declare type SaveFingerprintRequest = {
  reqtype: 'save-fp';
  url: string;
  list: FingerprintType;
};

declare type TempFingerprintRequest = {
  reqtype: 'temp-fp';
  url: string;
  list: FingerprintType;
};

declare type RemoveTempFingerprintRequest = {
  reqtype: 'remove-temp-fp';
  url: string;
  list: FingerprintType;
};

declare type RefreshPageIconRequest = {
  reqtype: 'refresh-page-icon';
  type: 0 | 1 | 2;
  tid: number;
};

declare type MessageRequest =
  | GetSettingsRequest
  | GetListRequest
  | UpdateBlockedRequest
  | UpdateAllowedRequest
  | SaveRequest
  | TempRequest
  | RemoveTempRequest
  | SaveFingerprintRequest
  | TempFingerprintRequest
  | RemoveTempFingerprintRequest
  | RefreshPageIconRequest;

declare type MessageResponseLookup = {
  'get-settings': GetSettingsResponse;
  'get-list': GetListResponse;
  temp: unknown;
  'remove-temp': unknown;
};

declare type SendResponseCallback<T extends MessageRequest> =
  T['reqtype'] extends keyof MessageResponseLookup
    ? (response: MessageResponseLookup[T['reqtype']]) => void
    : never;
