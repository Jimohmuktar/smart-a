import React, { useState, useEffect, useRef, forwardRef } from "react";
import { createPortal } from "react-dom";

function mapFontFamily(family) {
  if (!family) return "'Inter', sans-serif";
  if (family.includes("700Bold") || family.includes("Bold")) return "'Inter', sans-serif";
  return "'Inter', sans-serif";
}

function mapFontWeight(family) {
  if (!family) return undefined;
  if (family.includes("700Bold")) return "700";
  if (family.includes("600SemiBold")) return "600";
  if (family.includes("500Medium")) return "500";
  if (family.includes("400Regular")) return "400";
  return undefined;
}

function convertStyle(style) {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, s) => ({ ...acc, ...convertStyle(s) }), {});
  }
  if (style && typeof style === "object" && style._isAnimated) return {};
  const s = { ...style };

  if (s.fontFamily) {
    const fw = mapFontWeight(s.fontFamily);
    if (fw && !s.fontWeight) s.fontWeight = fw;
    s.fontFamily = mapFontFamily(s.fontFamily);
  }

  if (s.shadowColor !== undefined || s.elevation !== undefined) {
    const color = s.shadowColor || "#000";
    const opacity = s.shadowOpacity ?? 0.1;
    const offsetX = s.shadowOffset?.width ?? 0;
    const offsetY = s.shadowOffset?.height ?? 2;
    const blur = s.shadowRadius ?? 4;
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0");
    if (!s.boxShadow) {
      s.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}${alpha}`;
    }
    delete s.shadowColor;
    delete s.shadowOffset;
    delete s.shadowOpacity;
    delete s.shadowRadius;
    delete s.elevation;
  }

  if (s.textDecorationLine) {
    s.textDecoration = s.textDecorationLine;
    delete s.textDecorationLine;
  }
  if (s.textAlignVertical) delete s.textAlignVertical;
  if (s.includeFontPadding !== undefined) delete s.includeFontPadding;
  if (s.writingDirection) delete s.writingDirection;

  return s;
}

export const StyleSheet = {
  create: (styles) => styles,
  absoluteFill: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  absoluteFillObject: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  hairlineWidth: 1,
};

export const View = forwardRef(function View({ style, children, onLayout, ...props }, ref) {
  const s = convertStyle(style);
  return (
    <div
      ref={ref}
      style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", ...s }}
      {...props}
    >
      {children}
    </div>
  );
});

export function Text({ style, children, numberOfLines, ellipsizeMode, selectable, allowFontScaling, adjustsFontSizeToFit, ...props }) {
  const s = convertStyle(style);
  const clamp = numberOfLines
    ? { overflow: "hidden", display: "-webkit-box", WebkitLineClamp: numberOfLines, WebkitBoxOrient: "vertical" }
    : {};
  return (
    <span
      style={{ fontFamily: "'Inter', sans-serif", boxSizing: "border-box", ...s, ...clamp }}
      {...props}
    >
      {children}
    </span>
  );
}

export function Pressable({ onPress, onLongPress, style, children, disabled, hitSlop, android_ripple, ...props }) {
  const [pressed, setPressed] = useState(false);
  const resolved = typeof style === "function" ? style({ pressed }) : style;
  const s = convertStyle(resolved);
  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onPress}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !disabled) onPress?.(); }}
      style={{
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        cursor: disabled ? "default" : "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        ...s,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function TouchableOpacity({ onPress, style, children, disabled, activeOpacity = 0.7, ...props }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [style, pressed && { opacity: activeOpacity }]}
      {...props}
    >
      {children}
    </Pressable>
  );
}

export function ScrollView({
  style, contentContainerStyle, children, horizontal,
  showsVerticalScrollIndicator, showsHorizontalScrollIndicator,
  keyboardShouldPersistTaps, refreshControl, onScroll, scrollEventThrottle, bounces,
  ...props
}) {
  const s = convertStyle(style);
  const cs = convertStyle(contentContainerStyle);
  return (
    <div
      style={{
        overflowY: horizontal ? "hidden" : "auto",
        overflowX: horizontal ? "auto" : "hidden",
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        boxSizing: "border-box",
        flexShrink: 1,
        ...s,
      }}
      onScroll={onScroll}
      {...props}
    >
      <div style={{ display: "flex", flexDirection: horizontal ? "row" : "column", boxSizing: "border-box", ...cs }}>
        {children}
      </div>
    </div>
  );
}

export function FlatList({
  data, renderItem, keyExtractor, contentContainerStyle,
  ListEmptyComponent, ListHeaderComponent, ListFooterComponent,
  ItemSeparatorComponent, horizontal, numColumns,
  onContentSizeChange, onEndReached, onEndReachedThreshold,
  showsVerticalScrollIndicator, showsHorizontalScrollIndicator,
  style, ...props
}) {
  const s = convertStyle(style);
  const cs = convertStyle(contentContainerStyle);
  const items = data || [];
  const Empty = ListEmptyComponent;
  const Header = ListHeaderComponent;
  const Footer = ListFooterComponent;
  const Separator = ItemSeparatorComponent;
  return (
    <div style={{ overflowY: horizontal ? "hidden" : "auto", overflowX: horizontal ? "auto" : "hidden", display: "flex", flexDirection: "column", flex: 1, boxSizing: "border-box", ...s }}>
      <div style={{ display: "flex", flexDirection: numColumns > 1 ? "row" : horizontal ? "row" : "column", flexWrap: numColumns > 1 ? "wrap" : "nowrap", boxSizing: "border-box", ...cs }}>
        {Header ? (typeof Header === "function" ? <Header /> : Header) : null}
        {items.length === 0 && Empty ? (typeof Empty === "function" ? <Empty /> : Empty) : null}
        {items.map((item, index) => (
          <React.Fragment key={keyExtractor ? keyExtractor(item, index) : index}>
            {renderItem({ item, index })}
            {Separator && index < items.length - 1 ? <Separator /> : null}
          </React.Fragment>
        ))}
        {Footer ? (typeof Footer === "function" ? <Footer /> : Footer) : null}
      </div>
    </div>
  );
}

export function TextInput({
  style, multiline, secureTextEntry, onChangeText, value,
  placeholder, placeholderTextColor, autoCapitalize, keyboardType,
  returnKeyType, numberOfLines, onSubmitEditing, blurOnSubmit,
  autoFocus, autoCorrect, spellCheck, editable = true, maxLength,
  onFocus, onBlur, onKeyPress, ...props
}) {
  const s = convertStyle(style);
  const base = {
    fontFamily: "'Inter', sans-serif",
    border: "none",
    outline: "none",
    background: "transparent",
    boxSizing: "border-box",
    ...s,
  };
  const handleChange = (e) => onChangeText?.(e.target.value);
  const handleKeyDown = (e) => {
    if (onKeyPress) onKeyPress({ nativeEvent: { key: e.key } });
    if (e.key === "Enter" && !multiline && onSubmitEditing) onSubmitEditing();
  };
  const inputType = secureTextEntry ? "password" : keyboardType === "email-address" ? "email" : keyboardType === "numeric" || keyboardType === "number-pad" || keyboardType === "phone-pad" ? "tel" : "text";
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={numberOfLines || 3}
        disabled={!editable}
        maxLength={maxLength}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        style={{ ...base, resize: "none", width: "100%" }}
      />
    );
  }
  return (
    <input
      type={inputType}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={!editable}
      maxLength={maxLength}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      autoFocus={autoFocus}
      style={{ ...base, width: "100%" }}
      {...props}
    />
  );
}

export function Modal({ visible, animationType, transparent, onRequestClose, children, presentationStyle }) {
  if (!visible) return null;
  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", flexDirection: "column" }}>
      {children}
    </div>,
    document.body
  );
}

export function ActivityIndicator({ color = "#1565C0", size = "small", style }) {
  const sz = size === "large" ? 32 : 20;
  const s = convertStyle(style);
  return (
    <div
      style={{
        width: sz,
        height: sz,
        border: `3px solid ${color}40`,
        borderTop: `3px solid ${color}`,
        borderRadius: "50%",
        animation: "rn-spin 0.8s linear infinite",
        boxSizing: "border-box",
        ...s,
      }}
    />
  );
}

export function KeyboardAvoidingView({ children, style, behavior, keyboardVerticalOffset, ...props }) {
  const s = convertStyle(style);
  return (
    <div style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", ...s }} {...props}>
      {children}
    </div>
  );
}

export function SafeAreaView({ children, style, edges, ...props }) {
  const s = convertStyle(style);
  return (
    <div style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", ...s }} {...props}>
      {children}
    </div>
  );
}

export function TouchableWithoutFeedback({ children, onPress, disabled }) {
  return React.cloneElement(React.Children.only(children), { onClick: disabled ? undefined : onPress });
}

export const Alert = {
  alert: (title, message, buttons) => {
    if (!buttons || buttons.length === 0) {
      window.alert(message ? `${title}\n${message}` : title);
      return;
    }
    if (buttons.length === 1) {
      window.alert(message ? `${title}\n${message}` : title);
      buttons[0].onPress?.();
      return;
    }
    const cancelBtn = buttons.find((b) => b.style === "cancel");
    const confirmBtn = buttons.find((b) => b.style !== "cancel" && b.style !== "destructive") || buttons.find((b) => b.style === "destructive");
    const confirmed = window.confirm(message ? `${title}\n${message}` : title);
    if (confirmed) confirmBtn?.onPress?.();
    else cancelBtn?.onPress?.();
  },
};

export const Platform = {
  OS: "android",
  select: (obj) => obj.android ?? obj.default ?? obj.ios ?? obj.web,
  Version: 0,
};

export const Dimensions = {
  get: (dim) => dim === "window" ? { width: window.innerWidth, height: window.innerHeight } : { width: window.screen.width, height: window.screen.height },
  addEventListener: () => ({ remove: () => {} }),
};

export const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
};

export const Linking = {
  openURL: (url) => window.open(url, "_blank"),
  canOpenURL: () => Promise.resolve(true),
};

export const Vibration = { vibrate: () => {} };
export const BackHandler = { addEventListener: () => ({ remove: () => {} }), exitApp: () => {} };
export const AppState = { currentState: "active", addEventListener: () => ({ remove: () => {} }) };
export const Share = { share: () => Promise.resolve() };
export const Clipboard = { setString: () => {}, getString: () => Promise.resolve("") };
export const InteractionManager = { runAfterInteractions: (fn) => { fn(); return { cancel: () => {} }; } };
export const PixelRatio = { get: () => window.devicePixelRatio || 1, roundToNearestPixel: (n) => n };

class AnimatedValue {
  constructor(val) {
    this._value = val;
    this._listeners = new Map();
    this._id = 0;
  }
  _get() { return this._value; }
  setValue(val) {
    this._value = val;
    this._listeners.forEach((fn) => fn({ value: val }));
  }
  addListener(fn) {
    const id = ++this._id;
    this._listeners.set(id, fn);
    return { remove: () => this._listeners.delete(id) };
  }
  removeAllListeners() { this._listeners.clear(); }
  interpolate({ inputRange, outputRange }) {
    const self = this;
    return {
      _isInterp: true,
      _source: self,
      _inputRange: inputRange,
      _outputRange: outputRange,
      addListener: (fn) => self.addListener(fn),
      _get() {
        const v = self._value;
        const t = (v - inputRange[0]) / ((inputRange[inputRange.length - 1] - inputRange[0]) || 1);
        const ct = Math.max(0, Math.min(1, t));
        const o0 = outputRange[0], o1 = outputRange[outputRange.length - 1];
        if (typeof o0 === "string") {
          const parse = (s) => parseFloat(s);
          const unit = String(o0).replace(/[\d.-]/g, "");
          return `${parse(o0) + (parse(o1) - parse(o0)) * ct}${unit}`;
        }
        return o0 + (o1 - o0) * ct;
      },
    };
  }
}

function doTiming(animValue, toValue, duration) {
  return new Promise((resolve) => {
    const start = animValue._value;
    const diff = toValue - start;
    const t0 = performance.now();
    if (diff === 0) { resolve(); return; }
    const tick = (now) => {
      const progress = Math.min((now - t0) / (duration || 300), 1);
      animValue.setValue(start + diff * progress);
      if (progress < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

const AnimatedViewComp = forwardRef(function AnimatedView({ style, children, ...rest }, ref) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!style) return;
    const subs = [];
    const scan = (s) => {
      if (!s || typeof s !== "object") return;
      if (Array.isArray(s)) { s.forEach(scan); return; }
      Object.values(s).forEach((v) => {
        if (v instanceof AnimatedValue) subs.push(v.addListener(() => forceUpdate((n) => n + 1)));
        else if (v?._isInterp) subs.push(v._source.addListener(() => forceUpdate((n) => n + 1)));
      });
    };
    scan(style);
    return () => subs.forEach((s) => s.remove());
  }, [style]);

  const resolve = (s) => {
    if (!s || typeof s !== "object") return s;
    if (Array.isArray(s)) return Object.assign({}, ...s.map(resolve));
    const r = {};
    for (const [k, v] of Object.entries(s)) {
      if (v instanceof AnimatedValue) r[k] = v._get();
      else if (v?._isInterp) r[k] = v._get();
      else r[k] = v;
    }
    return r;
  };

  const resolved = resolve(Array.isArray(style) ? Object.assign({}, ...style.map(resolve)) : style);
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", boxSizing: "border-box", ...convertStyle(resolved) }} {...rest}>
      {children}
    </div>
  );
});

export const Animated = {
  Value: AnimatedValue,
  timing: (value, { toValue, duration = 300, useNativeDriver }) => ({
    start: (cb) => doTiming(value, toValue, duration).then(() => cb?.({ finished: true })),
  }),
  spring: (value, { toValue, useNativeDriver }) => ({
    start: (cb) => doTiming(value, toValue, 300).then(() => cb?.({ finished: true })),
  }),
  decay: (value, opts) => ({ start: (cb) => cb?.({ finished: true }) }),
  sequence: (animations) => ({
    start: (cb) => {
      const run = async () => {
        for (const anim of animations) await new Promise((res) => anim.start(() => res()));
        cb?.();
      };
      run();
    },
  }),
  parallel: (animations) => ({
    start: (cb) => Promise.all(animations.map((a) => new Promise((res) => a.start(() => res())))).then(() => cb?.()),
  }),
  loop: (animation, { iterations = -1 } = {}) => ({
    start: () => {},
    stop: () => {},
  }),
  delay: (ms) => ({ start: (cb) => setTimeout(() => cb?.(), ms) }),
  View: AnimatedViewComp,
  Text: forwardRef(function AnimatedText({ style, children, ...props }, ref) {
    return <Text style={style} ref={ref} {...props}>{children}</Text>;
  }),
  Image: forwardRef(function AnimatedImage(props, ref) {
    return <img ref={ref} style={convertStyle(props.style)} {...props} />;
  }),
  createAnimatedComponent: (Comp) => forwardRef((props, ref) => <Comp {...props} ref={ref} />),
  event: () => () => {},
  add: (a, b) => ({ _get: () => (a._get?.() ?? a) + (b._get?.() ?? b) }),
  subtract: (a, b) => ({ _get: () => (a._get?.() ?? a) - (b._get?.() ?? b) }),
  multiply: (a, b) => ({ _get: () => (a._get?.() ?? a) * (b._get?.() ?? b) }),
  divide: (a, b) => ({ _get: () => (a._get?.() ?? a) / (b._get?.() ?? b) }),
};

export function Image({ source, style, resizeMode, ...props }) {
  const s = convertStyle(style);
  const src = typeof source === "number" ? undefined : (source?.uri || source);
  const objectFit = resizeMode === "contain" ? "contain" : resizeMode === "stretch" ? "fill" : resizeMode === "center" ? "none" : "cover";
  return <img src={src} style={{ objectFit, boxSizing: "border-box", ...s }} {...props} />;
}

export function Switch({ value, onValueChange, trackColor, thumbColor, disabled, style }) {
  return (
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onValueChange?.(e.target.checked)}
      disabled={disabled}
      style={{ cursor: disabled ? "default" : "pointer" }}
    />
  );
}

export function StatusBar() { return null; }

export const useColorScheme = () => {
  const [scheme, setScheme] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setScheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return scheme;
};

export const useWindowDimensions = () => {
  const [dims, setDims] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handler = () => setDims({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return dims;
};
