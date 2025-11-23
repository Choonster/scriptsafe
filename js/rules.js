const wildcardPrefix = '**.';

const whitelistPriority = 1500;
const blacklistPriority = 1000;
const fallbackPriority = 500;

let ruleId = 0;

function nextId() {
  return ++ruleId;
}

/**
 * @param {string[]} whitelist
 * @param {string[]} blacklist
 * @param {string[] | undefined} sessionWhitelist
 * @param {string[] | undefined} sessionBlacklist
 */
async function updateDynamicRules(
  whitelist,
  blacklist,
  sessionWhitelist = [],
  sessionBlacklist = [],
) {
  /**
   * @type {AsyncFunc0<chrome.declarativeNetRequest.Rule[]>}
   */
  const getDynamicRules = promisify0(
    chrome.declarativeNetRequest.getDynamicRules,
  );

  const oldRules = await getDynamicRules();
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

  await promisify1(chrome.declarativeNetRequest.updateDynamicRules)({
    removeRuleIds: oldRuleIds,
    addRules: newRules,
  });

  if (chrome.runtime.lastError) {
    console.error(
      'Failed to update dynamic rules: %o',
      chrome.runtime.lastError,
    );
  } else {
    const enabledRules = await getDynamicRules();
    console.log('Updated dynamic rules. New rules: %o', enabledRules);
  }
}

/**
 * @param {string[]} whitelist
 * @param {string[]} blacklist
 * @param {string[]} sessionWhitelist
 * @param {string[]} sessionBlacklist
 * @returns {chrome.declarativeNetRequest.Rule[]}
 */
function buildDynamicRules(
  whitelist,
  blacklist,
  sessionWhitelist,
  sessionBlacklist,
) {
  /** @type {chrome.declarativeNetRequest.Rule[]} */
  const rules = [];

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

/**
 * @param {chrome.declarativeNetRequest.Rule[]} rules
 * @param {string[]} whitelist
 * @param {string[]} blacklist
 */
function addWhitelistRules(rules, whitelist, blacklist) {
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

/**
 * @param {chrome.declarativeNetRequest.Rule[]} rules
 * @param {string[]} blacklist
 */
function addBlacklistRules(rules, blacklist) {
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
 * @param {string} domain The domain
 * @returns The URL filter pattern
 */
function convertToUrlFilterPattern(domain) {
  const pattern = domain.startsWith(wildcardPrefix)
    ? `||${domain.substring(wildcardPrefix.length)}/`
    : `||${domain}/`; // TODO: This probably matches https://test.example.com where we only want to match https://example.com
  return pattern;
}

/**
 * Converts a domain the format `example.com` or `**.example.com` to an initiator domain suitable for use in
 * {@link chrome.declarativeNetRequest.RuleCondition.initiatorDomains} or {@link chrome.declarativeNetRequest.RuleCondition.excludedInitiatorDomains}.
 *
 * @param {string} domain The domain
 * @returns The initiator domain
 */
function convertToInitiatorDomain(domain) {
  const initiatorDomain = domain.startsWith(wildcardPrefix)
    ? domain.substring(wildcardPrefix.length)
    : domain;

  return initiatorDomain;
}
