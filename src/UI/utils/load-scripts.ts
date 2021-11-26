export const loadScript = async (endpoint: string) => {
  return new Promise((resolve) => {
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.src = endpoint;

    scriptElement.onload = resolve;
    document.body.appendChild(scriptElement);
  });
};
