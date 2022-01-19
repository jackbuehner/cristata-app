function SignOut() {
  window.location.href = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_BASE_URL}/auth/clear`;
  return null;
}

export { SignOut };
