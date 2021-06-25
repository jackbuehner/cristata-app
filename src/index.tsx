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

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <ModalProvider>
        <DropdownProvider>
          <MuiPickersUtilsProvider utils={LuxonUtils}>
            <App />
          </MuiPickersUtilsProvider>
        </DropdownProvider>
      </ModalProvider>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// register a service worker so that the app works offline
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
