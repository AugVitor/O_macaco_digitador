/* 
Arquivo: script.js
Aluno: Vitor Augusto Cavalcante Da Silva
*/

const codeSnippets = {
    javascript: [
        `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        `const quickSort = (arr) => {
    if (arr.length <= 1) return arr;
    const pivot = arr[0];
    const left = arr.slice(1).filter(x => x < pivot);
    const right = arr.slice(1).filter(x => x >= pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}`,
        `async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}`,
        `class Stack {
    constructor() {
        this.items = [];
    }
    push(element) {
        this.items.push(element);
    }
    pop() {
        return this.items.pop();
    }
}`,
        `const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}`
    ],
    
    python: [
        `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
        `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True`,
        `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
        
class LinkedList:
    def __init__(self):
        self.head = None`,
        `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        `import asyncio

async def main():
    print('Hello')
    await asyncio.sleep(1)
    print('World')
    
asyncio.run(main())`
    ],
    
    c: [
        `#include <stdio.h>

int main() {
    int n = 10;
    for(int i = 0; i < n; i++) {
        printf("%d ", i);
    }
    return 0;
}`,
        `void bubbleSort(int arr[], int n) {
    for(int i = 0; i < n-1; i++) {
        for(int j = 0; j < n-i-1; j++) {
            if(arr[j] > arr[j+1]) {
                int temp = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;
            }
        }
    }
}`,
        `struct Node {
    int data;
    struct Node* next;
};

struct Node* createNode(int data) {
    struct Node* node = malloc(sizeof(struct Node));
    node->data = data;
    node->next = NULL;
    return node;
}`,
        `int factorial(int n) {
    if(n <= 1) 
        return 1;
    return n * factorial(n - 1);
}`,
        `#include <stdlib.h>

int* createArray(int size) {
    int* arr = (int*)malloc(size * sizeof(int));
    for(int i = 0; i < size; i++) {
        arr[i] = i * 2;
    }
    return arr;
}`
    ],
    
    cpp: [
        `#include <iostream>
using namespace std;

class Rectangle {
private:
    double width, height;
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    double area() { return width * height; }
};`,
        `template <typename T>
T maxValue(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    cout << maxValue(5, 10) << endl;
    return 0;
}`,
        `#include <vector>
#include <algorithm>

void sortVector(vector<int>& vec) {
    sort(vec.begin(), vec.end());
    for(int val : vec) {
        cout << val << " ";
    }
}`,
        `class Stack {
private:
    vector<int> elements;
public:
    void push(int val) {
        elements.push_back(val);
    }
    int pop() {
        int val = elements.back();
        elements.pop_back();
        return val;
    }
};`,
        `#include <memory>

int main() {
    unique_ptr<int> ptr = make_unique<int>(42);
    shared_ptr<int> shared = make_shared<int>(100);
    cout << *ptr << " " << *shared << endl;
    return 0;
}`
    ]
};

let typingTest = {
    currentText: '',
    userInput: '',
    startTime: null,
    timeLimit: 60,
    timeRemaining: 60,
    timerInterval: null,
    isActive: false,
    correctChars: 0,
    totalChars: 0,
    errors: 0,
    wpm: 0,
    cpm: 0,
    accuracy: 100,
    currentLanguage: 'javascript',
    history: JSON.parse(localStorage.getItem('typingHistory') || '[]'),
    undoStack: [],
    redoStack: [],
    lastSnapshot: ''
};

const elements = {
    codeDisplay: document.getElementById('code-display'),
    inputField: document.getElementById('input-field'),
    startBtn: document.getElementById('start-btn'),
    resetBtn: document.getElementById('reset-btn'),
    timer: document.getElementById('timer'),
    wpmDisplay: document.getElementById('wpm'),
    cpmDisplay: document.getElementById('cpm'),
    accuracyDisplay: document.getElementById('accuracy'),
    languageSelect: document.getElementById('language'),
    timeSelect: document.getElementById('time'),
    modal: document.getElementById('results-modal'),
    closeModal: document.getElementById('close-modal'),
    historyBody: document.getElementById('history-body'),
    hamburger: document.querySelector('.hamburger'),
    navMenu: document.querySelector('.nav-menu')
};

function getRandomSnippet() {
    const lang = typingTest.currentLanguage;
    let snippets = [];
    
    if (lang === 'all') {
        snippets = Object.values(codeSnippets).flat();
    } else {
        snippets = codeSnippets[lang] || codeSnippets.javascript;
    }
    
    return snippets[Math.floor(Math.random() * snippets.length)];
}

/**
 * Implementa auto-indentação ao pressionar Enter
 * Mantém a mesma indentação da linha anterior
 */
function handleAutoIndent(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        
        let lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLineBeforeCursor = value.substring(lineStart, start);
        const indentMatch = currentLineBeforeCursor.match(/^[\s\t]*/);
        const currentIndent = indentMatch ? indentMatch[0] : '';
        
        const trimmedLine = currentLineBeforeCursor.trim();
        let extraIndent = '';
        
        if (trimmedLine.endsWith('{') || trimmedLine.endsWith('[') || trimmedLine.endsWith('(')) {
            extraIndent = '    ';
        }
        
        if (trimmedLine.endsWith(':') && typingTest.currentLanguage === 'python') {
            extraIndent = '    ';
        }
        
        const newIndent = currentIndent + extraIndent;
        
        e.preventDefault();
        
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);
        const newValue = beforeCursor + '\n' + newIndent + afterCursor;
        
        textarea.value = newValue;
        
        const newCursorPos = start + 1 + newIndent.length;
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
        
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
    }
    
    if (e.key === '}' || e.key === ']' || e.key === ')') {
        const textarea = e.target;
        const start = textarea.selectionStart;
        const value = textarea.value;
        
        let lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const currentLine = value.substring(lineStart, start);
        
        if (currentLine.trim() === '' && currentLine.length >= 4) {
            e.preventDefault();
            
            const newIndent = currentLine.substring(4);
            const beforeLine = value.substring(0, lineStart);
            const afterCursor = value.substring(start);
            
            textarea.value = beforeLine + newIndent + e.key + afterCursor;
            
            const newPos = lineStart + newIndent.length + 1;
            textarea.selectionStart = newPos;
            textarea.selectionEnd = newPos;
            
            const inputEvent = new Event('input', { bubbles: true });
            textarea.dispatchEvent(inputEvent);
        }
    }
    
    if (e.key === 'Tab') {
        e.preventDefault();
        const textarea = e.target;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const value = textarea.value;
        
        if (start === end) {
            const beforeCursor = value.substring(0, start);
            const afterCursor = value.substring(start);
            const spaces = '    ';
            
            textarea.value = beforeCursor + spaces + afterCursor;
            textarea.selectionStart = start + spaces.length;
            textarea.selectionEnd = start + spaces.length;
        } else {
            const beforeSelection = value.substring(0, start);
            const selection = value.substring(start, end);
            const afterSelection = value.substring(end);
            
            let firstLineStart = value.lastIndexOf('\n', start - 1) + 1;
            const realStart = firstLineStart;
            let realEnd = end;
            
            const textToIndent = value.substring(realStart, realEnd);
            
            const indentedText = textToIndent.split('\n').map(line => {
                if (e.shiftKey) {
                    return line.replace(/^    /, '');
                } else {
                    return '    ' + line;
                }
            }).join('\n');
            
            textarea.value = value.substring(0, realStart) + indentedText + value.substring(realEnd);
            textarea.selectionStart = realStart;
            textarea.selectionEnd = realStart + indentedText.length;
        }
        
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
    }
}

function saveUndoSnapshot(textarea) {
    const currentState = {
        value: textarea.value,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd
    };
    
    if (typingTest.lastSnapshot !== textarea.value) {
        typingTest.undoStack.push(currentState);
        if (typingTest.undoStack.length > 50) {
            typingTest.undoStack.shift();
        }
        typingTest.redoStack = [];
        typingTest.lastSnapshot = textarea.value;
    }
}

function performUndo(textarea) {
    if (typingTest.undoStack.length > 1) {
        const currentState = {
            value: textarea.value,
            selectionStart: textarea.selectionStart,
            selectionEnd: textarea.selectionEnd
        };
        typingTest.redoStack.push(currentState);
        
        typingTest.undoStack.pop();
        const previousState = typingTest.undoStack[typingTest.undoStack.length - 1];
        
        textarea.value = previousState.value;
        textarea.selectionStart = previousState.selectionStart;
        textarea.selectionEnd = previousState.selectionEnd;
        typingTest.lastSnapshot = previousState.value;
        
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
    }
}

function performRedo(textarea) {
    if (typingTest.redoStack.length > 0) {
        const nextState = typingTest.redoStack.pop();
        
        typingTest.undoStack.push(nextState);
        
        textarea.value = nextState.value;
        textarea.selectionStart = nextState.selectionStart;
        textarea.selectionEnd = nextState.selectionEnd;
        typingTest.lastSnapshot = nextState.value;
        
        const inputEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(inputEvent);
    }
}

function startTest() {
    typingTest.currentText = getRandomSnippet();
    typingTest.userInput = '';
    typingTest.startTime = Date.now();
    typingTest.timeRemaining = typingTest.timeLimit;
    typingTest.isActive = true;
    typingTest.correctChars = 0;
    typingTest.totalChars = 0;
    typingTest.errors = 0;
    typingTest.wpm = 0;
    typingTest.cpm = 0;
    typingTest.accuracy = 100;
    
    typingTest.undoStack = [];
    typingTest.redoStack = [];
    typingTest.lastSnapshot = '';
    
    elements.codeDisplay.textContent = typingTest.currentText;
    elements.inputField.value = '';
    elements.inputField.disabled = false;
    elements.inputField.focus();
    elements.startBtn.style.display = 'none';
    elements.resetBtn.style.display = 'inline-block';
    
    renderText();
    saveUndoSnapshot(elements.inputField);
    startTimer();
}

function resetTest() {
    clearInterval(typingTest.timerInterval);
    
    typingTest.isActive = false;
    typingTest.timeRemaining = typingTest.timeLimit;
    
    elements.inputField.value = '';
    elements.inputField.disabled = true;
    elements.startBtn.style.display = 'inline-block';
    elements.resetBtn.style.display = 'none';
    elements.timer.textContent = typingTest.timeLimit;
    elements.wpmDisplay.textContent = '0';
    elements.cpmDisplay.textContent = '0';
    elements.accuracyDisplay.textContent = '100%';
    
    elements.codeDisplay.innerHTML = '<span class="current">C</span>lique no botão iniciar para começar...';
}

function startTimer() {
    typingTest.timerInterval = setInterval(() => {
        typingTest.timeRemaining--;
        elements.timer.textContent = typingTest.timeRemaining;
        
        updateStats();
        
        if (typingTest.timeRemaining <= 0) {
            endTest();
        }
    }, 1000);
}

function endTest() {
    clearInterval(typingTest.timerInterval);
    typingTest.isActive = false;
    
    elements.inputField.disabled = true;
    updateStats();
    saveToHistory();
    showResults();
}

/**
 * Renderiza o texto com destaque para caracteres corretos/incorretos
 */
function renderText() {
    const text = typingTest.currentText;
    const input = elements.inputField.value;
    let html = '';
    
    for (let i = 0; i < text.length; i++) {
        if (i < input.length) {
            if (input[i] === text[i]) {
                html += `<span class="correct">${escapeHtml(text[i])}</span>`;
            } else {
                html += `<span class="incorrect">${escapeHtml(text[i])}</span>`;
            }
        } else if (i === input.length) {
            html += `<span class="current">${escapeHtml(text[i])}</span>`;
        } else {
            html += escapeHtml(text[i]);
        }
    }
    
    elements.codeDisplay.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStats() {
    if (!typingTest.isActive) return;
    
    const timeElapsed = (Date.now() - typingTest.startTime) / 1000 / 60;
    const input = elements.inputField.value;
    
    typingTest.correctChars = 0;
    typingTest.errors = 0;
    
    for (let i = 0; i < input.length; i++) {
        if (i < typingTest.currentText.length) {
            if (input[i] === typingTest.currentText[i]) {
                typingTest.correctChars++;
            } else {
                typingTest.errors++;
            }
        }
    }
    
    typingTest.totalChars = input.length;
    
    if (timeElapsed > 0) {
        typingTest.wpm = Math.round((typingTest.correctChars / 5) / timeElapsed);
        typingTest.cpm = Math.round(typingTest.correctChars / timeElapsed);
    }
    
    if (typingTest.totalChars > 0) {
        typingTest.accuracy = Math.round((typingTest.correctChars / typingTest.totalChars) * 100);
    }
    
    elements.wpmDisplay.textContent = typingTest.wpm;
    elements.cpmDisplay.textContent = typingTest.cpm;
    elements.accuracyDisplay.textContent = typingTest.accuracy + '%';
}

function showResults() {
    document.getElementById('final-wpm').textContent = typingTest.wpm + ' WPM';
    document.getElementById('final-accuracy').textContent = typingTest.accuracy + '%';
    document.getElementById('total-chars').textContent = typingTest.totalChars;
    document.getElementById('total-errors').textContent = typingTest.errors;
    
    elements.modal.classList.add('show');
}

function saveToHistory() {
    const result = {
        date: new Date().toLocaleString('pt-BR'),
        wpm: typingTest.wpm,
        accuracy: typingTest.accuracy,
        language: typingTest.currentLanguage === 'all' ? 'Todas' : typingTest.currentLanguage.toUpperCase()
    };
    
    typingTest.history.unshift(result);
    
    if (typingTest.history.length > 10) {
        typingTest.history = typingTest.history.slice(0, 10);
    }
    
    localStorage.setItem('typingHistory', JSON.stringify(typingTest.history));
    updateHistoryTable();
}

function updateHistoryTable() {
    elements.historyBody.innerHTML = '';
    
    typingTest.history.forEach(result => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.date}</td>
            <td>${result.wpm}</td>
            <td>${result.accuracy}%</td>
            <td>${result.language}</td>
        `;
        elements.historyBody.appendChild(row);
    });
}

