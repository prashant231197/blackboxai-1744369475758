// Initialize localStorage if not already set
function initializeStorage() {
    if (!localStorage.getItem('menuItems')) {
        localStorage.setItem('menuItems', JSON.stringify([]));
    }
    if (!localStorage.getItem('salesRecords')) {
        localStorage.setItem('salesRecords', JSON.stringify([]));
    }
}

// Format currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toFixed(2);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Menu Management Functions
function addMenuItem(name, price, category, description) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems'));
    const newItem = {
        id: Date.now().toString(),
        name,
        price: parseFloat(price),
        category,
        description
    };
    menuItems.push(newItem);
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    return newItem;
}

function updateMenuItem(id, name, price, category, description) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems'));
    const index = menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
        menuItems[index] = {
            ...menuItems[index],
            name,
            price: parseFloat(price),
            category,
            description
        };
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        return true;
    }
    return false;
}

function deleteMenuItem(id) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems'));
    const filteredItems = menuItems.filter(item => item.id !== id);
    localStorage.setItem('menuItems', JSON.stringify(filteredItems));
}

function getMenuItem(id) {
    const menuItems = JSON.parse(localStorage.getItem('menuItems'));
    return menuItems.find(item => item.id === id);
}

function getAllMenuItems() {
    return JSON.parse(localStorage.getItem('menuItems'));
}

// Sales Management Functions
function recordSale(menuItemId, quantity) {
    const menuItem = getMenuItem(menuItemId);
    if (!menuItem) return null;

    const salesRecords = JSON.parse(localStorage.getItem('salesRecords'));
    const newSale = {
        id: Date.now().toString(),
        menuItemId,
        menuItemName: menuItem.name,
        quantity: parseInt(quantity),
        price: menuItem.price,
        total: menuItem.price * parseInt(quantity),
        timestamp: new Date().toISOString()
    };
    salesRecords.push(newSale);
    localStorage.setItem('salesRecords', JSON.stringify(salesRecords));
    return newSale;
}

function getTodaySales() {
    const salesRecords = JSON.parse(localStorage.getItem('salesRecords'));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return salesRecords.filter(sale => {
        const saleDate = new Date(sale.timestamp);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
    });
}

// Page Load Handlers
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();
    
    // Menu Management Page
    if (window.location.pathname.endsWith('menu.html')) {
        setupMenuPage();
    }
    
    // Sales Recording Page
    if (window.location.pathname.endsWith('record-sale.html')) {
        setupSalesPage();
    }
    
    // Dashboard Page
    if (window.location.pathname.endsWith('index.html')) {
        setupDashboard();
    }
});

// Menu Page Setup
function setupMenuPage() {
    const menuForm = document.getElementById('menuForm');
    const menuItemsList = document.getElementById('menuItemsList');
    const editModal = document.getElementById('editModal');
    
    // Add Menu Item Form Handler
    menuForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('itemName').value;
        const price = document.getElementById('price').value;
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        
        addMenuItem(name, price, category, description);
        menuForm.reset();
        refreshMenuList();
    });
    
    // Edit Modal Handlers
    document.getElementById('cancelEdit').addEventListener('click', function() {
        editModal.classList.add('hidden');
    });
    
    document.getElementById('saveEdit').addEventListener('click', function() {
        const id = document.getElementById('editItemId').value;
        const name = document.getElementById('editItemName').value;
        const price = document.getElementById('editPrice').value;
        const category = document.getElementById('editCategory').value;
        const description = document.getElementById('editDescription').value;
        
        updateMenuItem(id, name, price, category, description);
        editModal.classList.add('hidden');
        refreshMenuList();
    });
    
    refreshMenuList();
}

function refreshMenuList() {
    const menuItemsList = document.getElementById('menuItemsList');
    if (!menuItemsList) return;
    
    const menuItems = getAllMenuItems();
    menuItemsList.innerHTML = menuItems.map(item => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${item.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${item.category}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${formatCurrency(item.price)}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">${item.description || '-'}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onclick="editMenuItemModal('${item.id}')" class="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                <button onclick="deleteMenuItemHandler('${item.id}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');
}

function editMenuItemModal(id) {
    const item = getMenuItem(id);
    if (!item) return;
    
    document.getElementById('editItemId').value = item.id;
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editPrice').value = item.price;
    document.getElementById('editCategory').value = item.category;
    document.getElementById('editDescription').value = item.description || '';
    
    document.getElementById('editModal').classList.remove('hidden');
}

function deleteMenuItemHandler(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        deleteMenuItem(id);
        refreshMenuList();
    }
}

// Sales Page Setup
function setupSalesPage() {
    const menuItemSelect = document.getElementById('menuItem');
    const quantityInput = document.getElementById('quantity');
    const totalAmount = document.getElementById('totalAmount');
    const saleForm = document.getElementById('saleForm');
    const successMessage = document.getElementById('successMessage');
    
    // Populate menu items dropdown
    const menuItems = getAllMenuItems();
    menuItemSelect.innerHTML = '<option value="">Choose an item</option>' +
        menuItems.map(item => `
            <option value="${item.id}" data-price="${item.price}">
                ${item.name} - ${formatCurrency(item.price)}
            </option>
        `).join('');
    
    // Calculate total on input change
    function updateTotal() {
        const selectedOption = menuItemSelect.options[menuItemSelect.selectedIndex];
        const price = selectedOption.dataset.price;
        const quantity = quantityInput.value;
        
        if (price && quantity) {
            totalAmount.textContent = formatCurrency(price * quantity);
        } else {
            totalAmount.textContent = '₹0.00';
        }
    }
    
    menuItemSelect.addEventListener('change', updateTotal);
    quantityInput.addEventListener('input', updateTotal);
    
    // Handle form submission
    saleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const menuItemId = menuItemSelect.value;
        const quantity = quantityInput.value;
        
        if (!menuItemId || !quantity) {
            return;
        }
        
        recordSale(menuItemId, quantity);
        saleForm.reset();
        totalAmount.textContent = '₹0.00';
        
        successMessage.classList.remove('hidden');
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    });
}

// Dashboard Setup
function setupDashboard() {
    const todaySales = getTodaySales();
    
    // Update summary statistics
    const totalSales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);
    const avgSale = todaySales.length > 0 ? totalSales / todaySales.length : 0;
    
    document.getElementById('totalSalesToday').textContent = formatCurrency(totalSales);
    document.getElementById('itemsSoldToday').textContent = totalItems;
    document.getElementById('avgSaleValue').textContent = formatCurrency(avgSale);
    
    // Update recent sales list
    const recentSalesList = document.getElementById('recentSalesList');
    if (recentSalesList) {
        recentSalesList.innerHTML = todaySales.reverse().map(sale => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.menuItemName}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sale.quantity}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrency(sale.total)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(sale.timestamp)}</td>
            </tr>
        `).join('');
    }
}
