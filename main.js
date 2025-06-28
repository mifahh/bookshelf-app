const books = [];
let editBookId = null;
const RENDER_EVENT = 'render-books';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener("DOMContentLoaded", function(){
    const bookForm = document.getElementById('bookForm');
    bookForm.addEventListener('submit', function(event){
        event.preventDefault();
        if (editBookId !== null) {
            updateBook(editBookId);
        }else{
            addBook();
        }
        editBookId = null;
        bookForm.reset();
    });

    document.addEventListener(RENDER_EVENT, function(event){
        const data = event.detail ?? {};
        const bookData = data.books ?? books;
        const isSearch = data.isSearch ?? false;

        const inCompleteBookList = document.getElementById('incompleteBookList');
        const completeBookList = document.getElementById('completeBookList');
        resetRender(inCompleteBookList, completeBookList);
        if(isSearch){
            renderBooks(bookData, inCompleteBookList, completeBookList);
        }else{
            renderBooks(bookData, inCompleteBookList, completeBookList);
        }
    });

    if(isStorageExist()){
        loadData();
    }
    const isComplete = document.getElementById('bookFormIsComplete');
    isComplete.addEventListener('change', function(){
        const button = document.getElementById('bookFormSubmit');
        const span = button.querySelector('span');
        span.innerText = isComplete.checked ? "Selesai Dibaca" : "Belum selesai Dibaca";
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function(event){
        event.preventDefault();
        searchBook();
    });
});

function resetRender(inCompleteBookList, completeBookList){
    inCompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
}

function renderBooks(books, inCompleteBookList, completeBookList){
    books.forEach(function(book){
        const bookList = book.isComplete ? completeBookList : inCompleteBookList;
        const bookItem = makeBookItem(book);
        bookList.append(bookItem);
    });
}

function generateId(){
    return +new Date();
}

function generateBook(id, title, author, year, isComplete){
    return {
        id,
        title,
        author,
        year : parseInt(year),
        isComplete
    }
}

function addBook(){
    const id = generateId();
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = document.getElementById('bookFormYear').value;
    const isComplete = document.getElementById('bookFormIsComplete').checked ? true : false;

    const book = generateBook(id, title, author, year, isComplete);
    books.push(book);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBookItemActions(book){
    const bookItemActions = document.createElement('div');
    bookItemActions.classList.add('actions');

    const bookItemIsCompleteButton = document.createElement('button');
    bookItemIsCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    bookItemIsCompleteButton.innerText = book.isComplete ? 'Batal Selesai dibaca' : 'Selesai dibaca';
    bookItemIsCompleteButton.addEventListener('click', function() {
        toggleCompleteBook(book.id);
    });

    const bookItemDeleteButton = document.createElement('button');
    bookItemDeleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    bookItemDeleteButton.innerText = 'Hapus Buku';
    bookItemDeleteButton.addEventListener('click', function() {
        deleteBook(book.id);
    });

    const bookItemEditButton = document.createElement('button');
    bookItemEditButton.setAttribute('data-testid', 'bookItemEditButton');
    bookItemEditButton.innerText = 'Edit Buku';
    bookItemEditButton.addEventListener('click', function() {
        editBook(book.id);
    });

    bookItemActions.append(bookItemIsCompleteButton, bookItemDeleteButton, bookItemEditButton);
    return bookItemActions;
}

function makeBookItem(book){
    const bookItemTitle = document.createElement('h3');
    bookItemTitle.setAttribute('data-testid', 'bookItemTitle');
    bookItemTitle.innerText = book.title;

    const bookItemAuthor = document.createElement('p');
    bookItemAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookItemAuthor.innerText = `Penulis: ${book.author}`;

    const bookItemYear = document.createElement('p');
    bookItemYear.setAttribute('data-testid', 'bookItemYear');
    bookItemYear.innerText = `Tahun: ${book.year}`;

    const bookItemActions = makeBookItemActions(book);
    
    const bookItem = document.createElement('div');
    bookItem.setAttribute('data-bookid', book.id);
    bookItem.setAttribute('data-testid', 'bookItem');
    bookItem.classList.add('book');
    bookItem.append(bookItemTitle, bookItemAuthor, bookItemYear, bookItemActions);
    return bookItem;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function findBookById(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function toggleCompleteBook(bookId) {
    const book = findBookById(bookId);
    if (book) {
        book.isComplete = !book.isComplete;
        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function deleteBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function editBook(bookId){
    const book = findBookById(bookId);
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    book.isComplete ? 
        document.getElementById('bookFormIsComplete').checked = true :
        document.getElementById('bookFormIsComplete').checked = false;

    editBookId = book.id;
}

function updateBook(editBookId) {
    const id = editBookId;
    const title = document.getElementById('bookFormTitle').value.trim();

    const author = document.getElementById('bookFormAuthor').value.trim();
    
    const year = document.getElementById('bookFormYear').value.trim();

    const isComplete = document.getElementById('bookFormIsComplete').checked ? true : false;

    const updatedBook = generateBook(id, title, author, year, isComplete);
    const bookIndex = findBookIndex(editBookId);
    if (bookIndex !== -1) {
        books[bookIndex] = updatedBook;
        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function isStorageExist(){
    if (typeof (Storage) === undefined){
        alert('Browser tidak mendukung fitur Storage');
        return false;
    }
    return true;
}

function saveData(){
    if(isStorageExist()){
        const stringData = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, stringData);
    }
}

function loadData(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if(data !== null){
        for (const book of data){
            books.push(book);
        }
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
}

function searchBook(){
    const bookTitle = document.getElementById('searchBookTitle').value;
    const searchedBook = books.filter(books => books.title.toLowerCase().includes(bookTitle));

    document.dispatchEvent(new CustomEvent(RENDER_EVENT, {
        detail : {
            books : searchedBook,
            isSearch : true
        }
    }));
}
