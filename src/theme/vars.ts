import { Platform } from "react-native";

import iosVars from "./ios";
import webVars from "./web";

const platformVars = Platform.OS === "web" ? webVars : iosVars;

const vars = { ...platformVars } as const;

export default vars;
