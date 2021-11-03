// Branislav Hozza
/**
   * class to represent Registration data
   * @return {LoginData}
   */
class LoginData {
  /**
   *
   */
  constructor() {
    this.username = '';
    this.password = '';
    this.errors = {
      usernameLength: {
        status: false,
        message: 'Username needs to be at least 5 characters long',
        rendered: false,
      },
      passwordLength: {
        status: false,
        message: 'Password needs to be at least 5 characters long',
        rendered: false,
      },
      APIerror: {
        status: false,
        message: '',
        rendered: true,
      },
    };
    this.APIdata = {};
  }
  validate = () => {
    this.errors.usernameLength.status = this.username.length < 5;
    this.errors.passwordLength.status = this.password.length < 5;

    return !Object.keys(this.errors).some((key) => this.errors[key].status );
  };
  showErrors = () => {
    return Object.keys(this.errors).some((key) => this.errors[key].rendered &&
      this.errors[key].status );
  };
};

/**
 * Function to setup handle screen
 * @param {Node} app Root node for the app
 * @param {Object} appstate App state
 */
export default function setupLogin(app, appstate) {
  const loginData = new LoginData();
  // Login header
  const loginHeader = document.createElement('h2');
  loginHeader.innerText = 'Login';
  app.appendChild(loginHeader);
  // Login form
  const loginForm = document.createElement('form');
  app.appendChild(loginForm);
  // Username
  const usernameWrapper = document.createElement('div');
  usernameWrapper.classList.add('form-group');
  const usernameInput = document.createElement('input');
  usernameInput.name='username';
  const usernameLabel = document.createElement('label');
  usernameLabel.innerText = 'Username:';
  usernameLabel.for = 'username';
  usernameInput.type = 'text';
  usernameInput.placeholder = 'Username';
  usernameWrapper.appendChild(usernameLabel);
  usernameWrapper.appendChild(usernameInput);
  // Password
  const passwordWrapper = document.createElement('div');
  passwordWrapper.classList.add('form-group');
  const passwordInput = document.createElement('input');
  passwordInput.name='password';
  const passwordLabel = document.createElement('label');
  passwordLabel.innerText = 'Password:';
  passwordLabel.for = 'password';
  passwordInput.type = 'password';
  passwordInput.placeholder = 'Password';
  passwordWrapper.appendChild(passwordLabel);
  passwordWrapper.appendChild(passwordInput);
  // Submit button
  const loginButton = document.createElement('button');


  // Error field
  const errorField = document.createElement('ul');

  // Debug field
  const debugField = document.createElement('textarea');
  debugField.placeholder = 'DEBUG TEXT AREA';


  /**
 * Function to react on change of login data
 */
  function updateLoginData() {
    debugField.value = JSON.stringify(loginData);
    const HAS_ERRORS = !loginData.validate();
    loginButton.disabled = HAS_ERRORS;
    if (HAS_ERRORS && loginData.showErrors() ) {
      errorField.classList.add('error');
      errorField.innerHTML = '';
      Object.keys(loginData.errors).forEach((key) => {
        if (loginData.errors[key].status) {
          const errorItem = document.createElement('li');
          errorItem.innerText = loginData.errors[key].message;
          errorField.appendChild(errorItem);
        }
      });
    } else {
      errorField.classList.remove('error');
      errorField.innerHTML = '';
    }
  }

  usernameInput.addEventListener('input', ({target: {value}})=>{
    loginData.errors.APIerror.status = false;
    loginData.username = value;
    updateLoginData();
  });

  passwordInput.addEventListener('input', ({target: {value}})=>{
    loginData.errors.APIerror.status = false;
    loginData.password = value;
    updateLoginData();
  });

  loginForm.appendChild(usernameWrapper);
  loginForm.appendChild(passwordWrapper);
  loginForm.appendChild(loginButton);
  loginForm.appendChild(errorField);
  const url = new URL(window.location.href);
  if (url.searchParams.get('debug') === '1') {
    loginForm.appendChild(debugField);
  }


  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    console.log(loginData);
    fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    })
        .then(async (res) => {
          if (res.status === 200) {
            return res.json();
          }
          throw new Error((await res.json()).message);
        })
        .then((res) => {
          loginData.data = res;
          updateLoginData();
          appstate.setUser(res);
          appstate.setLoggedIn(true);
          console.log(res);
        })
        .catch((err) => {
          loginData.errors.APIerror.status = true;
          loginData.errors.APIerror.message = err;
          updateLoginData();
        });
  });


  loginButton.innerText = 'Login';
  loginButton.disabled = true;
  loginButton.type = 'submit';

  app.appendChild(loginForm);
}
