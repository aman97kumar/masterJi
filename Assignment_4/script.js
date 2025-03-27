let books = [];
let currentPage = 1;
let isLoading = false;
let hasMore = true;

const booksContainer = document.getElementById('booksContainer');
const loadingElement = document.getElementById('loading');
const searchBar = document.querySelector('.search-bar');
const sortSelect = document.getElementById('sort');
const gridViewBtn = document.getElementById('gridView');
const listViewBtn = document.getElementById('listView');

// Fetch books from API
async function fetchBooks(page) {
    try {
        const response = await fetch(`https://api.freeapi.app/api/v1/public/books?page=${page}`);
        const data = await response.json();
        
        if (data.success && data.data.data) {
            return data.data.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

// Create book card HTML
function createBookCard(book) {
    return `
        <div class="book-card">
            <img src="${book.volumeInfo.imageLinks?.thumbnail || 'placeholder.jpg'}" alt="${book.volumeInfo.title}">
            <div class="book-info">
                <h3>${book.volumeInfo.title}</h3>
                <p><strong>Author:</strong> ${book.volumeInfo.authors?.join(', ') || 'Unknown'}</p>
                <p><strong>Publisher:</strong> ${book.volumeInfo.publisher || 'Unknown'}</p>
                <p><strong>Published:</strong> ${book.volumeInfo.publishedDate || 'Unknown'}</p>
                <a href="${book.volumeInfo.infoLink}" target="_blank">
                    <button>More Details</button>
                </a>
            </div>
        </div>
    `;
}

// Display books
function displayBooks(booksToShow) {
    booksContainer.innerHTML = booksToShow.map(book => createBookCard(book)).join('');
}

// Filter books
function filterBooks() {
    const searchTerm = searchBar.value.toLowerCase();
    return books.filter(book => 
        book.volumeInfo.title.toLowerCase().includes(searchTerm) ||
        book.volumeInfo.authors?.some(author => 
            author.toLowerCase().includes(searchTerm)
        )
    );
}

// Sort books
function sortBooks(booksToSort) {
    const sortBy = sortSelect.value;
    return [...booksToSort].sort((a, b) => {
        if (sortBy === 'title') {
            return a.volumeInfo.title.localeCompare(b.volumeInfo.title);
        } else {
            return new Date(b.volumeInfo.publishedDate) - new Date(a.volumeInfo.publishedDate);
        }
    });
}

// Update display
function updateDisplay() {
    let filteredBooks = filterBooks();
    let sortedBooks = sortBooks(filteredBooks);
    displayBooks(sortedBooks);
}

// Initialize
async function init() {
    const initialBooks = await fetchBooks(currentPage);
    books = [...initialBooks];
    updateDisplay();
}

// Event listeners
searchBar.addEventListener('input', updateDisplay);
sortSelect.addEventListener('change', updateDisplay);

gridViewBtn.addEventListener('click', () => {
    booksContainer.className = 'books-container grid-view';
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
});

listViewBtn.addEventListener('click', () => {
    booksContainer.className = 'books-container list-view';
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
});

// Infinite scroll
window.addEventListener('scroll', async () => {
    if (isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
        isLoading = true;
        loadingElement.style.display = 'block';
        
        currentPage++;
        const newBooks = await fetchBooks(currentPage);
        
        if (newBooks.length === 0) {
            hasMore = false;
            loadingElement.textContent = 'No more books to load';
        } else {
            books = [...books, ...newBooks];
            updateDisplay();
        }
        
        isLoading = false;
        loadingElement.style.display = 'none';
    }
});

// Initialize the app
init();
