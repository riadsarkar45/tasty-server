"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const fastify_1 = __importDefault(require("fastify"));
const aws_lambda_1 = __importDefault(require("@fastify/aws-lambda"));
const database_1 = __importDefault(require("./database/database"));
const addNewVideo_1 = __importDefault(require("./pages/services/addNewVideo"));
const cors_1 = __importDefault(require("@fastify/cors"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const addNewImage_1 = __importDefault(require("./pages/services/addNewImage"));
const videos_1 = require("./public/videos");
const app = (0, fastify_1.default)({
    logger: {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                levelFirst: true,
                translateTime: "HH:MM:ss",
                ignore: "pid,hostname",
            },
        },
    },
});
// ✅ CORS
app.register(cors_1.default, {
    origin: process.env.NODE_ENV === "production"
        ? "*" // On Vercel allow all (or restrict to your frontend domain)
        : "http://localhost:5173", // Local React frontend
    credentials: true,
});
// ✅ Plugins
app.register(multipart_1.default);
app.register(addNewVideo_1.default);
app.register(addNewImage_1.default);
app.register(videos_1.getVideosForPublic, { prefix: "/api/v1/public" });
// ✅ Database connection
(0, database_1.default)(app);
// ✅ Example route
app.get("/", async () => {
    app.log.info("Handled / request");
    return { message: "Hello! Fastify server is running 🚀" };
});
// ✅ Local development only
if (process.env.NODE_ENV !== "production") {
    const start = async () => {
        try {
            const address = await app.listen({ port: 3000, host: "0.0.0.0" });
            app.log.info(`Server listening at ${address}`);
        }
        catch (err) {
            app.log.error(err);
            process.exit(1);
        }
    };
    start();
}
// ✅ Export handler for Vercel (serverless)
exports.handler = (0, aws_lambda_1.default)(app);
