// adminpanel.js - управление тарифами клубных карт с использованием Firebase Realtime Database

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, get, set, update, remove } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBrs6S82ksKPiPxlF4T1hyartpIS3A9UNc",
  authDomain: "web-swimeasy.firebaseapp.com",
  databaseURL: "https://web-swimeasy-default-rtdb.firebaseio.com",
  projectId: "web-swimeasy",
  storageBucket: "web-swimeasy.firebasestorage.app",
  messagingSenderId: "952061702288",
  appId: "1:952061702288:web:1dec35903e94b4a4a7e815",
  measurementId: "G-8DXRCL2S8B"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tariffsRef = ref(db, "Tariph");

document.addEventListener('DOMContentLoaded', () => {
    const cardsList = document.getElementById('cards-list');
    const addButton = document.getElementById('add-tariff-btn');
    const saveButton = document.getElementById('save-tariffs-btn');
    const cancelButton = document.getElementById('cancel-changes-btn');

    let tariffs = [];

    // Рендер таблицы тарифов с редактируемыми полями
    function renderTariffs() {
        if (!tariffs.length) {
            cardsList.innerHTML = '<p>Тарифы не найдены.</p>';
            return;
        }
        const table = document.createElement('table');
        table.style.width = '100%';
        table.border = '1';

        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>ID Тарифа</th>
                <th>Длительность</th>
                <th>Цена</th>
                <th>Количество посещений</th>
                <th>Действия</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tariffs.forEach((tariff, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = index;
            tr.innerHTML = `
                <td>${tariff.ID_Tariph}</td>
                <td><input type="number" value="${tariff.Duration}" /></td>
                <td><input type="number" value="${tariff.Price}" /></td>
                <td><input type="number" value="${tariff.Visit}" /></td>
                <td><button class="delete-btn">Удалить</button></td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        cardsList.innerHTML = '';
        cardsList.appendChild(table);

        // Обработчики удаления
        tbody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                const row = e.target.closest('tr');
                const idx = row.dataset.index;
                const tariff = tariffs[idx];
                if (tariff) {
                    try {
                        await remove(ref(db, `Tariph/${tariff.ID_Tariph}`));
                        tariffs.splice(idx, 1);
                        renderTariffs();
                        alert('Тариф удалён.');
                    } catch (error) {
                        console.error('Ошибка удаления тарифа:', error);
                        alert('Ошибка при удалении тарифа.');
                    }
                }
            });
        });
    }

    // Загрузка тарифов из Firebase
    async function loadTariffs() {
        try {
            const snapshot = await get(tariffsRef);
            const data = snapshot.val();
            if (!data) return [];
            return Object.entries(data).map(([key, value]) => ({
                ID_Tariph: Number(key),
                Duration: value.Duration,
                Price: value.Price,
                Visit: value.Visit
            })).sort((a, b) => a.ID_Tariph - b.ID_Tariph);
        } catch (error) {
            console.error('Ошибка загрузки тарифов:', error);
            return [];
        }
    }

    // Сохранение тарифов в Firebase
    async function saveTariffs(data) {
        try {
            const updates = {};
            data.forEach(tariff => {
                updates[tariff.ID_Tariph] = {
                    Duration: Number(tariff.Duration),
                    Price: Number(tariff.Price),
                    Visit: Number(tariff.Visit),
                    ID_Tariph: Number(tariff.ID_Tariph)
                };
            });
            await update(tariffsRef, updates);
        } catch (error) {
            console.error('Ошибка сохранения тарифов:', error);
            throw error;
        }
    }

    // Добавление нового тарифа
    addButton.addEventListener('click', () => {
        const newId = tariffs.length ? Math.max(...tariffs.map(t => t.ID_Tariph)) + 1 : 1;
        tariffs.push({ ID_Tariph: newId, Duration: 0, Price: 0, Visit: 0 });
        renderTariffs();
    });

    // Сохранение изменений
    saveButton.addEventListener('click', async () => {
        const table = cardsList.querySelector('table');
        if (!table) return;

        const newTariffs = [];
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            const id = parseInt(row.children[0].textContent);
            const duration = parseInt(inputs[0].value);
            const price = parseFloat(inputs[1].value);
            const visit = parseInt(inputs[2].value);

            if (!isNaN(duration) && !isNaN(price) && !isNaN(visit)) {
                newTariffs.push({ ID_Tariph: id, Duration: duration, Price: price, Visit: visit });
            }
        });

        try {
            await saveTariffs(newTariffs);
            tariffs = newTariffs;
            renderTariffs();
            alert('Тарифы успешно сохранены.');
        } catch (error) {
            alert('Ошибка при сохранении тарифов.');
        }
    });

    // Отмена изменений - перезагрузка данных
    cancelButton.addEventListener('click', async () => {
        tariffs = await loadTariffs();
        renderTariffs();
    });

    // Инициализация
    (async () => {
        tariffs = await loadTariffs();
        renderTariffs();
    })();
});
