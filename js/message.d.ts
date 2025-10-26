declare type GetSettingsRequest = {
  reqtype: 'get-settings';
  iframe: NumericBool;
};

declare type GetSettingsResponse = {
  status: StringBool;
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
  mode: Mode;
  annoyancesmode: AnnoyancesMode;
  antisocial: StringBool;
  whitelist: string[];
  blacklist: string[];
  whitelistSession: string[];
  blackListSession: string[];
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
  annoyances: StringBool;
  preservesamedomain: PreserveSameDomainMode;
  canvas: CanvasMode;
  canvasfont: StringBool;
  audioblock: StringBool;
  webgl: StringBool;
  battery: StringBool;
  webrtcdevice: StringBool;
  gamepad: StringBool;
  webvr: StringBool;
  bluetooth: StringBool;
  clientrects: StringBool;
  timezone: TimeZoneMode;
  browserplugins: StringBool;
  keyboard: StringBool;
  keydelta: number;
  webbugs: StringBool;
  referrer: ReferrerMode;
  referrerspoofdenywhitelisted: StringBool;
  linktarget: LinkTargetMode;
  paranoia: StringBool;
  clipboard: StringBool;
  dataurl: StringBool;
  useragent: string;
  uaspoofallow: StringBool;
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
      closepage: undefined;
      rating: undefined;
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
