const BASE_URL = process.env.REACT_APP_BASE_URL;

//Customer
export const GET_CUSTOMER_URL = `${BASE_URL}/user/current`;
export const USER_URL = `${BASE_URL}/user`;
export const USER_STATUS_URL = `${BASE_URL}/user/status`;
export const USER_RESET_PASSWORD_URL = `${BASE_URL}/user/reset-password`;
export const LOGIN_URL = `${BASE_URL}/user/login`;
export const CHANGE_PASSWORD_FROM_PROFILE_URL = `${BASE_URL}/customer/change-password-from-profile`;
export const CHANGE_PASSWORD_FROM_FORGET_URL = `${BASE_URL}/user/change-password-from-reset`;
export const GENERATE_PASSWORD_URL = `${BASE_URL}/user/generate-password`;
export const USER_SELECTED_ITEM_URL = `${BASE_URL}/user/selected-item`;

//authority
export const AUTHORITY_ALL_URL = `${BASE_URL}/authority/all`;
export const AUTHORITY_URL = `${BASE_URL}/authority`;

//Admin-User-Role
export const ALL_ADMIN_ROLE_URL = `${BASE_URL}/adminrole/all`;
export const ADMIN_ROLE_URL = `${BASE_URL}/role`;
export const ROLE_SELECTED_ITEM_URL = `${BASE_URL}/role/selected-item`;

//Location
export const LOCATION_SELECTED_ITEM_URL = `${BASE_URL}/location/selected-item`;
export const LOCATION_SELECTED_BY_PARENT_URL = `${BASE_URL}/location/selected-item-location-by-parent`;
export const LOCATION_SELECTED_ITEM_URL_ALL = `${BASE_URL}/location/all`;
export const LOCATION_URL = `${BASE_URL}/location`;

//ProductNonIOTType
export const PRODUCTNONIOTTYPE_SELECTED_ITEM_URL = `${BASE_URL}/productNonIOTType/selected-item`;

//ProductNonIOT
export const PRODUCT_NON_IOT_SELECTED_ITEM_URL = `${BASE_URL}/productNonIOT/selected-item`;

//ServiceProcess
export const SERVICE_PROCESS_SELECTED_ITEM_URL = `${BASE_URL}/serviceProcces/selected-item`;

//Product
export const PRODUCT_IOT_URL = `${BASE_URL}/productiot`;
export const PRODUCT_IOT_SCREEN_URL = `${BASE_URL}/productiotscreen`;
export const PRODUCT_NON_IOT_URL = `${BASE_URL}/productnoniot`;
export const GET_MALFUNTINONED_PRODUCTS = `${BASE_URL}/productiot/get-malfuntioned-products`;
export const CLOSE_PAST_ALARMS = `${BASE_URL}/productiot/close-past-alarms`;

//Service-form
export const SERVICE_FORM = `${BASE_URL}/serviceForm`;

//work-schedule
export const WORK_SCHEDULE = `${BASE_URL}/workSchedule`;

//Iot-model
export const PRODUCT_IOT_MODEL_URL = `${BASE_URL}/productiotmodel`;
export const PRODUCT_DISPLAY_IOT_MODEL_URL = `${BASE_URL}/productiotmodel/screen/selected-item`;

//report
export const GET_IOT_PRODUCT_COUNT_URL = `${BASE_URL}/report/get-iot-product-count`;
export const GET_IOT_PASSIVE_PRODUCT_COUNT_URL = `${BASE_URL}/productiot/get-passive-devices`;
export const GET_IOT_ACTIVE_PRODUCT_COUNT_URL = `${BASE_URL}/productiot/get-active-devices`;
export const GET_IOT_PRODUCT_ERROR_URL = `${BASE_URL}/report/get-iot-product-error-count`;
export const GET_IOT_PRODUCT_FIRE_URL = `${BASE_URL}/report/get-iot-product-fire-count`;
export const GET_IOT_PRODUCT_ERROR_DATE_URL = `${BASE_URL}/report/get-iot-product-error-count-date`;
export const GET_IOT_PRODUCT_FIRE_DATE_URL = `${BASE_URL}/report/get-iot-product-fire-count-date`;
