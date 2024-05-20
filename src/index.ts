import http from 'http';
import App from "./server";
import router from "./router";
import { ChatUtils } from './modules/chat/utils';

const ExpressApp = new App(router)

// const chat = new ChatUtils()
// ; (
//   async () => await chat.createChatApp()
// )()

const server = http.createServer(ExpressApp.getServer);
const port = process.env.PORT || 5000
server.listen(port, () => console.info("Listening port on " + port))