elements.startBtn.addEventListener('click', startTest);

elements.resetBtn.addEventListener('click', resetTest);

elements.inputField.addEventListener('input', (e) => {
    if (!typingTest.isActive) return;
    
    renderText();
    updateStats();
    
    if (e.target.value.length % 10 === 0 || 
        e.target.value.endsWith('\n') ||
        e.target.value.endsWith(' ')) {
        saveUndoSnapshot(e.target);
    }
    
    if (e.target.value === typingTest.currentText) {
        typingTest.currentText = getRandomSnippet();
        elements.inputField.value = '';
        renderText();
        saveUndoSnapshot(e.target);
    }
});

elements.inputField.addEventListener('keydown', handleAutoIndent);

elements.inputField.addEventListener('paste', (e) => {
    e.preventDefault();
    return false;
});

elements.languageSelect.addEventListener('change', (e) => {
    typingTest.currentLanguage = e.target.value;
    if (!typingTest.isActive) {
        resetTest();
    }
});

elements.timeSelect.addEventListener('change', (e) => {
    typingTest.timeLimit = parseInt(e.target.value);
    typingTest.timeRemaining = typingTest.timeLimit;
    elements.timer.textContent = typingTest.timeLimit;
    if (!typingTest.isActive) {
        resetTest();
    }
});

