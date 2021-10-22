import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { ModalProvider } from 'react-modal-hook';
import { ThemeProvider } from '@emotion/react';
import { theme } from './utils/theme';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { DropdownProvider } from './hooks/useDropdown';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { store } from './redux/store';
import { Provider as ReduxProvider } from 'react-redux';

ReactDOM.render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider theme={theme}>
        <ModalProvider>
          <DropdownProvider>
            <MuiPickersUtilsProvider utils={LuxonUtils}>
              <App />
            </MuiPickersUtilsProvider>
          </DropdownProvider>
        </ModalProvider>
      </ThemeProvider>
    </ReduxProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// register a service worker so that the app works offline
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
