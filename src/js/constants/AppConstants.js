var AppConstants = {
  YEAR: "2016",
  SITENAME: "Action Potential",
  DESCRIPTION: "Ultra-light decision app for distributed teams (or anyone)",
  COMPANY: "Shore East",
  BASE_URL: "http://action-potential.appspot.com",
  USER_READ: 1,
  USER_RW: 2,
  USER_ACCOUNT_ADMIN: 3,
  USER_ADMIN: 4,
  USER_LABELS: [ "Read", "Read-Write", "Account Admin", "Admin" ],
  // Load statuses
  ST_NOT_LOADED: 0,
  ST_LOADING: 1,
  ST_ERROR: 2,
  ST_LOADED: 3,
  STATUS_ICONS: {
    0: "fa fa-cog fa-spin",
    1: "fa fa-refresh fa-spin",
    2: "fa fa-warning",
    3: "fa fa-check"
  },
  STATUS_COLORS: {
    0: "black",
    1: "black",
    2: "red",
    3: "green"
  },
  METRIC_RATINGS: [
    { label: "++", value: 2 },
    { label: "+", value: 1 },
    { label: "~", value: 0 },
    { label: "-", value: -1 },
    { label: "--", value: -2 }
  ],
  MAX_CUSTOM_METRICS: 2,
  DECISION: 1,
  PROPOSAL: 2,
  PRO: 1,
  CON: 2,
  PRO_LABEL: "Pro",
  CON_LABEL: "Con",
  PRO_CON_LABELS: ["Pro", "Con"],
  USER_STORAGE_KEY: 'sdUser'
};

module.exports = AppConstants;