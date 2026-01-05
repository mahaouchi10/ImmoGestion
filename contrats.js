// contrats.js
// CRUD, tri, filtre, pagination, export CSV pour Contrats (structure de base)

class ContratService {
    constructor() {
        this.contrats = [
            { id: 1, bien: "Appartement Centre Ville", client: "Mohamed Amrani", date: "2026-01-22", montant: 1200000, statut: "Signé" },
            { id: 2, bien: "Villa Bord de Mer", client: "Julie Bernard", date: "2026-01-25", montant: 4500000, statut: "En attente" },
            { id: 3, bien: "Maison Familiale", client: "Karim Lahlou", date: "2026-01-28", montant: 1800000, statut: "Annulé" },
            { id: 4, bien: "Bureau Plateau", client: "Nadia El Fassi", date: "2026-02-01", montant: 900000, statut: "Signé" },
            { id: 5, bien: "Appartement Moderne", client: "Pierre Morel", date: "2026-02-05", montant: 1350000, statut: "En attente" }
        ];
        this.lastId = 5;
    }
    getAll() { return [...this.contrats]; }
    getById(id) { return this.contrats.find(c => c.id === id); }
    add(contrat) { this.lastId++; contrat.id = this.lastId; this.contrats.push(contrat); }
    update(id, data) {
        const idx = this.contrats.findIndex(c => c.id === id);
        if (idx !== -1) { this.contrats[idx] = { ...this.contrats[idx], ...data }; }
    }
    delete(id) { this.contrats = this.contrats.filter(c => c.id !== id); }
}

