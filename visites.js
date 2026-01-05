// visites.js
// CRUD, tri, filtre, pagination, export CSV pour Visites (structure de base)

class VisiteService {
    constructor() {
        this.visites = [
            { id: 1, bien: "Appartement Centre Ville", client: "Mohamed Amrani", date: "2026-01-10", agent: "Ahmed Benali", statut: "Planifiée" },
            { id: 2, bien: "Villa Bord de Mer", client: "Julie Bernard", date: "2026-01-12", agent: "Sophie Martin", statut: "Réalisée" },
            { id: 3, bien: "Maison Familiale", client: "Karim Lahlou", date: "2026-01-15", agent: "Youssef El Idrissi", statut: "Annulée" },
            { id: 4, bien: "Bureau Plateau", client: "Nadia El Fassi", date: "2026-01-18", agent: "Fatima Zahra", statut: "Planifiée" },
            { id: 5, bien: "Appartement Moderne", client: "Pierre Morel", date: "2026-01-20", agent: "Jean Dupont", statut: "Réalisée" }
        ];
        this.lastId = 5;
    }
    getAll() { return [...this.visites]; }
    getById(id) { return this.visites.find(v => v.id === id); }
    add(visite) { this.lastId++; visite.id = this.lastId; this.visites.push(visite); }
    update(id, data) {
        const idx = this.visites.findIndex(v => v.id === id);
        if (idx !== -1) { this.visites[idx] = { ...this.visites[idx], ...data }; }
    }
    delete(id) { this.visites = this.visites.filter(v => v.id !== id); }
}

