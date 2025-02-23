import http from 'http';
import App from "./server";
import router from "./router";

const ExpressApp = new App(router)

const server = http.createServer(ExpressApp.getServer);
const port = process.env.PORT || 5000
server.listen(port, () => console.info("Listening port on " + port))