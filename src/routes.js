import React from "react";
import pageURL from "./utils/pageUrls";

const Home = React.lazy(() => import("./pages/Home"));
const Device = React.lazy(() => import("./pages/Device"));
const DeviceLog = React.lazy(() => import("./pages/DeviceLog"));
const Report = React.lazy(() => import("./pages/Report"));
const WorkSchedule = React.lazy(() => import("./pages/WorkSchedule"));
const UserManagement = React.lazy(() => import("./pages/UserManagement/User"));
const RoleManagement = React.lazy(() => import("./pages/UserManagement/Role/Role"));
const RoleDetail = React.lazy(() => import("./pages/UserManagement/Role/RoleDetail"));
const Authority = React.lazy(() => import("./pages/Authority/index"));
const AuthorityAction = React.lazy(() => import("./pages/Authority/Action"));
const LocationManagment = React.lazy(() => import("./pages/LocationManagment/index"));
const IOTManagment = React.lazy(() => import("./pages/IOTManagment/index"));
const NonIOTManagment = React.lazy(() => import("./pages/NonIOTManagment/index"));
const IOTModelManagment = React.lazy(() => import("./pages/IOTModelManagment/index"));
const IOTDisplayManagment  = React.lazy(() => import("./pages/IOTDisplayManagment/index"));
const DeviceReport  = React.lazy(() => import("./pages/DeviceReport"));

const routes = [
  { path: pageURL.home, exact: true, name: "Anasayfa", component: Home },
  { path: pageURL.device, exact: true, name: "Cihaz Ekle Çıkar", component: Device },
  { path: pageURL.deviceLogId, exact: true, name: "Alarm Log", component: DeviceLog },
  { path: pageURL.report, exact: true, name: "Rapor Detay", component: Report },
  { path: pageURL.workSchedule, exact: true, name: "İş Takvimi", component: WorkSchedule },
  { path: pageURL.UserManagement, name: "User Management", component: UserManagement },
  { path: pageURL.RoleManagement, name: "Role Management", component: RoleManagement, exact: true },
  { path: pageURL.RoleAction, name: "Role Detail", component: RoleDetail },
  { path: pageURL.Authority, name: "Authority", component: Authority, exact: true },
  { path: pageURL.AuthorityAction, name: "Authority Detail", component: AuthorityAction },
  { path: pageURL.Location, name: "Location Managment", component: LocationManagment, exact: true },
  { path: pageURL.ProductIOT, name: "IOT Managment", component: IOTManagment, exact: true },
  { path: pageURL.ProductNonIOT, name: "Non IOT Managment", component: NonIOTManagment, exact: true },
  { path: pageURL.ProductIOTModel, name: "IOT Model Managment", component: IOTModelManagment, exact: true },
  { path: pageURL.ProductIOTDisplay, name: "IOT Display Managment", component: IOTDisplayManagment, exact: true },
  { path: pageURL.deviceReport, name: "Device Report", component: DeviceReport, exact: true },
];

export default routes;
