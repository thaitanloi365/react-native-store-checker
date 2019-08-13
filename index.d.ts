declare module "react-native-store-checker" {
  import { StyleProp, ViewStyle, TextStyle } from "react-native";
  export interface StoreInfo {
    isNeeded: boolean;
    currentVersion: string;
    latestVersion: string;
  }
  export interface StoreCheckerProps {
    title: string;
    message: string;
    storeAppID: string;
    storeAppName: string;
    isMandatory?: boolean;
    isCheckOnResume?: boolean;
    modalBackgroundColor?: string;
    animationType?: "scale" | "slide";
    onGetStoreInfo?: (info: StoreInfo) => void;
    style?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    messageStyle?: StyleProp<TextStyle>;
    updateLaterButtonStyle?: StyleProp<ViewStyle>;
    updateLaterButtonTextStyle?: StyleProp<TextStyle>;
    updateLaterButtonText?: string;
    updateNowButtonStyle?: StyleProp<ViewStyle>;
    updateNowButtonTextStyle?: StyleProp<TextStyle>;
    updateNowButtonText?: string;
  }
}
