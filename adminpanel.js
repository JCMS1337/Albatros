// adminpanel.js - управление тарифами с использованием Firebase Realtime Database

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, get, set, update, remove, push } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const tariffsRef = ref(db, "Tariphs/ID");

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
                <th>Внутреннее имя</th>
                <th>Отображаемое имя</th>
                <th>Описание</th>
                <th>Цена</th>
                <th>Действия</th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        tariffs.forEach((tariff, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = index;
            tr.innerHTML = `
                <td><input type="text" value="${tariff.name}" /></td>
                <td><input type="text" value="${tariff.displayName || ''}" /></td>
                <td><input type="text" value="${tariff.description}" /></td>
                <td><input type="number" value="${tariff.price}" /></td>
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
                        await remove(ref(db, `Tariphs/ID/${tariff.ID_Tariph}`));
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
                ID_Tariph: key,
                name: value.name || '',
                displayName: value.displayName || '',
                description: value.description || '',
                price: value.price || 0
            })).sort((a, b) => Number(a.ID_Tariph) - Number(b.ID_Tariph));
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
                    name: tariff.name,
                    displayName: tariff.displayName || '',
                    description: tariff.description,
                    price: Number(tariff.price)
                };
            });
            await update(tariffsRef, updates);
        } catch (error) {
            console.error('Ошибка сохранения тарифов:', error);
            throw error;
        }
    }

    // Добавление нового тарифа
    addButton.addEventListener('click', async () => {
        try {
            const newTariffRef = push(tariffsRef);
            const newId = newTariffRef.key;
            await set(newTariffRef, { name: 'Новый тариф', displayName: '', description: 'Описание', price: 0 });
            tariffs.push({ ID_Tariph: newId, name: 'Новый тариф', displayName: '', description: 'Описание', price: 0 });
            renderTariffs();
        } catch (error) {
            console.error('Ошибка добавления тарифа:', error);
            alert('Ошибка при добавлении тарифа.');
        }
    });

    // Сохранение изменений
    saveButton.addEventListener('click', async () => {
        const table = cardsList.querySelector('table');
        if (!table) return;

        const newTariffs = [];
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            const name = inputs[0].value.trim();
            const displayName = inputs[1].value.trim();
            const description = inputs[2].value.trim();
            const price = parseFloat(inputs[3].value);

            if (name && !isNaN(price)) {
                newTariffs.push({ ID_Tariph: tariffs[index].ID_Tariph, name, displayName, description, price });
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
