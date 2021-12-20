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
  {
    id: "newwest199x-jira-friendlist-extension",
    displayName: "Jira friendlist extension",
    contentURL: "http://localhost:3003/static/js/content.bundle.js",
    backgroundURL: "http://localhost:3003/static/js/background.bundle.js",
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
    const extensionID = req.url.searchParams.get("id");

    const response = EXTENSIONS.find(({ id }) => id === extensionID);
    return res(ctx.status(200), ctx.delay(500), ctx.json(response));
  }),
  rest.get(createAPIPath("/contact"), (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(500),
      ctx.json([
        {
          id: "450f75a4-f16f-41aa-99b3-3ee36283fc17",
          name: "Nicole Domb",
          avatar:
            "https://robohash.org/minimaducimusdoloremque.png?size=50x50&set=set1",
        },
        {
          id: "9f24d65b-feff-4f3f-ad92-a52dbb38963d",
          name: "Sileas Buncom",
          avatar:
            "https://robohash.org/nihildistinctioearum.png?size=50x50&set=set1",
        },
        {
          id: "c1b08ebb-0be5-4585-82a3-0e1d14daacbf",
          name: "Eunice Blacker",
          avatar:
            "https://robohash.org/laborevitaecupiditate.png?size=50x50&set=set1",
        },
        {
          id: "ca39fd6d-5926-4761-9234-7d9350717fe8",
          name: "Floris Clifft",
          avatar:
            "https://robohash.org/consecteturesseaut.png?size=50x50&set=set1",
        },
        {
          id: "758253f2-2d11-4da2-b6ab-88048f74ec20",
          name: "Ariana Ramshay",
          avatar: "https://robohash.org/modinondolor.png?size=50x50&set=set1",
        },
      ])
    );
  }),
];
