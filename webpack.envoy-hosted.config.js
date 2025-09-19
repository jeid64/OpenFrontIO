import { execSync } from "child_process";
import CopyPlugin from "copy-webpack-plugin";
import ESLintPlugin from "eslint-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";
import webpack from "webpack";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gitCommit =
  process.env.GIT_COMMIT ?? execSync("git rev-parse HEAD").toString().trim();

export default async (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/client/Main.ts",
    output: {
      publicPath: "/",
      filename: "js/[name].[contenthash].js",
      path: path.resolve(__dirname, "envoy-static"),
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.bin$/,
          type: "asset/resource",
          generator: {
            filename: "binary/[name].[contenthash][ext]",
          },
        },
        {
          test: /\.txt$/,
          type: "asset/source",
        },
        {
          test: /\.md$/,
          type: "asset/resource",
          generator: {
            filename: "text/[name].[contenthash][ext]",
          },
        },
        {
          test: /\.ts$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                importLoaders: 1,
              },
            },
            {
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: ["tailwindcss", "autoprefixer"],
                },
              },
            },
          ],
        },
        {
          test: /\.(webp|png|jpe?g|gif)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[name].[contenthash][ext]",
          },
        },
        {
          test: /\.html$/,
          use: ["html-loader"],
        },
        {
          test: /\.svg$/,
          type: "asset/resource",
          generator: {
            filename: "images/[name].[contenthash][ext]",
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf|xml)$/,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name].[contenthash][ext]",
          },
        },
      ],
    },
    resolve: {
      extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [
      new webpack.DefinePlugin({
        GIT_COMMIT: JSON.stringify(gitCommit),
      }),
      new HtmlWebpackPlugin({
        template: "src/client/index.html",
        filename: "index.html",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "resources",
            to: "",
            globOptions: {
              ignore: ["**/Thumbs.db"],
            },
          },
        ],
        options: { concurrency: 100 },
      }),
      new ESLintPlugin({
        context: __dirname,
      }),
    ],
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    },
  };
};
