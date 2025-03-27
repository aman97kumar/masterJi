const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

// Set default marked options
marked.setOptions({
    breaks: true,
    gfm: true,
    highlight: function (code) {
        return code;
    }
});

// Update preview in real-time
function updatePreview() {
    const markdownText = editor.value;
    const htmlContent = marked.parse(markdownText);
    preview.innerHTML = htmlContent;
}

// Clear editor content
function clearEditor() {
    editor.value = '';
    updatePreview();
}

// Add event listener for input changes
editor.addEventListener('input', updatePreview);

// Initialize with some example markdown
editor.value = `# Welcome to Markdown Previewer!

## Try it out:

**Bold text** and *italic text*

### Lists:
* Unordered item 1
* Unordered item 2

1. Ordered item 1
2. Ordered item 2

### Code:
\`inline code\`

\`\`\`
// code block
function hello() {
    console.log("Hello, World!");
}
\`\`\`

`;
updatePreview();
