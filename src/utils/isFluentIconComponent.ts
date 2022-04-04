function isFluentIconComponent(toCheck: unknown): toCheck is React.ComponentType {
  return (
    typeof toCheck === 'function' &&
    (toCheck.name === 'Component' || toCheck.toString().includes('.createElement("span"'))
  );
}

export { isFluentIconComponent };
