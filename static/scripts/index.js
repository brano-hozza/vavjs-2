// Branislav Hozza
import loginSetup from './login.js';
import registerSetup from './register.js';
import setupGame from './game.js';


const app = document.querySelector('#app');
app.appendChild(document.createElement('h1')).textContent = 'Zadanie 2';
const appState ={
  screen: 'login',
  fieldSize: 48,
  widthFields: 11,
  heightFields: 11,
  gameWidth: (13+ 2)* 48,
  gameHeight: (11 + 2) * 48,
  xOffset: 1,
  yOffset: 1,
  user: {
    username: '',
    token: '',
  },
  changeView: () => {
    if (appState.screen === 'login') {
      app.innerHTML = '';
      loginSetup(app, appState);
      registerSetup(app, appState);
    } else if (appState.screen === 'game') {
      app.innerHTML = '';
      setupGame(app, appState);
    }
  },
  setUser: ({username, token}) => {
    appState.user.username = username;
    appState.user.token = token;
  },
  setLoggedIn: (state) => {
    if (state) {
      appState.screen = 'game';
      appState.changeView();
    } else {
      appState.screen = 'login';
      appState.changeView();
    }
  },
};

appState.changeView();

