import React, { useEffect } from "react";
import { useNavigate, Navigate as RRNavigate } from "react-router-dom";

let _navigate = null;

export function initRouter(navigateFn) {
  _navigate = navigateFn;
}

function normalizePath(path) {
  if (!path) return "/";
  return path
    .replace("/(tabs)", "")
    .replace("/(auth)", "")
    .replace(/^\/\//, "/") || "/";
}

export const router = {
  push: (path, params) => _navigate?.(normalizePath(path)),
  replace: (path, params) => _navigate?.(normalizePath(path), { replace: true }),
  back: () => _navigate?.(-1),
  navigate: (path) => _navigate?.(normalizePath(path)),
  dismiss: () => _navigate?.(-1),
  dismissAll: () => _navigate?.("/"),
  setParams: () => {},
  canGoBack: () => true,
};

export function Redirect({ href }) {
  return <RRNavigate to={normalizePath(href)} replace />;
}

export function Link({ href, children, style, ...props }) {
  return (
    <a href={normalizePath(href)} style={style} onClick={(e) => { e.preventDefault(); router.push(href); }} {...props}>
      {children}
    </a>
  );
}

export function Stack({ children }) { return children; }
Stack.Screen = function StackScreen() { return null; };

export function Tabs({ children }) { return children; }
Tabs.Screen = function TabsScreen() { return null; };

export function useRouter() {
  return router;
}

export function useLocalSearchParams() {
  return {};
}

export function useGlobalSearchParams() {
  return {};
}

export function useSegments() {
  return [];
}

export function usePathname() {
  return window.location.pathname;
}

export function useNavigation() {
  return {
    navigate: router.navigate,
    goBack: router.back,
    addListener: () => () => {},
    removeListener: () => {},
  };
}

export function useFocusEffect(effect) {
  useEffect(() => {
    const cleanup = effect();
    return cleanup;
  }, []);
}

export function useIsFocused() {
  return true;
}
