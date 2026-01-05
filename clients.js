// clients.js
// CRUD, tri, filtre, pagination, export CSV pour Clients (structure de base)

class ClientService {
    constructor() {
        this.clients = [
            { id: 1, nom: "Mohamed Amrani", email: "mamrani@client.com", telephone: "0700000001", statut: "Actif" },
            { id: 2, nom: "Julie Bernard", email: "jbernard@client.com", telephone: "0700000002", statut: "Inactif" },
            { id: 3, nom: "Karim Lahlou", email: "klahlou@client.com", telephone: "0700000003", statut: "Actif" },
            { id: 4, nom: "Nadia El Fassi", email: "nelfassi@client.com", telephone: "0700000004", statut: "Actif" },
            { id: 5, nom: "Pierre Morel", email: "pmorel@client.com", telephone: "0700000005", statut: "Inactif" }
        ];
        this.lastId = 5;
    }
    getAll() { return [...this.clients]; }
    getById(id) { return this.clients.find(c => c.id === id); }
    add(client) { this.lastId++; client.id = this.lastId; this.clients.push(client); }
    update(id, data) {
        const idx = this.clients.findIndex(c => c.id === id);
        if (idx !== -1) { this.clients[idx] = { ...this.clients[idx], ...data }; }
    }
    delete(id) { this.clients = this.clients.filter(c => c.id !== id); }
}

