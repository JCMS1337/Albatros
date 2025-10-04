  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
  import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBrs6S82ksKPiPxlF4T1hyartpIS3A9UNc",
    authDomain: "web-swimeasy.firebaseapp.com",
    databaseURL: "https://web-albatros-strah-default-rtdb.firebaseio.com",
    projectId: "web-swimeasy",
    storageBucket: "web-swimeasy.firebasestorage.app",
    messagingSenderId: "952061702288",
    appId: "1:952061702288:web:1dec35903e94b4a4a7e815",
    measurementId: "G-8DXRCL2S8B"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const database = getDatabase(app);

  // Generate random 5-digit ID as string
  function generateRandomId() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  // Registration function
  export async function registerClient(name, surname, email, password) {
    try {
      // Check if email already exists
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `Clients/ID`));
      const clients = snapshot.exists() ? snapshot.val() : {};

      for (const id in clients) {
        if (clients[id].email === email) {
          throw new Error("Пользователь с таким email уже существует");
        }
      }

      // Generate unique client ID
      let clientId;
      do {
        clientId = generateRandomId();
      } while (clients.hasOwnProperty(clientId));

      // Write new client data with nested information object and IsAdmin=0
      await set(ref(database, `Clients/ID/${clientId}`), {
        email,
        password,
        IsAdmin: 0,
        information: {
          Name: name,
          Surname: surname,
          datebirth: "",
          tariph: null
        }
      });
      return { success: true, message: "Регистрация прошла успешно" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Login function
  export async function loginClient(email, password) {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `Clients/ID`));
      if (snapshot.exists()) {
        const clients = snapshot.val();
        for (const id in clients) {
          if (clients[id].email === email && clients[id].password === password) {
            // Check if user is admin based on IsAdmin field in database
            const isAdmin = clients[id].IsAdmin === 1 || clients[id].IsAdmin === '1';
            return { success: true, message: "Вход выполнен успешно", clientId: id, isAdmin };
          }
        }
      }
      throw new Error("Неверный email или пароль");
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // DOM interaction for registration and login forms with toggle
  document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");
    const messageDiv = document.getElementById("message");
    const toggleBtn = document.getElementById("toggle-btn");
    const formTitle = document.getElementById("form-title");

    let showingRegister = true;

    toggleBtn.addEventListener("click", () => {
      showingRegister = !showingRegister;
      if (showingRegister) {
        registerForm.classList.add("active-form");
        registerForm.classList.remove("hidden-form");
        loginForm.classList.add("hidden-form");
        loginForm.classList.remove("active-form");
        toggleBtn.textContent = "Войти";
        formTitle.textContent = "Регистрация";
        messageDiv.textContent = "";
      } else {
        registerForm.classList.add("hidden-form");
        registerForm.classList.remove("active-form");
        loginForm.classList.add("active-form");
        loginForm.classList.remove("hidden-form");
        toggleBtn.textContent = "Зарегистрироваться";
        formTitle.textContent = "Вход";
        messageDiv.textContent = "";
      }
    });

    registerForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim();
      const surname = document.getElementById("reg-surname").value.trim();
      const email = document.getElementById("reg-email").value.trim();
      const password = document.getElementById("reg-password").value.trim();

      const result = await registerClient(name, surname, email, password);
      messageDiv.textContent = result.message;
      if (result.success) {
        registerForm.reset();
      }
    });

    loginForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      const result = await loginClient(email, password);
      messageDiv.textContent = result.message;
      if (result.success) {
        loginForm.reset();
        // Store user session
        localStorage.setItem('currentUser', JSON.stringify({email, clientId: result.clientId, isAdmin: result.isAdmin}));
        // Show admin link if admin
        const adminLink = document.getElementById('admin-link');
        if (adminLink && result.isAdmin) {
          adminLink.style.display = 'block';
        }
        // Redirect based on admin status
        if (result.isAdmin) {
          window.location.href = 'adminpanel.html';
        } else {
          window.location.href = 'albatros-main.html';
        }
      }
    });
  });
  