// DOM & UI Logic
const visiteService = new VisiteService();
let currentPage = 1;
const pageSize = 5;
let currentSort = '';
let currentFilter = '';
let editingVisiteId = null;
let deleteVisiteId = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.p-4.border-2');
    if (!container) return;
    container.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div class="flex gap-2">
                <button id="addVisiteBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"><i class="fa-solid fa-plus mr-2"></i>Ajouter une visite</button>
                <button id="exportCsvBtn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center"><i class="fa-solid fa-file-csv mr-2"></i>Export CSV</button>
            </div>
            <div class="flex gap-2">
                <select id="filterStatut" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="">Tous statuts</option>
                    <option value="Planifiée">Planifiée</option>
                    <option value="Réalisée">Réalisée</option>
                    <option value="Annulée">Annulée</option>
                </select>
                <select id="sortDate" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="">Tri par date</option>
                    <option value="asc">Date croissante</option>
                    <option value="desc">Date décroissante</option>
                </select>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded shadow text-sm" id="visitesTable">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2">ID</th>
                        <th class="px-4 py-2">Bien</th>
                        <th class="px-4 py-2">Client</th>
                        <th class="px-4 py-2">Date</th>
                        <th class="px-4 py-2">Agent</th>
                        <th class="px-4 py-2">Statut</th>
                        <th class="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody id="visitesTableBody"></tbody>
            </table>
        </div>
        <div class="flex justify-between items-center mt-4">
            <div id="pagination" class="flex gap-1"></div>
            <div class="text-xs text-gray-500" id="visitesCount"></div>
        </div>
        <!-- Modal Ajout/Edition -->
        <div id="visiteModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button id="closeModalBtn" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><i class="fa-solid fa-xmark text-xl"></i></button>
                <h2 id="modalTitle" class="text-lg font-bold mb-4">Ajouter une visite</h2>
                <form id="visiteForm" class="space-y-4">
                    <input type="hidden" id="visiteId">
                    <div>
                        <label class="block text-sm font-medium">Bien</label>
                        <input type="text" id="visiteBien" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Client</label>
                        <input type="text" id="visiteClient" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Date</label>
                        <input type="date" id="visiteDate" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Agent</label>
                        <input type="text" id="visiteAgent" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Statut</label>
                        <select id="visiteStatut" required class="w-full border border-gray-300 rounded px-2 py-1">
                            <option value="Planifiée">Planifiée</option>
                            <option value="Réalisée">Réalisée</option>
                            <option value="Annulée">Annulée</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
        <!-- Pop-up confirmation suppression -->
        <div id="confirmDeleteModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
                <h2 class="text-lg font-bold mb-4">Confirmer la suppression</h2>
                <p class="mb-4">Êtes-vous sûr de vouloir supprimer cette visite ? Cette action est irréversible.</p>
                <div class="flex justify-end gap-2">
                    <button id="cancelDeleteBtn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Annuler</button>
                    <button id="confirmDeleteBtn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Supprimer</button>
                </div>
            </div>
        </div>
    `;

    // Elements
    const tableBody = document.getElementById('visitesTableBody');
    const paginationDiv = document.getElementById('pagination');
    const visitesCount = document.getElementById('visitesCount');
    const filterStatut = document.getElementById('filterStatut');
    const sortDate = document.getElementById('sortDate');
    const addVisiteBtn = document.getElementById('addVisiteBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    // Modal
    const visiteModal = document.getElementById('visiteModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const visiteForm = document.getElementById('visiteForm');
    const modalTitle = document.getElementById('modalTitle');
    const visiteIdInput = document.getElementById('visiteId');
    const visiteBien = document.getElementById('visiteBien');
    const visiteClient = document.getElementById('visiteClient');
    const visiteDate = document.getElementById('visiteDate');
    const visiteAgent = document.getElementById('visiteAgent');
    const visiteStatut = document.getElementById('visiteStatut');
    // Delete Modal
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    function getFilteredSortedVisites() {
        let visites = visiteService.getAll();
        if (currentFilter) {
            visites = visites.filter(v => v.statut === currentFilter);
        }
        if (currentSort === 'asc') {
            visites = visites.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (currentSort === 'desc') {
            visites = visites.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        return visites;
    }

    function renderTable() {
        const visites = getFilteredSortedVisites();
        const total = visites.length;
        const start = (currentPage - 1) * pageSize;
        const pageVisites = visites.slice(start, start + pageSize);
        tableBody.innerHTML = '';
        for (const visite of pageVisites) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-2">${visite.id}</td>
                <td class="px-4 py-2">${visite.bien}</td>
                <td class="px-4 py-2">${visite.client}</td>
                <td class="px-4 py-2">${visite.date}</td>
                <td class="px-4 py-2">${visite.agent}</td>
                <td class="px-4 py-2">${visite.statut}</td>
                <td class="px-4 py-2 flex gap-2">
                    <button class="text-green-600 hover:text-green-800 edit-visite-btn" data-id="${visite.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-600 hover:text-red-800 delete-visite-btn" data-id="${visite.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        }
        visitesCount.textContent = `Affichage ${start + 1}-${Math.min(start + pageSize, total)} sur ${total} visites`;
        renderPagination(total);
    }

    function renderPagination(total) {
        const pageCount = Math.ceil(total / pageSize);
        paginationDiv.innerHTML = '';
        for (let i = 1; i <= pageCount; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = `px-2 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`;
            btn.addEventListener('click', () => {
                currentPage = i;
                renderTable();
            });
            paginationDiv.appendChild(btn);
        }
    }

    filterStatut.addEventListener('change', e => {
        currentFilter = e.target.value;
        currentPage = 1;
        renderTable();
    });
    sortDate.addEventListener('change', e => {
        currentSort = e.target.value;
        renderTable();
    });

    addVisiteBtn.addEventListener('click', () => {
        editingVisiteId = null;
        visiteForm.reset();
        visiteIdInput.value = '';
        modalTitle.textContent = 'Ajouter une visite';
        visiteModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => {
        visiteModal.classList.add('hidden');
    });
    visiteForm.addEventListener('submit', e => {
        e.preventDefault();
        const visite = {
            bien: visiteBien.value,
            client: visiteClient.value,
            date: visiteDate.value,
            agent: visiteAgent.value,
            statut: visiteStatut.value
        };
        if (visiteIdInput.value) {
            visiteService.update(parseInt(visiteIdInput.value, 10), visite);
        } else {
            visiteService.add(visite);
        }
        visiteModal.classList.add('hidden');
        renderTable();
    });

    tableBody.addEventListener('click', e => {
        if (e.target.closest('.edit-visite-btn')) {
            const id = parseInt(e.target.closest('.edit-visite-btn').dataset.id, 10);
            const visite = visiteService.getById(id);
            if (visite) {
                visiteIdInput.value = visite.id;
                visiteBien.value = visite.bien;
                visiteClient.value = visite.client;
                visiteDate.value = visite.date;
                visiteAgent.value = visite.agent;
                visiteStatut.value = visite.statut;
                modalTitle.textContent = 'Modifier la visite';
                visiteModal.classList.remove('hidden');
            }
        } else if (e.target.closest('.delete-visite-btn')) {
            deleteVisiteId = parseInt(e.target.closest('.delete-visite-btn').dataset.id, 10);
            confirmDeleteModal.classList.remove('hidden');
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        confirmDeleteModal.classList.add('hidden');
        deleteVisiteId = null;
    });
    confirmDeleteBtn.addEventListener('click', () => {
        if (deleteVisiteId !== null) {
            visiteService.delete(deleteVisiteId);
            renderTable();
        }
        confirmDeleteModal.classList.add('hidden');
        deleteVisiteId = null;
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            visiteModal.classList.add('hidden');
            confirmDeleteModal.classList.add('hidden');
        }
    });

    exportCsvBtn.addEventListener('click', () => {
        const visites = getFilteredSortedVisites();
        const start = (currentPage - 1) * pageSize;
        const pageVisites = visites.slice(start, start + pageSize);
        let csv = 'ID,Bien,Client,Date,Agent,Statut\n';
        for (const v of pageVisites) {
            csv += `${v.id},"${v.bien}","${v.client}",${v.date},"${v.agent}",${v.statut}\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visites.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Initial render
    renderTable();
});