// DOM & UI Logic
const clientService = new ClientService();
let currentPage = 1;
const pageSize = 5;
let currentSort = '';
let currentFilter = '';
let editingClientId = null;
let deleteClientId = null;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.p-4.border-2');
    if (!container) return;
    container.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div class="flex gap-2">
                <button id="addClientBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"><i class="fa-solid fa-plus mr-2"></i>Ajouter un client</button>
                <button id="exportCsvBtn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center"><i class="fa-solid fa-file-csv mr-2"></i>Export CSV</button>
            </div>
            <div class="flex gap-2">
                <select id="filterStatut" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="">Tous statuts</option>
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                </select>
                <select id="sortNom" class="border border-gray-300 rounded px-2 py-1 text-sm">
                    <option value="">Tri par nom</option>
                    <option value="asc">Nom A-Z</option>
                    <option value="desc">Nom Z-A</option>
                </select>
            </div>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full bg-white rounded shadow text-sm" id="clientsTable">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-2">ID</th>
                        <th class="px-4 py-2">Nom</th>
                        <th class="px-4 py-2">Email</th>
                        <th class="px-4 py-2">Téléphone</th>
                        <th class="px-4 py-2">Statut</th>
                        <th class="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody id="clientsTableBody"></tbody>
            </table>
        </div>
        <div class="flex justify-between items-center mt-4">
            <div id="pagination" class="flex gap-1"></div>
            <div class="text-xs text-gray-500" id="clientsCount"></div>
        </div>
        <!-- Modal Ajout/Edition -->
        <div id="clientModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button id="closeModalBtn" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><i class="fa-solid fa-xmark text-xl"></i></button>
                <h2 id="modalTitle" class="text-lg font-bold mb-4">Ajouter un client</h2>
                <form id="clientForm" class="space-y-4">
                    <input type="hidden" id="clientId">
                    <div>
                        <label class="block text-sm font-medium">Nom</label>
                        <input type="text" id="clientNom" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Email</label>
                        <input type="email" id="clientEmail" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Téléphone</label>
                        <input type="text" id="clientTelephone" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Statut</label>
                        <select id="clientStatut" required class="w-full border border-gray-300 rounded px-2 py-1">
                            <option value="Actif">Actif</option>
                            <option value="Inactif">Inactif</option>
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
                <p class="mb-4">Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.</p>
                <div class="flex justify-end gap-2">
                    <button id="cancelDeleteBtn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Annuler</button>
                    <button id="confirmDeleteBtn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Supprimer</button>
                </div>
            </div>
        </div>
    `;

    // Elements
    const tableBody = document.getElementById('clientsTableBody');
    const paginationDiv = document.getElementById('pagination');
    const clientsCount = document.getElementById('clientsCount');
    const filterStatut = document.getElementById('filterStatut');
    const sortNom = document.getElementById('sortNom');
    const addClientBtn = document.getElementById('addClientBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    // Modal
    const clientModal = document.getElementById('clientModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const clientForm = document.getElementById('clientForm');
    const modalTitle = document.getElementById('modalTitle');
    const clientIdInput = document.getElementById('clientId');
    const clientNom = document.getElementById('clientNom');
    const clientEmail = document.getElementById('clientEmail');
    const clientTelephone = document.getElementById('clientTelephone');
    const clientStatut = document.getElementById('clientStatut');
    // Delete Modal
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    function getFilteredSortedClients() {
        let clients = clientService.getAll();
        if (currentFilter) {
            clients = clients.filter(c => c.statut === currentFilter);
        }
        if (currentSort === 'asc') {
            clients = clients.sort((a, b) => a.nom.localeCompare(b.nom));
        } else if (currentSort === 'desc') {
            clients = clients.sort((a, b) => b.nom.localeCompare(a.nom));
        }
        return clients;
    }

    function renderTable() {
        const clients = getFilteredSortedClients();
        const total = clients.length;
        const start = (currentPage - 1) * pageSize;
        const pageClients = clients.slice(start, start + pageSize);
        tableBody.innerHTML = '';
        for (const client of pageClients) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-2">${client.id}</td>
                <td class="px-4 py-2">${client.nom}</td>
                <td class="px-4 py-2">${client.email}</td>
                <td class="px-4 py-2">${client.telephone}</td>
                <td class="px-4 py-2">${client.statut}</td>
                <td class="px-4 py-2 flex gap-2">
                    <button class="text-green-600 hover:text-green-800 edit-client-btn" data-id="${client.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-600 hover:text-red-800 delete-client-btn" data-id="${client.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        }
        clientsCount.textContent = `Affichage ${start + 1}-${Math.min(start + pageSize, total)} sur ${total} clients`;
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
    sortNom.addEventListener('change', e => {
        currentSort = e.target.value;
        renderTable();
    });

    addClientBtn.addEventListener('click', () => {
        editingClientId = null;
        clientForm.reset();
        clientIdInput.value = '';
        modalTitle.textContent = 'Ajouter un client';
        clientModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => {
        clientModal.classList.add('hidden');
    });
    clientForm.addEventListener('submit', e => {
        e.preventDefault();
        const client = {
            nom: clientNom.value,
            email: clientEmail.value,
            telephone: clientTelephone.value,
            statut: clientStatut.value
        };
        if (clientIdInput.value) {
            clientService.update(parseInt(clientIdInput.value, 10), client);
        } else {
            clientService.add(client);
        }
        clientModal.classList.add('hidden');
        renderTable();
    });

    tableBody.addEventListener('click', e => {
        if (e.target.closest('.edit-client-btn')) {
            const id = parseInt(e.target.closest('.edit-client-btn').dataset.id, 10);
            const client = clientService.getById(id);
            if (client) {
                clientIdInput.value = client.id;
                clientNom.value = client.nom;
                clientEmail.value = client.email;
                clientTelephone.value = client.telephone;
                clientStatut.value = client.statut;
                modalTitle.textContent = 'Modifier le client';
                clientModal.classList.remove('hidden');
            }
        } else if (e.target.closest('.delete-client-btn')) {
            deleteClientId = parseInt(e.target.closest('.delete-client-btn').dataset.id, 10);
            confirmDeleteModal.classList.remove('hidden');
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        confirmDeleteModal.classList.add('hidden');
        deleteClientId = null;
    });
    confirmDeleteBtn.addEventListener('click', () => {
        if (deleteClientId !== null) {
            clientService.delete(deleteClientId);
            renderTable();
        }
        confirmDeleteModal.classList.add('hidden');
        deleteClientId = null;
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            clientModal.classList.add('hidden');
            confirmDeleteModal.classList.add('hidden');
        }
    });

    exportCsvBtn.addEventListener('click', () => {
        const clients = getFilteredSortedClients();
        const start = (currentPage - 1) * pageSize;
        const pageClients = clients.slice(start, start + pageSize);
        let csv = 'ID,Nom,Email,Téléphone,Statut\n';
        for (const c of pageClients) {
            csv += `${c.id},"${c.nom}",${c.email},${c.telephone},${c.statut}\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clients.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Initial render
    renderTable();
});