// DOM & UI Logic
const contratService = new ContratService();
let currentPage = 1;
const pageSize = 5;
let currentSort = '';
let currentFilter = '';
let editingContratId = null;
let deleteContratId = null;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.p-4.border-2');
    if (!container) return;
    container.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div class="flex gap-2">
                <button id="addContratBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"><i class="fa-solid fa-plus mr-2"></i>Ajouter un contrat</button>
                <button id="exportCsvBtn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center"><i class="fa-solid fa-file-csv mr-2"></i>Export CSV</button>
            </div>
            <div class="flex gap-2">
                <select id="filterStatut" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="">Tous statuts</option>
                    <option value="Signé">Signé</option>
                    <option value="En attente">En attente</option>
                    <option value="Annulé">Annulé</option>
                </select>
                <select id="sortDate" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="">Tri par date</option>
                    <option value="asc">Date croissante</option>
                    <option value="desc">Date décroissante</option>
                </select>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded shadow text-sm" id="contratsTable">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2">ID</th>
                        <th class="px-4 py-2">Bien</th>
                        <th class="px-4 py-2">Client</th>
                        <th class="px-4 py-2">Date</th>
                        <th class="px-4 py-2">Montant</th>
                        <th class="px-4 py-2">Statut</th>
                        <th class="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody id="contratsTableBody"></tbody>
            </table>
        </div>
        <div class="flex justify-between items-center mt-4">
            <div id="pagination" class="flex gap-1"></div>
            <div class="text-xs text-gray-500" id="contratsCount"></div>
        </div>
        <!-- Modal Ajout/Edition -->
        <div id="contratModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button id="closeModalBtn" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><i class="fa-solid fa-xmark text-xl"></i></button>
                <h2 id="modalTitle" class="text-lg font-bold mb-4">Ajouter un contrat</h2>
                <form id="contratForm" class="space-y-4">
                    <input type="hidden" id="contratId">
                    <div>
                        <label class="block text-sm font-medium">Bien</label>
                        <input type="text" id="contratBien" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Client</label>
                        <input type="text" id="contratClient" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Date</label>
                        <input type="date" id="contratDate" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Montant (DH)</label>
                        <input type="number" id="contratMontant" required min="0" class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Statut</label>
                        <select id="contratStatut" required class="w-full border border-gray-300 rounded px-2 py-1">
                            <option value="Signé">Signé</option>
                            <option value="En attente">En attente</option>
                            <option value="Annulé">Annulé</option>
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
                <p class="mb-4">Êtes-vous sûr de vouloir supprimer ce contrat ? Cette action est irréversible.</p>
                <div class="flex justify-end gap-2">
                    <button id="cancelDeleteBtn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Annuler</button>
                    <button id="confirmDeleteBtn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Supprimer</button>
                </div>
            </div>
        </div>
    `;

    // Elements
    const tableBody = document.getElementById('contratsTableBody');
    const paginationDiv = document.getElementById('pagination');
    const contratsCount = document.getElementById('contratsCount');
    const filterStatut = document.getElementById('filterStatut');
    const sortDate = document.getElementById('sortDate');
    const addContratBtn = document.getElementById('addContratBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    // Modal
    const contratModal = document.getElementById('contratModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const contratForm = document.getElementById('contratForm');
    const modalTitle = document.getElementById('modalTitle');
    const contratIdInput = document.getElementById('contratId');
    const contratBien = document.getElementById('contratBien');
    const contratClient = document.getElementById('contratClient');
    const contratDate = document.getElementById('contratDate');
    const contratMontant = document.getElementById('contratMontant');
    const contratStatut = document.getElementById('contratStatut');
    // Delete Modal
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    function getFilteredSortedContrats() {
        let contrats = contratService.getAll();
        if (currentFilter) {
            contrats = contrats.filter(c => c.statut === currentFilter);
        }
        if (currentSort === 'asc') {
            contrats = contrats.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (currentSort === 'desc') {
            contrats = contrats.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        return contrats;
    }

    function renderTable() {
        const contrats = getFilteredSortedContrats();
        const total = contrats.length;
        const start = (currentPage - 1) * pageSize;
        const pageContrats = contrats.slice(start, start + pageSize);
        tableBody.innerHTML = '';
        for (const contrat of pageContrats) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-2">${contrat.id}</td>
                <td class="px-4 py-2">${contrat.bien}</td>
                <td class="px-4 py-2">${contrat.client}</td>
                <td class="px-4 py-2">${contrat.date}</td>
                <td class="px-4 py-2">${contrat.montant.toLocaleString()} DH</td>
                <td class="px-4 py-2">${contrat.statut}</td>
                <td class="px-4 py-2 flex gap-2">
                    <button class="text-green-600 hover:text-green-800 edit-contrat-btn" data-id="${contrat.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-600 hover:text-red-800 delete-contrat-btn" data-id="${contrat.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        }
        contratsCount.textContent = `Affichage ${start + 1}-${Math.min(start + pageSize, total)} sur ${total} contrats`;
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

    addContratBtn.addEventListener('click', () => {
        editingContratId = null;
        contratForm.reset();
        contratIdInput.value = '';
        modalTitle.textContent = 'Ajouter un contrat';
        contratModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => {
        contratModal.classList.add('hidden');
    });
    contratForm.addEventListener('submit', e => {
        e.preventDefault();
        const contrat = {
            bien: contratBien.value,
            client: contratClient.value,
            date: contratDate.value,
            montant: parseInt(contratMontant.value, 10),
            statut: contratStatut.value
        };
        if (contratIdInput.value) {
            contratService.update(parseInt(contratIdInput.value, 10), contrat);
        } else {
            contratService.add(contrat);
        }
        contratModal.classList.add('hidden');
        renderTable();
    });

    tableBody.addEventListener('click', e => {
        if (e.target.closest('.edit-contrat-btn')) {
            const id = parseInt(e.target.closest('.edit-contrat-btn').dataset.id, 10);
            const contrat = contratService.getById(id);
            if (contrat) {
                contratIdInput.value = contrat.id;
                contratBien.value = contrat.bien;
                contratClient.value = contrat.client;
                contratDate.value = contrat.date;
                contratMontant.value = contrat.montant;
                contratStatut.value = contrat.statut;
                modalTitle.textContent = 'Modifier le contrat';
                contratModal.classList.remove('hidden');
            }
        } else if (e.target.closest('.delete-contrat-btn')) {
            deleteContratId = parseInt(e.target.closest('.delete-contrat-btn').dataset.id, 10);
            confirmDeleteModal.classList.remove('hidden');
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        confirmDeleteModal.classList.add('hidden');
        deleteContratId = null;
    });
    confirmDeleteBtn.addEventListener('click', () => {
        if (deleteContratId !== null) {
            contratService.delete(deleteContratId);
            renderTable();
        }
        confirmDeleteModal.classList.add('hidden');
        deleteContratId = null;
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            contratModal.classList.add('hidden');
            confirmDeleteModal.classList.add('hidden');
        }
    });

    exportCsvBtn.addEventListener('click', () => {
        const contrats = getFilteredSortedContrats();
        const start = (currentPage - 1) * pageSize;
        const pageContrats = contrats.slice(start, start + pageSize);
        let csv = 'ID,Bien,Client,Date,Montant,Statut\n';
        for (const c of pageContrats) {
            csv += `${c.id},"${c.bien}","${c.client}",${c.date},${c.montant},${c.statut}\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contrats.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Initial render
    renderTable();
});
