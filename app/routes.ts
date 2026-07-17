import { index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  layout("./routes/layouts/browse-layout.tsx", [
    index("./routes/pokemon-list.tsx"),
    route("pokemon/:id", "./routes/pokemon-detail.tsx"),
    route("favourite", "./routes/favourite-list.tsx"),
  ]),
];
