export const loadScript = async (endpoint: string, params: object = {}) => {
  return new Promise((resolve) => {
    const scriptElement = document.createElement("script");
    scriptElement.type = "text/javascript";
    scriptElement.src = endpoint;

    Object.entries(params).forEach(([key, value]) => {
      scriptElement.setAttribute(`param-${key}`, String(value))
    })

    scriptElement.onload = resolve;
    document.body.appendChild(scriptElement);
  });
};

