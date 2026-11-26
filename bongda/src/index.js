import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { NoticeProvider } from './context/NoticeContext';
import { ThemeProvider } from './context/ThemeContext';
import { store } from './store';
import "./index.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <Provider store={store}>
      <ThemeProvider>
        <NoticeProvider>
          <App />
        </NoticeProvider>
      </ThemeProvider>
    </Provider>
);
