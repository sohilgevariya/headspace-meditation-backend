"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = __importStar(require("body-parser"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const packageInfo = __importStar(require("../package.json"));
const database_1 = require("./database");
const routes_1 = require("./routes");
const socket_1 = require("./helpers/socket");
const app = (0, express_1.default)();
const server = new http_1.default.Server(app);
console.log(process.env.NODE_ENV || 'localhost');
app.use(database_1.mongooseConnection);
app.use((0, cors_1.default)());
app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }));
const io = require('socket.io')(server, { cors: true, });
io.on('connection', socket_1.onConnect);
const health = (req, res) => {
    return res.status(200).json({
        message: "Headspace meditation backend server is running",
        app: packageInfo.name,
        version: packageInfo.version,
        // author: packageInfo.author,
        license: packageInfo.license,
        // contributors: packageInfo.contributors
    });
};
const bad_gateway = (req, res) => { return res.status(502).json({ status: 502, message: "Headspace meditation Backend API Bad Gateway" }); };
app.get('/', health);
app.get('/health', health);
app.get('/isServerUp', (req, res) => {
    res.send('Server is running ');
});
app.use('', routes_1.router);
app.use('*', bad_gateway);
exports.default = server;
//# sourceMappingURL=index.js.map