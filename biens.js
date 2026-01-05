// biens.js
// CRUD, tri, filtre, pagination, export CSV pour Biens Immobiliers

class BienService {
    constructor() {
        this.biens = [
            { id: 1, titre: "Appartement Centre Ville", type: "Appartement", prix: 1200000, adresse: "12 Rue des Fleurs, Casablanca", statut: "Disponible" },
            { id: 2, titre: "Villa Bord de Mer", type: "Villa", prix: 4500000, adresse: "Route d'Azemmour, Casablanca", statut: "Vendu" },
            { id: 3, titre: "Maison Familiale", type: "Maison", prix: 1800000, adresse: "5 Lotissement Al Amal, Rabat", statut: "Disponible" },
            { id: 4, titre: "Bureau Plateau", type: "Bureau", prix: 900000, adresse: "Avenue Hassan II, Casablanca", statut: "Loué" },
            { id: 5, titre: "Appartement Moderne", type: "Appartement", prix: 1350000, adresse: "Quartier Gauthier, Casablanca", statut: "Disponible" },
            { id: 6, titre: "Villa avec Piscine", type: "Villa", prix: 5200000, adresse: "Anfa Supérieur, Casablanca", statut: "Disponible" },
            { id: 7, titre: "Maison Traditionnelle", type: "Maison", prix: 1600000, adresse: "Ancienne Médina, Fès", statut: "Loué" },
            { id: 8, titre: "Bureau Open Space", type: "Bureau", prix: 1100000, adresse: "Technopark, Casablanca", statut: "Disponible" },
            { id: 9, titre: "Appartement Vue Mer", type: "Appartement", prix: 2000000, adresse: "Corniche, Agadir", statut: "Vendu" },
            { id: 10, titre: "Villa Golf", type: "Villa", prix: 6000000, adresse: "Golf City, Marrakech", statut: "Disponible" }
        ];
        this.lastId = 10;
    }
    getAll() {
        return [...this.biens];
    }
    getById(id) {
        return this.biens.find(b => b.id === id);
    }
    add(bien) {
        this.lastId++;
        bien.id = this.lastId;
        this.biens.push(bien);
    }
    update(id, data) {
        const idx = this.biens.findIndex(b => b.id === id);
        if (idx !== -1) {
            this.biens[idx] = { ...this.biens[idx], ...data };
        }
    }
    delete(id) {
        this.biens = this.biens.filter(b => b.id !== id);
    }
}

const bienService = new BienService();

// UI State
let currentPage = 1;
const pageSize = 5;
let currentSort = '';
let currentFilter = '';
let editingBienId = null;
let deleteBienId = null;

// DOM Elements
const tableBody = document.getElementById('biensTableBody');
const paginationDiv = document.getElementById('pagination');
const biensCount = document.getElementById('biensCount');
const filterType = document.getElementById('filterType');
const sortPrice = document.getElementById('sortPrice');
const addBienBtn = document.getElementById('addBienBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');

