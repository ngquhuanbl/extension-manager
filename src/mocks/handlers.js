// src/mocks/handlers.js
import { rest } from "msw";
import { createAPIPath } from 'UI/utils/api';

export const handlers = [
  rest.get(createAPIPath("/extensions/marketplace"), (req, res, ctx) => {
    const response = {
      extensions: [
        {
          id: 'tylerrjoseph-alert-extension',
          displayName: "Alert extension",
          content: "http://localhost:3001/static/js/content.bundle.js",
          background: "http://localhost:3001/static/js/background.bundle.js",
        },
        {
          id: 'joshuadun-image-upload-message-extension',
          displayName: "Image Upload Message extension",
          content: "http://localhost:3002/static/js/content.bundle.js",
          background: "http://localhost:3002/static/js/background.bundle.js",
        },
      ],
    };
    return res(
      ctx.status(200),
      ctx.delay(1000),
      ctx.json(response)
    );
  }),
];
