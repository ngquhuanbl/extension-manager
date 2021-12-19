// src/mocks/handlers.js
import { rest } from "msw";
import { createAPIPath } from "UI/utils/api";

const EXTENSIONS = [
  {
    id: "tylerrjoseph-alert-extension",
    displayName: "Alert extension",
    contentURL: "http://localhost:3001/static/js/content.bundle.js",
    backgroundURL: "http://localhost:3001/static/js/background.bundle.js",
  },
  {
    id: "joshuadun-image-upload-message-extension",
    displayName: "Image Upload Message extension",
    contentURL: "http://localhost:3002/static/js/content.bundle.js",
    backgroundURL: "http://localhost:3002/static/js/background.bundle.js",
  },
];

export const handlers = [
  rest.get(createAPIPath("/extensions/all"), (req, res, ctx) => {
    const response = {
      extensions: EXTENSIONS,
    };
    return res(ctx.status(200), ctx.json(response));
  }),

  rest.get(createAPIPath("/extensions"), (req, res, ctx) => {
    const extensionID = req.url.searchParams.get('id');

    const response = EXTENSIONS.find(({ id }) => id === extensionID);
    return res(ctx.status(200), ctx.delay(500), ctx.json(response));
  }),
];
