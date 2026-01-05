// agents.js
// CRUD, tri, filtre, pagination, export CSV pour Agents (structure de base)

class AgentService {
    constructor() {
        this.agents = [
            { id: 1, nom: "Ahmed Benali", email: "abenali@immo.com", telephone: "0600000001", statut: "Actif" },
            { id: 2, nom: "Sophie Martin", email: "smartin@immo.com", telephone: "0600000002", statut: "Inactif" },
            { id: 3, nom: "Youssef El Idrissi", email: "yidrissi@immo.com", telephone: "0600000003", statut: "Actif" },
            { id: 4, nom: "Fatima Zahra", email: "fzahra@immo.com", telephone: "0600000004", statut: "Actif" },
            { id: 5, nom: "Jean Dupont", email: "jdupont@immo.com", telephone: "0600000005", statut: "Inactif" }
        ];
        this.lastId = 5;
    }
    getAll() { return [...this.agents]; }
    getById(id) { return this.agents.find(a => a.id === id); }
    add(agent) { this.lastId++; agent.id = this.lastId; this.agents.push(agent); }
    update(id, data) {
        const idx = this.agents.findIndex(a => a.id === id);
        if (idx !== -1) { this.agents[idx] = { ...this.agents[idx], ...data }; }
    }
    delete(id) { this.agents = this.agents.filter(a => a.id !== id); }
}

