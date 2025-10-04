import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import {getDatabase, ref, set, push, update, remove, onValue, child} 
from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZAFf50jMavFj-O1D3Tw7bPqtINrcRj2c",
  authDomain: "web-travel-agency-2e53a.firebaseapp.com",
  databaseURL: "https://web-travel-agency-2e53a-default-rtdb.firebaseio.com",
  projectId: "web-travel-agency-2e53a",
  storageBucket: "web-travel-agency-2e53a.appspot.com",
  messagingSenderId: "791671128523",
  appId: "1:791671128523:web:1ff6b77a9603d16979364e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tourList = document.getElementById("tourList");

//Загрузка туров
const toursRef = ref(db, "Tours");

onValue(toursRef, (snapshot) => {
  const data = snapshot.val();
  tourList.innerHTML = "";

  if (data) {
    Object.entries(data).forEach(([id, tour]) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-md overflow-hidden";

      card.innerHTML = `
        <img src="${tour.ImageURL}" alt="${tour.Name}" class="w-full h-48 object-cover">
        <div class="p-4 space-y-2">
          <input type="text" value="${tour.Name}" class="edit-name w-full p-1 border rounded" />
          <input type="text" value="${tour.Description}" class="edit-desc w-full p-1 border rounded" />
          <input type="number" value="${tour.Price}" class="edit-price w-full p-1 border rounded" />
          <input type="url" value="${tour.ImageURL}" class="edit-img w-full p-1 border rounded" />
          <div class="flex gap-2 mt-2">
            <button class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onclick="editTour('${id}', this)">Сохранить</button>
            <button class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700" onclick="deleteTour('${id}')">Удалить</button>
          </div>
        </div>
      `;

      tourList.appendChild(card);
    });
  } else {
    tourList.innerHTML = "<p class='text-gray-500'>Туры не найдены.</p>";
  }
});

//Удаление тура
window.deleteTour = function (id) {
  const tourRef = ref(db, `Tours/${id}`);
  remove(tourRef)
    .then(() => alert("Тур удалён."))
    .catch((error) => {
      console.error("Ошибка удаления:", error);
      alert("Ошибка при удалении тура.");
    });
};

//Редактирование тура
window.editTour = function (id, btn) {
  const card = btn.closest(".p-4");
  const name = card.querySelector(".edit-name").value;
  const desc = card.querySelector(".edit-desc").value;
  const price = parseFloat(card.querySelector(".edit-price").value);
  const img = card.querySelector(".edit-img").value;

  const tourRef = ref(db, `Tours/${id}`);
  update(tourRef, {
    Name: name,
    Description: desc,
    Price: price,
    ImageURL: img
  })
    .then(() => alert("Тур обновлён."))
    .catch((err) => {
      console.error("Ошибка обновления:", err);
      alert("Ошибка при обновлении тура.");
    });
};

//Добавление тура
const form = document.getElementById("addTourForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const desc = document.getElementById("description").value.trim();
  const price = parseFloat(document.getElementById("price").value.trim());
  const imageURL = document.getElementById("imageUrl").value.trim();

  if (!name || !desc || !price || !imageURL) {
    alert("Пожалуйста, заполните все поля.");
    return;
  }

  try {
    const newTourRef = push(child(ref(db), "Tours")); //создаем уникальный ключ
    await set(newTourRef, {
      Name: name,
      Description: desc,
      Price: price,
      ImageURL: imageURL
    });
    form.reset();
    alert("Тур добавлен!");
  } catch (err) {
    console.error("Ошибка добавления тура:", err);
    alert("Ошибка при добавлении.");
  }
});
