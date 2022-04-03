function isFluentIconComponent(toCheck: unknown): toCheck is React.ComponentType {
  return (
    typeof toCheck === 'function' &&
    (String(toCheck).includes('return react') || String(toCheck).includes('return React')) &&
    String(toCheck).includes('createElement')
  );
}

export { isFluentIconComponent };
