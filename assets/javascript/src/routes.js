// /*!

// =========================================================
// * Argon Dashboard PRO React - v1.1.0
// =========================================================

// * Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
// * Copyright 2020 Creative Tim (https://www.creative-tim.com)

// * Coded by Creative Tim

// =========================================================

// * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

// */
import React from "react";

// Audience page
import Prospects from "./views/pages/audiences/Audiences";
import Unsubscribes from "./views/pages/audiences/Unsubscribes/Unsubscribes";
import ForgetPassword from "./views/pages/auth/ForgetPassword/ForgetPassword";
// Auth pages
import Login from "./views/pages/auth/Login/Login";
import Register from "./views/pages/auth/Register/Register.js";
import ResetPassword from "./views/pages/auth/ResetPassword/ResetPassword";
// Campaign Detail pages
import CampaignDetailOverview from "./views/pages/campaign/CampaignDetail/CampaignDetailOverview";
import CampaignDetailRecipients from "./views/pages/campaign/CampaignDetail/CampaignDetailRecipients";
import CampaignDetailSequence from "./views/pages/campaign/CampaignDetail/CampaignDetailSequence";
import CampaignDetailSettings from "./views/pages/campaign/CampaignDetail/CampaignDetailSettings";
// Campaign List page
import CampaignList from "./views/pages/campaign/CampaignList";
// Campaign > LeadCatcher page
import LeadCatcher from "./views/pages/campaign/LeadCatcher";
// New Campaign pages
import NewCampaign from "./views/pages/campaign/NewCampaign";
import Dashboard from "./views/pages/dashboards/Dashboard.js";
import Pricing from "./views/pages/examples/Pricing";
import Api from "./views/pages/Extension/Api";
import AppsandCrm from "./views/pages/Extension/Apps&Crm";
import ConversionTracking from "./views/pages/Extension/ConversionTracking";
// Mail Account
import MailAccounts from "./views/pages/mailaccounts/MailAccounts";
import MailWarming from "./views/pages/mailaccounts/MailWarming";
import SendingCalendar from "./views/pages/mailaccounts/SendingCalendar";
import Billing from "./views/pages/TeamSettings/Billing";
import Redeem from "./views/pages/TeamSettings/Redeem";
import Setting from "./views/pages/TeamSettings/Setting";
import Teammates from "./views/pages/TeamSettings/Teammates";
import Terms from "./views/pages/terms/Terms";
import Profile from "./views/pages/User/Profile";

