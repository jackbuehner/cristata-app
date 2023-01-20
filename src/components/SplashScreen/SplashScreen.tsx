interface ISplashScreen {
  children?: React.ReactNode;
}

/**
  This does nothing
 */
function SplashScreen(props: ISplashScreen) {
  return <>{props.children}</>;
}

export { SplashScreen };
