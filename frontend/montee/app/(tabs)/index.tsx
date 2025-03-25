import { WebSocketProvider } from "@/services"
import App from "./App"

const Main = () => {

  return (
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  );
}

export default Main;