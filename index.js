import React from "react";
import {
  Modal,
  Animated,
  StyleSheet,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  AppState,
  Linking
} from "react-native";
import VersionCheck from "react-native-version-check";

const { width, height } = Dimensions.get("window");
const dialogWidth = width - 20;
const dialogHeight = height * 0.8;

const primaryColor = "#007aff";
const lightBlueGrey = "#dae4f2";
const slateColor = "#474f61";

/**
 * @typedef {import("react-native-store-checker").StoreCheckerProps} Props
 * @extends {React.Component<Props>}
 */

class StoreChecker extends React.Component {
  state = {
    isMandatory: false,
    animatedOpacityValue: new Animated.Value(0),
    animatedScaleValue: new Animated.Value(0),
    showContent: true,
    updateLater: false,
    storeUrl: "",
    visible: false
  };

  /**
   * @type {Props}
   */
  static defaultProps = {
    title: "Update Available !",
    message: "The latest version of Rent My Wardrobe is available",
    isMandatory: false,
    isCheckOnResume: true,
    modalBackgroundColor: "rgba(35,36,38,0.8)",
    animationType: "scale",
    storeAppID: "",
    storeAppName: ""
  };

  componentWillUnmount() {
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  componentDidMount() {
    this._handleAppStateChange("active");

    if (this.props.isCheckOnResume) {
      AppState.addEventListener("change", this._handleAppStateChange);
    }
  }

  _getFormatVersion = (label, appVersion) => {
    const buildNumber = label.substring(1);
    const version = `${appVersion}.${buildNumber}`;
    return version;
  };

  _handleAppStateChange = nextAppState => {
    if (nextAppState === "active") {
      this._storeCheck();
    }
  };

  _storeCheck = () => {
    const { storeAppID: appID, storeAppName: appName, onGetStoreInfo } = this.props;

    if (appID !== "") {
      let info = null;
      let storeUrl = null;
      VersionCheck.needUpdate()
        .then(res => {
          info = res;
          onGetStoreInfo && onGetStoreInfo(res);
          return VersionCheck.getStoreUrl({ appID, appName, ignoreErrors: true });
        })
        .then(url => {
          if (!info.isNeeded || !url) throw Error("No need to update store");
          storeUrl = url;
          return Linking.canOpenURL(url);
        })
        .then(canOpen => {
          if (!canOpen) throw Error("Can't open store url");
          console.log("*** need update store: ", storeUrl);
          this.setState({ storeUrl, showContent: true, visible: true }, this._show);
        })
        .catch(error => {
          console.log("**** error", error);
        });
    }
  };

  _show = () => {
    const { animatedOpacityValue, animatedScaleValue } = this.state;
    Animated.sequence([
      Animated.timing(animatedOpacityValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(animatedScaleValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();
  };

  _hide = () => {
    const { animatedOpacityValue, animatedScaleValue } = this.state;
    Animated.sequence([
      Animated.timing(animatedScaleValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }),
      Animated.timing(animatedOpacityValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      })
    ]).start(() => this.setState({ showContent: false }, () => this.setState({ visible: false })));
  };

  _updateLater = () => {
    this.setState({ updateLater: true });
    this._hide();
  };

  _updateNow = () => {
    Linking.openURL(this.state.storeUrl)
      .then(res => {
        console.log("**** res", res);
      })
      .catch(error => {
        console.log("**** error", error);
      });
  };

  _getAnimation = () => {
    const { animatedScaleValue } = this.state;
    const { animationType } = this.props;
    if (animationType === "scale") {
      const scale = animatedScaleValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
      });

      const opacity = animatedScaleValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0.7, 1],
        extrapolate: "clamp"
      });

      const scaleStyle = {
        transform: [{ scale }],
        opacity
      };

      return scaleStyle;
    }

    const translateY = animatedScaleValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [-height, -height / 4, 0],
      extrapolate: "clamp"
    });
    const opacity = animatedScaleValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 1],
      extrapolate: "clamp"
    });
    const slideAnimationStyle = {
      opacity,
      transform: [{ translateY }]
    };
    return slideAnimationStyle;
  };

  render() {
    const { animatedOpacityValue, visible, showContent, isMandatory } = this.state;
    const {
      modalBackgroundColor,
      style,
      title,
      message,
      titleStyle,
      messageStyle,
      updateLaterButtonTextStyle,
      updateLaterButtonStyle,
      updateLaterButtonText,
      updateNowButtonStyle,
      updateNowButtonTextStyle,
      updateNowButtonText
    } = this.props;

    const opacity = animatedOpacityValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 1]
    });

    const opacityStyle = {
      opacity
    };

    const animationType = this._getAnimation();

    const backgroundColor = showContent ? modalBackgroundColor : "transparent";
    return (
      <Modal transparent visible={visible}>
        <Animated.View style={[styles.modal, { backgroundColor }, opacityStyle, style]}>
          {showContent && (
            <Animated.View style={[styles.container, animationType]}>
              {typeof title === "string" && title !== "" && <Text style={[styles.title, titleStyle]}>{title}</Text>}
              <Text style={[styles.message, titleStyle]}>{title}</Text>
              <View style={styles.row}>
                {!isMandatory && (
                  <TouchableOpacity style={[styles.inactiveButton, updateLaterButtonStyle]} onPress={this._updateLater}>
                    <Text style={[styles.inactiveButtonText, updateLaterButtonTextStyle]}>{updateLaterButtonText}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.activeButton, updateNowButtonStyle]} onPress={this._updateNow}>
                  <Text style={[styles.activeButtonText, updateNowButtonTextStyle]}>{updateNowButtonText}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </Animated.View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },

  title: {
    marginHorizontal: 20,
    marginTop: 20,
    fontSize: 20,
    color: primaryColor
  },
  message: {
    marginTop: 6,
    fontSize: 14,
    color: slateColor
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  container: {
    alignItems: "center",
    width: dialogWidth,
    maxHeight: dialogHeight,
    overflow: "hidden",
    backgroundColor: "white",
    ...Platform.select({
      android: {
        elevation: 4
      },
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6
      }
    }),
    borderRadius: 14
  },
  activeButton: {
    flex: 0.5,
    marginHorizontal: 15,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: primaryColor,
    borderRadius: 4
  },
  activeButtonText: {
    fontSize: 18,
    color: "white",
    marginHorizontal: 20,
    marginVertical: 10
  },
  inactiveButton: {
    flex: 0.5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    backgroundColor: lightBlueGrey,
    borderRadius: 4
  },
  inactiveButtonText: {
    fontSize: 18,
    color: slateColor,
    marginHorizontal: 20,
    marginVertical: 10
  }
});

export default StoreChecker;
