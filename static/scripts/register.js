// Branislav Hozza
/**
   * class to represent Registration data
   * @return {RegisterData}
   */
class RegisterData {
  /**
   *
   */
  constructor() {
    this.username = '';
    this.password = '';
    this.passwordAgain = '';
    this.errors = {
      usernameLength: {
        status: false,
        message: 'Username needs to be at least 5 characters long',
      },
      passwordLength: {
        status: false,
        message: 'Password needs to be at least 5 characters long',
      },
      passwordMatch: {
        status: false,
        message: 'Passwords need to match',
      },
      APIerror: {
        status: false,
        message: '',
      },
    };
    this.APIdata = {};
  }
  validate = () => {
    this.errors.usernameLength.status = this.username.length < 5;
    this.errors.passwordLength.status = this.password.length < 5;
    this.errors.passwordMatch.status = this.passwordAgain <5 ||
      this.password !== this.passwordAgain;
    console.log(this.errors);

    return !Object.keys(this.errors).some((key) => this.errors[key].status );
  };
};

/**
 * Function to setup handle screen
 * @param {Node} app Root node for the app
 */
export default function setupRegister(app) {
  const registerData = new RegisterData();
  // Register header
  const registerHeader = document.createElement('h2');
  registerHeader.innerText = 'Register';
  app.appendChild(registerHeader);
  // Register form
  const registerForm = document.createElement('form');
  app.appendChild(registerForm);
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

  // Password again
  const passwordAgainWrapper = document.createElement('div');
  passwordAgainWrapper.classList.add('form-group');
  const passwordAgainInput = document.createElement('input');
  passwordAgainInput.name='password';
  const passwordAgainLabel = document.createElement('label');
  passwordAgainLabel.innerText = 'Password again:';
  passwordAgainLabel.for = 'password';
  passwordAgainInput.type = 'password';
  passwordAgainInput.placeholder = 'Password again';
  passwordAgainWrapper.appendChild(passwordAgainLabel);
  passwordAgainWrapper.appendChild(passwordAgainInput);

  // Submit button
  const registerButton = document.createElement('button');
  registerButton.innerText = 'Register';
  registerButton.disabled = true;
  registerButton.type = 'submit';

  // Error field
  const errorField = document.createElement('ul');


  const debugField = document.createElement('textarea');
  debugField.placeholder = 'DEBUG TEXT AREA';


  /**
 * Function to react on change of login data
 */
  function updateRegisterData() {
    debugField.value = JSON.stringify(registerData);
    const HAS_ERRORS = !registerData.validate();
    registerButton.disabled = HAS_ERRORS;
    if (HAS_ERRORS) {
      errorField.classList.add('error');
      errorField.innerHTML = '';
      Object.keys(registerData.errors).forEach((key) => {
        if (registerData.errors[key].status) {
          const errorItem = document.createElement('li');
          errorItem.innerText = registerData.errors[key].message;
          errorField.appendChild(errorItem);
        }
      });
    } else {
      errorField.classList.remove('error');
      errorField.innerHTML = '';
    }
    usernameInput.value = registerData.username;
    passwordInput.value = registerData.password;
    passwordAgainInput.value = registerData.passwordAgain;
  }

  usernameInput.addEventListener('input', ({target: {value}})=>{
    registerData.errors.APIerror.status = false;
    registerData.username = value;
    updateRegisterData();
  });

  passwordInput.addEventListener('input', ({target: {value}})=>{
    registerData.errors.APIerror.status = false;
    registerData.password = value;
    updateRegisterData();
  });

  passwordAgainInput.addEventListener('input', ({target: {value}})=>{
    registerData.errors.APIerror.status = false;
    registerData.passwordAgain = value;
    updateRegisterData();
  });

  registerForm.appendChild(usernameWrapper);
  registerForm.appendChild(passwordWrapper);
  registerForm.appendChild(passwordAgainWrapper);
  registerForm.appendChild(registerButton);
  registerForm.appendChild(errorField);

  const url = new URL(window.location.href);
  if (url.searchParams.get('debug') === '1') {
    registerForm.appendChild(debugField);
  }


  registerForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    console.log(registerData);
    fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData),
    })
        .then(async (res) => {
          if (res.status === 200) {
            return res.json();
          }
          throw new Error((await res.json()).message);
        })
        .then((res) => {
          registerData.data = res;
          registerData.username = '';
          registerData.password = '';
          registerData.passwordAgain = '';
          alert('Succesfully registered');
          updateRegisterData();
        }).catch((err) => {
          registerData.errors.APIerror.status = true;
          registerData.errors.APIerror.message = err;
          updateRegisterData();
        });
  });


  app.appendChild(registerForm);
}
