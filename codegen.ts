import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "https://beta.pokeapi.co/graphql/v1beta",
  documents: ["app/graphql/operations/**/*.graphql"],
  generates: {
    "app/graphql/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        useTypeImports: true,
        avoidOptionals: true,
        skipTypename: false,
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
