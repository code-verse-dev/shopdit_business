import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { authService } from "./services/authSlice";
import { userSlice } from "./services/userSlice";
import { reportSlice } from "./services/reportSlice";
import { businessService } from "./services/businessService"; // ✅ import new service
import authReducer from "./slices/authSlice";
import { eventService } from "./services/eventService";
import { productService } from "./services/productService";
import { customerService } from "./services/customerService";
import { orderService } from "./services/orderService";
import { campaignManagementService } from "./services/campaignsService";
import { analyticsService } from "./services/dashboardAnalytics";
import { planService } from "./services/planService";
import { subscriptionService } from "./services/subscriptionService";
import { businessTypeService } from "./services/businessTypeService";

const persistConfig = {
  key: "shopdit_business",
  storage,
  whitelist: ["counter", "userSlice", "auth"],
};

const rootReducer = combineReducers({
  [authService.reducerPath]: authService.reducer,
  [userSlice.reducerPath]: userSlice.reducer,
  [reportSlice.reducerPath]: reportSlice.reducer,
  [businessService.reducerPath]: businessService.reducer,
  [eventService.reducerPath]: eventService.reducer,
  [productService.reducerPath]: productService.reducer,
  [customerService.reducerPath]: customerService.reducer,
  [orderService.reducerPath]: orderService.reducer,
  [campaignManagementService.reducerPath]: campaignManagementService.reducer,
  [analyticsService.reducerPath]: analyticsService.reducer,
  [planService.reducerPath]: planService.reducer,
  [subscriptionService.reducerPath]: subscriptionService.reducer,
  [businessTypeService.reducerPath]: businessTypeService.reducer,
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      authService.middleware,
      userSlice.middleware,
      reportSlice.middleware,
      businessService.middleware,
      eventService.middleware,
      productService.middleware,
      customerService.middleware,
      orderService.middleware,
      campaignManagementService.middleware,
      analyticsService.middleware,
      planService.middleware,
      subscriptionService.middleware,
      businessTypeService.middleware
    ),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
