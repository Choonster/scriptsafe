import { promisify0, promisify1 } from './common';

const wildcardPrefix = '**.';

const whitelistPriority = 1500;
const blacklistPriority = 1000;
const fallbackPriority = 500;

let ruleId = 0;

function nextId() {
  return ++ruleId;
}

const _getDynamicRules: AsyncFunc0<chrome.declarativeNetRequest.Rule[]> =
  promisify0(chrome.declarativeNetRequest.getDynamicRules);

const _updateDynamicRules = promisify1(
  chrome.declarativeNetRequest.updateDynamicRules,
);

export async function updateDynamicRules(
  whitelist: string[],
  blacklist: string[],
  sessionWhitelist: string[] | undefined = [],
  sessionBlacklist: string[] | undefined = [],
) {
  const oldRules = await _getDynamicRules();
  const oldRuleIds = oldRules?.map((rule) => rule.id) ?? [];

  const newRules = buildDynamicRules(
    whitelist,
    blacklist,
    sessionWhitelist,
    sessionBlacklist,
  );

  console.log(
    'Updating dynamic rules. Old rules: %o - New rules: %o',
    oldRules,
    newRules,
  );

  await _updateDynamicRules({
    removeRuleIds: oldRuleIds,
    addRules: newRules,
  });

  const enabledRules = await _getDynamicRules();
  console.log('Updated dynamic rules. New rules: %o', enabledRules);
}

function buildDynamicRules(
  whitelist: string[],
  blacklist: string[],
  sessionWhitelist: string[],
  sessionBlacklist: string[],
): chrome.declarativeNetRequest.Rule[] {
  const rules: chrome.declarativeNetRequest.Rule[] = [];

  const combinedWhitelist = whitelist.concat(sessionWhitelist);
  const combinedBlacklist = blacklist.concat(sessionBlacklist);

  addWhitelistRules(rules, combinedWhitelist, combinedBlacklist);

  addBlacklistRules(rules, combinedBlacklist);

  const mode = localStorage['mode'];

  rules.push({
    id: nextId(),
    priority: fallbackPriority,
    condition: {},
    action: {
      type: mode,
    },
  });

  return rules;
}

function addWhitelistRules(
  rules: chrome.declarativeNetRequest.Rule[],
  whitelist: string[],
  blacklist: string[],
) {
  const blacklistInitiatorDomains = blacklist.map(convertToInitiatorDomain);

  for (const domain of whitelist) {
    const pattern = convertToUrlFilterPattern(domain);

    rules.push({
      id: nextId(),
      priority: whitelistPriority,
      condition: {
        urlFilter: pattern,
        excludedInitiatorDomains: blacklistInitiatorDomains,
      },
      action: {
        type: 'allow',
      },
    });
  }
}

function addBlacklistRules(
  rules: chrome.declarativeNetRequest.Rule[],
  blacklist: string[],
) {
  for (const domain of blacklist) {
    const pattern = convertToUrlFilterPattern(domain);

    rules.push({
      id: nextId(),
      priority: blacklistPriority,
      condition: {
        urlFilter: pattern,
      },
      action: {
        type: 'block',
      },
    });
  }
}

/**
 * Converts a domain in the format `example.com` or `**.example.com` to a URL filter pattern suitable for use in
 * {@link chrome.declarativeNetRequest.RuleCondition.urlFilter}.
 *
 * @param domain The domain
 * @returns The URL filter pattern
 */
function convertToUrlFilterPattern(domain: string) {
  const pattern = domain.startsWith(wildcardPrefix)
    ? `||${domain.substring(wildcardPrefix.length)}/`
    : `||${domain}/`; // TODO: This probably matches https://test.example.com where we only want to match https://example.com
  return pattern;
}

/**
 * Converts a domain the format `example.com` or `**.example.com` to an initiator domain suitable for use in
 * {@link chrome.declarativeNetRequest.RuleCondition.initiatorDomains} or {@link chrome.declarativeNetRequest.RuleCondition.excludedInitiatorDomains}.
 *
 * @param domain The domain
 * @returns The initiator domain
 */
function convertToInitiatorDomain(domain: string) {
  const initiatorDomain = domain.startsWith(wildcardPrefix)
    ? domain.substring(wildcardPrefix.length)
    : domain;

  return initiatorDomain;
}