const routes = [
  {
    collapse: false,
    name: "Dashboards",
    icon: STATIC_FILES.dashboard,
    activeIcon: STATIC_FILES.dashboard_pink,
    state: "dashboardsCollapse",
    path: "/dashboard",
    layout: "/app/admin",
    component: Dashboard,
    principal: true,
  },

  // for campaign
  {
    collapse: true,
    name: "Campaign",
    icon: STATIC_FILES.campaigns,
    activeIcon: STATIC_FILES.campaigns_pink,
    state: "campaign",
    collapseScreens: ["/campaign/list", "/lead-catcher"],
    principal: true,
    views: [
      {
        path: "/campaign/create",
        component: NewCampaign,
        layout: "/app/admin",
        redirect: true,
        principal: false,
      },
      {
        path: "/campaign/duplicate",
        component: NewCampaign,
        layout: "/app/admin",
        redirect: true,
        principal: false,
      },
      {
        path: "/campaign/list",
        name: "Campaigns",
        miniName: " ",
        icon: STATIC_FILES.campaigns_list,
        activeIcon: STATIC_FILES.campaigns_list_pink,
        component: CampaignList,
        layout: "/app/admin",
        principal: false,
      },
      {
        path: "/lead-catcher",
        name: "Leads",
        miniName: " ",
        icon: STATIC_FILES.leads,
        activeIcon: STATIC_FILES.leads_pink,
        component: LeadCatcher,
        layout: "/app/admin",
        principal: false,
      },

      // Campaign Detail Redirects
      {
        path: "/campaign/:id/details-overview",
        component: CampaignDetailOverview,
        layout: "/app/admin",
        redirect: true,
        principal: false,
      },
      {
        path: "/campaign/:id/details-sequence",
        component: CampaignDetailSequence,
        layout: "/app/admin",
        redirect: true,
        principal: false,
      },
      {
        path: "/campaign/:id/details-recipients",
        component: CampaignDetailRecipients,
        layout: "/app/admin",
        redirect: true,
        principal: false,
      },
      {
        path: "/campaign/:id/details-settings",
        component: CampaignDetailSettings,
        layout: "/app/admin",
        redirect: true,
        principal: false,
      },
    ],
  },

  // Prospects
  {
    collapse: true,
    name: "Audiences",
    icon: STATIC_FILES.audiences,
    activeIcon: STATIC_FILES.audiences_pink,
    state: "prospects",
    collapseScreens: ["/prospects", "/unsubscribes"],
    principal: true,
    views: [
      {
        path: "/prospects",
        name: "Audiences",
        miniName: " ",
        icon: STATIC_FILES.audiences_list,
        activeIcon: STATIC_FILES.audiences_list_pink,
        component: Prospects,
        layout: "/app/admin",
        principal: false,
      },
      {
        path: "/unsubscribes",
        name: "Unsubscribes",
        miniName: " ",
        icon: STATIC_FILES.unsubscribes,
        activeIcon: STATIC_FILES.unsubscribes_pink,
        component: Unsubscribes,
        layout: "/app/admin",
        principal: false,
      },
    ],
  },

  // MailAccount
  {
    collapse: true,
    name: "Email Accounts",
    icon: STATIC_FILES.mail_icon,
    activeIcon: STATIC_FILES.mail_icon_pink,
    state: "mailAccount",
    collapseScreens: ["/mail-account", "/mail-warming", "/sending-calendar"],
    principal: true,
    views: [
      {
        path: "/mail-account",
        name: "Email Accounts",
        miniName: " ",
        icon: STATIC_FILES.email_account,
        activeIcon: STATIC_FILES.email_account_pink,
        component: MailAccounts,
        layout: "/app/admin",
        principal: false,
      },
      {
        path: "/mail-warming",
        name: "Email Warming",
        miniName: " ",
        icon: STATIC_FILES.warming,
        activeIcon: STATIC_FILES.warming_pink,
        component: MailWarming,
        layout: "/app/admin",
        principal: false,
      },
      {
        path: "/sending-calendar",
        name: "Sending Schedule",
        miniName: " ",
        icon: STATIC_FILES.schedule,
        activeIcon: STATIC_FILES.schedule_pink,
        component: SendingCalendar,
        layout: "/app/admin",
        principal: false,
      },
    ],
  },
  // for TeamSetting
  {
    collapse: true,
    name: "Settings",
    icon: STATIC_FILES.settings,
    activeIcon: STATIC_FILES.settings_pink,
    state: "teamSetting",
    collapseScreens: ["/setting", "/billing"],
    principal: true,
    views: [
      {
        path: "/setting",
        name: "Setting",
        miniName: " ",
        component: Setting,
        layout: "/app/admin",
        redirect: true,
        principal: false,
      },
      {
        path: "/teammates",
        name: "Team Setting",
        miniName: " ",
        icon: STATIC_FILES.team_setting,
        activeIcon: STATIC_FILES.team_setting_pink,
        component: Teammates,
        layout: "/app/admin",
        principal: false,
      },
      {
        path: "/billing",
        name: "Billing",
        miniName: " ",
        icon: STATIC_FILES.billing,
        activeIcon: STATIC_FILES.billing_pink,
        component: Billing,
        layout: "/app/admin",
        principal: false,
      },
      {
        path: "/redeem",
        name: "Redeem",
        miniName: " ",
        component: Redeem,
        layout: "/app/admin",
        redirect: true,
        principal: false,
      },
      {
        path: "/integrations",
        name: "Integrations",
        miniName: " ",
        icon: STATIC_FILES.integration,
        activeIcon: STATIC_FILES.integration_pink,
        component: AppsandCrm,
        layout: "/app/admin",
        redirect: false,
        principal: false,
      },
    ],
  },

  // for Extension
  {
    collapse: false,
    state: "extensions",
    path: "/integrations",
    name: "Integrations",
    miniName: " ",
    icon: STATIC_FILES.integration,
    activeIcon: STATIC_FILES.integration_pink,
    component: AppsandCrm,
    layout: "/app/admin",
    redirect: true,
    principal: false,
  },
  {
    path: "/profile",
    name: "Profile",
    icon: "fas fa-user-slash text-dark",
    component: Profile,
    layout: "/app/admin",
    redirect: true,
  },
  {
    name: "ForgetPassword",
    // icon: "fa fa-home text-dark",
    // state: "dashboardsCollapse",
    path: "/forgetPassword",
    layout: "/app/auth",
    component: ForgetPassword,
    redirect: true,
  },
  {
    name: "ResetPassword",
    // icon: "fa fa-home text-dark",
    // state: "dashboardsCollapse",
    path: "/resetPassword/:uid/:token",
    layout: "/app/auth",
    component: ResetPassword,
    redirect: true,
  },

  // User management redirects
  {
    path: "/login",
    component: Login,
    layout: "/app/auth",
    redirect: true,
  },
  {
    path: "/register",
    component: Register,
    layout: "/app/auth",
    redirect: true,
  },
  {
    path: "/pricing",
    component: Pricing,
    layout: "/app/auth",
    redirect: true,
  },
  {
    path: "/terms-conditions",
    component: Terms,
    layout: "/app/auth",
    redirect: true,
  },
];

export default routes;