// Modal
const bienModal = document.getElementById('bienModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const bienForm = document.getElementById('bienForm');
const modalTitle = document.getElementById('modalTitle');
const bienIdInput = document.getElementById('bienId');
const bienTitre = document.getElementById('bienTitre');
const bienType = document.getElementById('bienType');
const bienPrix = document.getElementById('bienPrix');
const bienAdresse = document.getElementById('bienAdresse');
const bienStatut = document.getElementById('bienStatut');

// Delete Modal
const confirmDeleteModal = document.getElementById('confirmDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

function getFilteredSortedBiens() {
    let biens = bienService.getAll();
    if (currentFilter) {
        biens = biens.filter(b => b.type === currentFilter);
    }
    if (currentSort === 'asc') {
        biens = biens.sort((a, b) => a.prix - b.prix);
    } else if (currentSort === 'desc') {
        biens = biens.sort((a, b) => b.prix - a.prix);
    }
    return biens;
}

function renderTable() {
    const biens = getFilteredSortedBiens();
    const total = biens.length;
    const start = (currentPage - 1) * pageSize;
    const pageBiens = biens.slice(start, start + pageSize);
    tableBody.innerHTML = '';
    for (const bien of pageBiens) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="px-4 py-2">${bien.id}</td>
            <td class="px-4 py-2">${bien.titre}</td>
            <td class="px-4 py-2">${bien.type}</td>
            <td class="px-4 py-2">${bien.prix.toLocaleString()} DH</td>
            <td class="px-4 py-2">${bien.adresse}</td>
            <td class="px-4 py-2">${bien.statut}</td>
            <td class="px-4 py-2 flex gap-2">
                <button class="text-blue-600 hover:text-blue-800 see-details-btn" data-id="${bien.id}"><i class="fa-solid fa-eye"></i></button>
                <button class="text-green-600 hover:text-green-800 edit-bien-btn" data-id="${bien.id}"><i class="fa-solid fa-pen"></i></button>
                <button class="text-red-600 hover:text-red-800 delete-bien-btn" data-id="${bien.id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(tr);
    }
    biensCount.textContent = `Affichage ${start + 1}-${Math.min(start + pageSize, total)} sur ${total} biens`;
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

filterType.addEventListener('change', e => {
    currentFilter = e.target.value;
    currentPage = 1;
    renderTable();
});
sortPrice.addEventListener('change', e => {
    currentSort = e.target.value;
    renderTable();
});

addBienBtn.addEventListener('click', () => {
    editingBienId = null;
    bienForm.reset();
    bienIdInput.value = '';
    modalTitle.textContent = 'Ajouter un bien';
    bienModal.classList.remove('hidden');
});
closeModalBtn.addEventListener('click', () => {
    bienModal.classList.add('hidden');
});
bienForm.addEventListener('submit', e => {
    e.preventDefault();
    const bien = {
        titre: bienTitre.value,
        type: bienType.value,
        prix: parseInt(bienPrix.value, 10),
        adresse: bienAdresse.value,
        statut: bienStatut.value
    };
    if (bienIdInput.value) {
        bienService.update(parseInt(bienIdInput.value, 10), bien);
    } else {
        bienService.add(bien);
    }
    bienModal.classList.add('hidden');
    renderTable();
});

tableBody.addEventListener('click', e => {
    if (e.target.closest('.edit-bien-btn')) {
        const id = parseInt(e.target.closest('.edit-bien-btn').dataset.id, 10);
        const bien = bienService.getById(id);
        if (bien) {
            bienIdInput.value = bien.id;
            bienTitre.value = bien.titre;
            bienType.value = bien.type;
            bienPrix.value = bien.prix;
            bienAdresse.value = bien.adresse;
            bienStatut.value = bien.statut;
            modalTitle.textContent = 'Modifier le bien';
            bienModal.classList.remove('hidden');
        }
    } else if (e.target.closest('.delete-bien-btn')) {
        deleteBienId = parseInt(e.target.closest('.delete-bien-btn').dataset.id, 10);
        confirmDeleteModal.classList.remove('hidden');
    } else if (e.target.closest('.see-details-btn')) {
        const id = parseInt(e.target.closest('.see-details-btn').dataset.id, 10);
        window.location.href = `details.html?id=${id}`;
    }
});

cancelDeleteBtn.addEventListener('click', () => {
    confirmDeleteModal.classList.add('hidden');
    deleteBienId = null;
});
confirmDeleteBtn.addEventListener('click', () => {
    if (deleteBienId !== null) {
        bienService.delete(deleteBienId);
        renderTable();
    }
    confirmDeleteModal.classList.add('hidden');
    deleteBienId = null;
});

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        bienModal.classList.add('hidden');
        confirmDeleteModal.classList.add('hidden');
    }
});

exportCsvBtn.addEventListener('click', () => {
    const biens = getFilteredSortedBiens();
    const start = (currentPage - 1) * pageSize;
    const pageBiens = biens.slice(start, start + pageSize);
    let csv = 'ID,Titre,Type,Prix,Adresse,Statut\n';
    for (const b of pageBiens) {
        csv += `${b.id},"${b.titre}",${b.type},${b.prix},"${b.adresse}",${b.statut}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'biens.csv';
    a.click();
    URL.revokeObjectURL(url);
});

// Initial render
renderTable();