elements.closeModal.addEventListener('click', () => {
    elements.modal.classList.remove('show');
    resetTest();
});

elements.modal.addEventListener('click', (e) => {
    if (e.target === elements.modal) {
        elements.modal.classList.remove('show');
        resetTest();
    }
});

elements.hamburger.addEventListener('click', () => {
    elements.hamburger.classList.toggle('active');
    elements.navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        elements.hamburger.classList.remove('active');
        elements.navMenu.classList.remove('active');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!typingTest.isActive) {
            startTest();
        } else {
            resetTest();
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (typingTest.isActive && document.activeElement === elements.inputField) {
            e.preventDefault();
            performUndo(elements.inputField);
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        if (typingTest.isActive && document.activeElement === elements.inputField) {
            e.preventDefault();
            performRedo(elements.inputField);
        }
    }
    
    if (e.key === 'Escape' && elements.modal.classList.contains('show')) {
        elements.modal.classList.remove('show');
        resetTest();
    }
});

window.addEventListener('DOMContentLoaded', () => {
    updateHistoryTable();
    elements.timer.textContent = typingTest.timeLimit;
    
    const logoText = document.querySelector('.logo-text');
    if (logoText) {
        const text = logoText.textContent;
        logoText.textContent = '';
        let i = 0;
        const typeEffect = setInterval(() => {
            if (i < text.length) {
                logoText.textContent += text[i];
                i++;
            } else {
                clearInterval(typeEffect);
            }
        }, 100);
    }
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            console.log('Service Worker não suportado');
        });
    });
}

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
if (prefersDarkScheme.matches) {
    document.body.classList.add('dark-theme');
}

prefersDarkScheme.addEventListener('change', (e) => {
    if (e.matches) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
});

console.log('sucesso');