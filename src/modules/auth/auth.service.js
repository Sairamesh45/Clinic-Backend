export const authenticate = async ({ username }) => {
  const account = {
    username: username ?? "guest",
    roles: ["user"],
  };

  return {
    token: "__mock-token__",
    account,
  };
};