// DOM & UI Logic
const agentService = new AgentService();
let currentPage = 1;
const pageSize = 5;
let currentSort = '';
let currentFilter = '';
let editingAgentId = null;
let deleteAgentId = null;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.p-4.border-2');
    if (!container) return;
    container.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <div class="flex gap-2">
                <button id="addAgentBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"><i class="fa-solid fa-plus mr-2"></i>Ajouter un agent</button>
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
            <table class="min-w-full bg-white rounded shadow text-sm" id="agentsTable">
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
                <tbody id="agentsTableBody"></tbody>
            </table>
        </div>
        <div class="flex justify-between items-center mt-4">
            <div id="pagination" class="flex gap-1"></div>
            <div class="text-xs text-gray-500" id="agentsCount"></div>
        </div>
        <!-- Modal Ajout/Edition -->
        <div id="agentModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button id="closeModalBtn" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><i class="fa-solid fa-xmark text-xl"></i></button>
                <h2 id="modalTitle" class="text-lg font-bold mb-4">Ajouter un agent</h2>
                <form id="agentForm" class="space-y-4">
                    <input type="hidden" id="agentId">
                    <div>
                        <label class="block text-sm font-medium">Nom</label>
                        <input type="text" id="agentNom" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Email</label>
                        <input type="email" id="agentEmail" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Téléphone</label>
                        <input type="text" id="agentTelephone" required class="w-full border border-gray-300 rounded px-2 py-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium">Statut</label>
                        <select id="agentStatut" required class="w-full border border-gray-300 rounded px-2 py-1">
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
                <p class="mb-4">Êtes-vous sûr de vouloir supprimer cet agent ? Cette action est irréversible.</p>
                <div class="flex justify-end gap-2">
                    <button id="cancelDeleteBtn" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">Annuler</button>
                    <button id="confirmDeleteBtn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Supprimer</button>
                </div>
            </div>
        </div>
    `;

    // Elements
    const tableBody = document.getElementById('agentsTableBody');
    const paginationDiv = document.getElementById('pagination');
    const agentsCount = document.getElementById('agentsCount');
    const filterStatut = document.getElementById('filterStatut');
    const sortNom = document.getElementById('sortNom');
    const addAgentBtn = document.getElementById('addAgentBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    // Modal
    const agentModal = document.getElementById('agentModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const agentForm = document.getElementById('agentForm');
    const modalTitle = document.getElementById('modalTitle');
    const agentIdInput = document.getElementById('agentId');
    const agentNom = document.getElementById('agentNom');
    const agentEmail = document.getElementById('agentEmail');
    const agentTelephone = document.getElementById('agentTelephone');
    const agentStatut = document.getElementById('agentStatut');
    // Delete Modal
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    function getFilteredSortedAgents() {
        let agents = agentService.getAll();
        if (currentFilter) {
            agents = agents.filter(a => a.statut === currentFilter);
        }
        if (currentSort === 'asc') {
            agents = agents.sort((a, b) => a.nom.localeCompare(b.nom));
        } else if (currentSort === 'desc') {
            agents = agents.sort((a, b) => b.nom.localeCompare(a.nom));
        }
        return agents;
    }

    function renderTable() {
        const agents = getFilteredSortedAgents();
        const total = agents.length;
        const start = (currentPage - 1) * pageSize;
        const pageAgents = agents.slice(start, start + pageSize);
        tableBody.innerHTML = '';
        for (const agent of pageAgents) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-4 py-2">${agent.id}</td>
                <td class="px-4 py-2">${agent.nom}</td>
                <td class="px-4 py-2">${agent.email}</td>
                <td class="px-4 py-2">${agent.telephone}</td>
                <td class="px-4 py-2">${agent.statut}</td>
                <td class="px-4 py-2 flex gap-2">
                    <button class="text-green-600 hover:text-green-800 edit-agent-btn" data-id="${agent.id}"><i class="fa-solid fa-pen"></i></button>
                    <button class="text-red-600 hover:text-red-800 delete-agent-btn" data-id="${agent.id}"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        }
        agentsCount.textContent = `Affichage ${start + 1}-${Math.min(start + pageSize, total)} sur ${total} agents`;
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

    addAgentBtn.addEventListener('click', () => {
        editingAgentId = null;
        agentForm.reset();
        agentIdInput.value = '';
        modalTitle.textContent = 'Ajouter un agent';
        agentModal.classList.remove('hidden');
    });
    closeModalBtn.addEventListener('click', () => {
        agentModal.classList.add('hidden');
    });
    agentForm.addEventListener('submit', e => {
        e.preventDefault();
        const agent = {
            nom: agentNom.value,
            email: agentEmail.value,
            telephone: agentTelephone.value,
            statut: agentStatut.value
        };
        if (agentIdInput.value) {
            agentService.update(parseInt(agentIdInput.value, 10), agent);
        } else {
            agentService.add(agent);
        }
        agentModal.classList.add('hidden');
        renderTable();
    });

    tableBody.addEventListener('click', e => {
        if (e.target.closest('.edit-agent-btn')) {
            const id = parseInt(e.target.closest('.edit-agent-btn').dataset.id, 10);
            const agent = agentService.getById(id);
            if (agent) {
                agentIdInput.value = agent.id;
                agentNom.value = agent.nom;
                agentEmail.value = agent.email;
                agentTelephone.value = agent.telephone;
                agentStatut.value = agent.statut;
                modalTitle.textContent = 'Modifier l\'agent';
                agentModal.classList.remove('hidden');
            }
        } else if (e.target.closest('.delete-agent-btn')) {
            deleteAgentId = parseInt(e.target.closest('.delete-agent-btn').dataset.id, 10);
            confirmDeleteModal.classList.remove('hidden');
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        confirmDeleteModal.classList.add('hidden');
        deleteAgentId = null;
    });
    confirmDeleteBtn.addEventListener('click', () => {
        if (deleteAgentId !== null) {
            agentService.delete(deleteAgentId);
            renderTable();
        }
        confirmDeleteModal.classList.add('hidden');
        deleteAgentId = null;
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            agentModal.classList.add('hidden');
            confirmDeleteModal.classList.add('hidden');
        }
    });

    exportCsvBtn.addEventListener('click', () => {
        const agents = getFilteredSortedAgents();
        const start = (currentPage - 1) * pageSize;
        const pageAgents = agents.slice(start, start + pageSize);
        let csv = 'ID,Nom,Email,Téléphone,Statut\n';
        for (const a of pageAgents) {
            csv += `${a.id},"${a.nom}",${a.email},${a.telephone},${a.statut}\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'agents.csv';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Initial render
    renderTable();
});
