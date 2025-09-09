import { WebSocketProvider } from "@/services/SocketContext"
import App from "./App"
import { ImageSelectionContextProvider } from "./services/ImageSelectionContext";

const Main = () => {
  return (
    <WebSocketProvider>
      <ImageSelectionContextProvider>
        <App />
      </ImageSelectionContextProvider>
    </WebSocketProvider>
  );
}

export default Main;