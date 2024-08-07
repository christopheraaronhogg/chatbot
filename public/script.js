const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const htmlButton = document.getElementById("html-button");
const cssButton = document.getElementById("css-button");
const jsButton = document.getElementById("js-button");
const readmeButton = document.getElementById("readme-button");
const questionButton = document.getElementById("question-button");
const implementationButton = document.getElementById("implementation-button");
const modeToggle = document.getElementById("mode-toggle");
const fileUpload = document.getElementById("file-upload");
const uploadButton = document.getElementById("upload-button");
const uploadedFilesContainer = document.getElementById(
    "uploaded-files-container",
);
const fileList = document.getElementById("file-list");
const loadingSpinner = document.getElementById("loading-spinner");
const limitContextCheckbox = document.getElementById("limit-context-checkbox");
const contextDepthInput = document.getElementById("context-depth");
const openaiApiKeyInput = document.getElementById("openai-api-key");
const anthropicApiKeyInput = document.getElementById("anthropic-api-key");
const saveApiKeysButton = document.getElementById("save-api-keys");
const advancedOptionsToggle = document.getElementById(
    "advanced-options-toggle",
);
const advancedOptions = document.getElementById("advanced-options");
const toggleAdvancedOptionsBtn = document.getElementById(
    "advanced-options-toggle",
);
const openAIInputPricePerMillion = 0.15;
const openAIOutputPricePerMillion = 0.6;
const anthropicInputPricePerMillion = 3.0;
const anthropicOutputPricePerMillion = 15.0;

let sessionCost = 0;
let conversation = [];
let currentHtml = "";
let currentCss = "";
let currentJs = "";
let currentReadme = "";
let projectContext = "";
let uploadedFiles = [];
let selectedFiles = [];
let limitContext = false;
let contextDepth = 5;
let customOpenAIKey = "";
let customAnthropicKey = "";

// New theme toggle functionality
const storageKey = "theme-preference";

const onClick = () => {
    theme.value = theme.value === "light" ? "dark" : "light";
    setPreference();
};

const getColorPreference = () => {
    if (localStorage.getItem(storageKey))
        return localStorage.getItem(storageKey);
    else
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
};

const setPreference = () => {
    localStorage.setItem(storageKey, theme.value);
    reflectPreference();
};

const reflectPreference = () => {
    document.firstElementChild.setAttribute("data-theme", theme.value);
    document
        .querySelector("#theme-toggle")
        ?.setAttribute("aria-label", theme.value);

    // Update body class for compatibility with existing styles
    document.body.classList.toggle("dark-mode", theme.value === "dark");
};

const theme = {
    value: getColorPreference(),
};

// set early so no page flashes / CSS is made aware
reflectPreference();

window.onload = () => {
    // set on load so screen readers can see latest value on the button
    reflectPreference();

    // now this script can find and listen for clicks on the control
    document.querySelector("#theme-toggle").addEventListener("click", onClick);
};

// sync with system changes
window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", ({ matches: isDark }) => {
        theme.value = isDark ? "dark" : "light";
        setPreference();
    });

// Existing functionality
saveApiKeysButton.addEventListener("click", () => {
    customOpenAIKey = openaiApiKeyInput.value.trim();
    customAnthropicKey = anthropicApiKeyInput.value.trim();

    if (customOpenAIKey || customAnthropicKey) {
        localStorage.setItem("customOpenAIKey", customOpenAIKey);
        localStorage.setItem("customAnthropicKey", customAnthropicKey);
        alert("API keys saved successfully!");
    } else {
        alert("Please enter at least one API key.");
    }
});

// Load saved API keys on page load
document.addEventListener("DOMContentLoaded", () => {
    const savedOpenAIKey = localStorage.getItem("customOpenAIKey");
    const savedAnthropicKey = localStorage.getItem("customAnthropicKey");

    if (savedOpenAIKey) openaiApiKeyInput.value = savedOpenAIKey;
    if (savedAnthropicKey) anthropicApiKeyInput.value = savedAnthropicKey;

    customOpenAIKey = savedOpenAIKey || "";
    customAnthropicKey = savedAnthropicKey || "";
});

function autoResize() {
    // Store the current cursor position and scroll position
    const cursorPosition = this.selectionStart;
    const scrollTop = this.scrollTop;
    const viewportHeight = this.clientHeight;
    const wasAtBottom = this.scrollHeight - this.scrollTop === viewportHeight;

    // Temporarily shrink the textarea to get the correct scrollHeight
    this.style.height = "0px";

    // Get the scrollHeight and add a small buffer
    const scrollHeight = this.scrollHeight + 2;

    // Set the new height, capped at 150px
    const newHeight = Math.min(scrollHeight, 150);
    this.style.height = newHeight + "px";

    // Force a minimum height of two lines
    const lineHeight = parseInt(window.getComputedStyle(this).lineHeight);
    const minHeight = lineHeight * 2;
    if (newHeight < minHeight) {
        this.style.height = minHeight + "px";
    }

    // Show scrollbar only if content exceeds max height
    this.style.overflowY = scrollHeight > 150 ? "scroll" : "hidden";

    // Restore the cursor position
    this.setSelectionRange(cursorPosition, cursorPosition);

    // Scroll handling
    if (wasAtBottom || cursorPosition === this.value.length) {
        // If we were at the bottom before resizing or the cursor is at the end,
        // scroll to the bottom
        this.scrollTop = this.scrollHeight;
    } else {
        // Calculate if the cursor is now out of view
        const cursorY = this.scrollHeight - this.scrollTop - viewportHeight;

        if (cursorY > 0 && cursorY < lineHeight) {
            // If the cursor is just out of view, scroll to make it visible
            this.scrollTop = this.scrollHeight - viewportHeight;
        } else {
            // Otherwise, maintain the previous scroll position
            this.scrollTop = scrollTop;
        }
    }
}

document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", () => {
        const input = icon.previousElementSibling;
        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
});

advancedOptionsToggle.addEventListener("click", () => {
    if (advancedOptions.classList.contains("show")) {
        // Closing the options
        advancedOptions.style.maxHeight = advancedOptions.scrollHeight + "px";
        advancedOptions.offsetHeight; // Force reflow
        advancedOptions.style.maxHeight = "0px";
        advancedOptions.classList.remove("show");
    } else {
        // Opening the options
        advancedOptions.classList.add("show");
        advancedOptions.style.maxHeight = advancedOptions.scrollHeight + "px";
    }
});

// Listen for the end of the transition
advancedOptions.addEventListener("transitionend", (e) => {
    if (e.propertyName === "max-height") {
        if (!advancedOptions.classList.contains("show")) {
            advancedOptions.style.maxHeight = null;
        }
    }
});

function cleanCodeBlock(code, language) {
    console.log("Cleaning code block:", code); // Debug log
    const lines = code.split("\n");
    if (lines[0].trim().startsWith("```")) {
        lines.shift(); // Remove the opening ````
    }
    if (lines[lines.length - 1].trim() === "```") {
        lines.pop(); // Remove the closing ```
    }
    code = lines.join("\n").trim();
    console.log("Cleaned code block:", code); // Debug log
    return code;
}

async function storeHtmlPreview(html) {
    try {
        const response = await fetch("/store-preview", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ html }),
        });
        const data = await response.json();
        if (data.success) {
            return data.previewId;
        } else {
            console.error("Failed to store HTML preview");
            return null;
        }
    } catch (error) {
        console.error("Error storing HTML preview:", error);
        return null;
    }
}

async function addMessage(content, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.classList.add(isUser ? "user-message" : "bot-message");

    if (!isUser) {
        if (modeToggle.checked) {
            messageDiv.classList.add("smart-response");
        } else {
            messageDiv.classList.add("quick-response");
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function detectLanguage(code) {
        if (code.includes("<!DOCTYPE html") || code.includes("<html"))
            return "html";
        if (code.includes("body {") || code.includes("@media")) return "css";
        if (
            code.includes("function") ||
            code.includes("const") ||
            code.includes("let") ||
            code.includes("var")
        )
            return "javascript";
        if (
            code.includes("def ") ||
            code.includes("import ") ||
            code.includes("class ")
        )
            return "python";
        return "plaintext";
    }

    async function processCodeBlock(code, lang) {
        const escapedCode = escapeHtml(code);
        let buttons = `<button class="copy-button" data-code="${encodeURIComponent(code)}">Copy</button>`;

        if (lang === "html") {
            const previewId = await storeHtmlPreview(code);
            if (previewId) {
                const previewUrl = `${window.location.origin}/previews/${previewId}.html`;
                buttons += `<button class="preview-button" data-preview-url="${previewUrl}">Preview</button>`;
            } else {
                buttons += `<button class="preview-button">Preview</button>`;
            }
            buttons += '<button class="download-button">Download</button>';
        }

        return `<div class="code-block-container">
                    <pre><code class="language-${lang}">${escapedCode}</code></pre>
                    ${buttons}
                </div>`;
    }

    let processedContent = "";
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        processedContent += escapeHtml(
            content.slice(lastIndex, match.index),
        ).replace(/\n/g, "<br>");
        const lang = match[1] || "plaintext";
        const code = match[2];
        processedContent += await processCodeBlock(code, lang);
        lastIndex = codeBlockRegex.lastIndex;
    }

    processedContent += escapeHtml(content.slice(lastIndex)).replace(
        /\n/g,
        "<br>",
    );

    messageDiv.innerHTML = processedContent;

    chatContainer.appendChild(messageDiv);

    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;

    messageDiv.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
    });

    messageDiv.querySelectorAll(".copy-button").forEach((button) => {
        button.addEventListener("click", handleCopyClick);
    });

    messageDiv.querySelectorAll(".preview-button").forEach((button) => {
        button.addEventListener("click", function () {
            const previewUrl = this.getAttribute("data-preview-url");
            if (previewUrl) {
                // Open in a new window instead of a new tab
                window.open(previewUrl, "_blank", "width=800,height=600,menubar=no,toolbar=no,location=no,status=no");
            } else {
                const codeBlock = this.closest(
                    ".code-block-container",
                ).querySelector("code");
                const htmlContent = codeBlock.textContent;
                createPreviewWindow(htmlContent);
            }
        });
    });

    messageDiv.querySelectorAll(".download-button").forEach((button) => {
        button.addEventListener("click", function () {
            const codeBlock = this.closest(
                ".code-block-container"
            ).querySelector("code");
            const htmlContent = codeBlock.textContent;
            downloadHtmlFile(htmlContent);
        });
    });

    conversation.push({
        role: isUser ? "user" : "assistant",
        content: content,
    });

    projectContext += `${isUser ? "User" : "Assistant"}: ${content}\n`;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function handleCopyClick(e) {
    const code = decodeURIComponent(e.target.getAttribute("data-code")).replace(
        /{{BACKTICK}}/g,
        "`",
    ); // Replace placeholders with backticks
    navigator.clipboard
        .writeText(code)
        .then(() => {
            const originalText = e.target.textContent;
            e.target.textContent = "Copied!";
            setTimeout(() => {
                e.target.textContent = originalText;
            }, 2000);
        })
        .catch((err) => {
            console.error("Failed to copy text: ", err);
        });
}

function getCurrentModel() {
    return modeToggle.checked ? "claude-3-5-sonnet" : "gpt-4o-mini";
}

async function generateContent(prompt) {
    const model = getCurrentModel();
    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                prompt,
                openaiApiKey: customOpenAIKey,
                anthropicApiKey: customAnthropicKey,
            }),
        });
        const data = await response.json();
        console.log("API Response:", data);
        if (data.content) {
            // Calculate the cost based on the number of input and output tokens and the model used
            const inputCost =
                model === "gpt-4o-mini"
                    ? (data.inputTokens / 1000000) * openAIInputPricePerMillion
                    : (data.inputTokens / 1000000) *
                      anthropicInputPricePerMillion;

            const outputCost =
                model === "gpt-4o-mini"
                    ? (data.outputTokens / 1000000) *
                      openAIOutputPricePerMillion
                    : (data.outputTokens / 1000000) *
                      anthropicOutputPricePerMillion;

            const totalCost = inputCost + outputCost;

            updateSessionCost(totalCost);
            return data.content;
        } else if (data.error) {
            console.error("API Error:", data.error);
            return `Error: ${data.error}`;
        } else {
            console.error("Unexpected API response format:", data);
            return "Error: Unexpected response format from the API.";
        }
    } catch (error) {
        console.error("Error generating content:", error);
        return "Error generating content. Please check the console for more details.";
    }
}

document.getElementById("cost-info-button").addEventListener("click", () => {
    alert(
        "This is an estimated cost based on the number of tokens processed. Prices are calculated per million tokens. Actual costs may vary.",
    );
});

function updateSessionCost(cost) {
    sessionCost += cost;
    const costContainer = document.getElementById("session-cost");
    costContainer.textContent = `Session Cost: $${sessionCost.toFixed(4)}`;
}

function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

async function handleSend() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
        const messageToBeSent = userMessage; // Store the message before clearing the input
        resetInputBox(); // Reset the input box after sending
        loadingSpinner.style.display = "flex";

        // Scroll to bottom after user message is added
        scrollToBottom();

        let contextString;
        if (limitContext) {
            const recentContext = conversation.slice(-contextDepth * 2);
            contextString = recentContext
                .map((msg) => `${msg.role}: ${msg.content}`)
                .join("\n");
        } else {
            contextString = conversation
                .map((msg) => `${msg.role}: ${msg.content}`)
                .join("\n");
        }

        let prompt = `${contextString}\n\nHuman: ${messageToBeSent}\n\n`;

        // Add selected file contents to the prompt if the send code toggle is checked
        if (sendCodeToggle.checked) {
            const selectedFiles = getSelectedFiles();

            if (selectedFiles.length > 0) {
                prompt += "Selected Files:\n";
                selectedFiles.forEach(filePath => {
                    const file = findFileByPath(filePath);
                    if (file) {
                        prompt += `File: ${filePath}\nContent:\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n\n`;
                    }
                });
            }
        }

        prompt += "Assistant: Please provide your response. If you include any code snippets, always wrap them in triple backticks (```) for proper formatting.";

        try {
            const response = await generateContent(prompt);
            addMessage(response);
        } catch (error) {
            console.error("Error:", error);
            addMessage(
                "An error occurred while generating the response. Please try again."
            );
        } finally {
            loadingSpinner.style.display = "none";
        }
    }
}

async function handleHtml() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = "";
    const prompt = `Project context:\n${projectContext}\n\nCurrent HTML:\n${currentHtml}\n\nUser input: ${userMessage}\n\nPlease update or generate HTML based on the project context, current HTML, and user input. If starting fresh, create a complete HTML structure for the project described. Return only the HTML code without any explanation, comments, or markdown formatting. Do not include any text outside the HTML code.`;
    loadingSpinner.style.display = "flex";
    try {
        let newHtml = await generateContent(prompt);
        newHtml = cleanCodeBlock(newHtml, "html");
        newHtml = newHtml.replace(/<!--[\s\S]*?-->/g, "");
        newHtml = newHtml.replace(
            /^([\s\S]*?html)?\s*<!DOCTYPE html>/i,
            "<!DOCTYPE html>",
        );
        currentHtml = newHtml;
        addMessage("Updated HTML:");
        addMessage("```html\n" + currentHtml + "\n```");
    } finally {
        loadingSpinner.style.display = "none";
    }
}

async function handleCss() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = "";
    const prompt = `Project context:\n${projectContext}\n\nCurrent CSS:\n${currentCss}\n\nUser input: ${userMessage}\n\nPlease update or generate CSS based on the project context, current CSS, and user input. If starting fresh, create complete styles for the project described. Return only the CSS code without any explanation, comments, or markdown formatting. Do not include any text outside the CSS code.`;
    loadingSpinner.style.display = "flex";
    try {
        let newCss = await generateContent(prompt);
        newCss = cleanCodeBlock(newCss, "css");
        newCss = newCss.replace(/\/\*[\s\S]*?\*\//g, "");
        newCss = newCss.replace(/\/\/.*/g, "");
        currentCss = newCss;
        addMessage("Updated CSS:");
        addMessage("```css\n" + currentCss + "\n```");
    } finally {
        loadingSpinner.style.display = "none";
    }
}

async function handleJs() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = "";
    const prompt = `Project context:\n${projectContext}\n\nCurrent JavaScript:\n${currentJs}\n\nUser input: ${userMessage}\n\nPlease update or generate JavaScript based on the project context, current JavaScript, and user input. If starting fresh, create complete functionality for the project described. Ensure all necessary functions and event listeners are included. Return only the JavaScript code without any explanation, comments, or markdown formatting. Do not include any text outside the JavaScript code.`;
    loadingSpinner.style.display = "flex";
    try {
        let newJs = await generateContent(prompt);
        newJs = cleanCodeBlock(newJs, "javascript");
        newJs = newJs.replace(/\/\*[\s\S]*?\*\//g, "");
        newJs = newJs.replace(/\/\/.*/g, "");
        currentJs = newJs;
        addMessage("Updated JavaScript:");
        addMessage("```javascript\n" + currentJs + "\n```");
    } finally {
        loadingSpinner.style.display = "none";
    }
}

async function handleReadme() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = "";
    const prompt = `Project context:\n${projectContext}\n\nCurrent HTML:\n${currentHtml}\n\nCurrent CSS:\n${currentCss}\n\nCurrent JavaScript:\n${currentJs}\n\nUser input: ${userMessage}\n\nPlease generate a README.md file for this project. Include sections such as project description, installation instructions, usage, features, and any other relevant information. Format the content in Markdown. Return only the README content without any additional explanation or formatting.`;
    loadingSpinner.style.display = "flex";
    try {
        let newReadme = await generateContent(prompt);
        newReadme = cleanCodeBlock(newReadme, "markdown");
        currentReadme = newReadme;
        addMessage("Generated README.md:");
        addMessage("```markdown\n" + currentReadme + "\n```");
    } finally {
        loadingSpinner.style.display = "none";
    }
}

async function handleQuestion() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = "";
    const prompt = `Based on the following project context and user input, generate a relevant clarifying question about the project:

            Project context:
            ${projectContext}

            User input:
            ${userMessage}

            Clarifying question:`;
    loadingSpinner.style.display = "flex";
    try {
        const question = await generateContent(prompt);
        addMessage(question);
    } finally {
        loadingSpinner.style.display = "none";
    }
}

async function handleImplementationAdvice() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, true);
    }
    userInput.value = "";
    const prompt = `Based on the following project context, generated code, and user input, provide advice on how to implement and run this project. Include information about whether a local server is needed, any necessary setup steps, and how to view or interact with the project. If there are multiple files, explain how they should be organized and linked.

            Project context:
            ${projectContext}

            Current HTML:
            ${currentHtml}

            Current CSS:
            ${currentCss}

            Current JavaScript:
            ${currentJs}

            User input:
            ${userMessage}
            Implementation advice:`;

    loadingSpinner.style.display = "flex";
    try {
        const advice = await generateContent(prompt);
        addMessage("Implementation Advice:");
        addMessage(advice);
    } finally {
        loadingSpinner.style.display = "none";
    }
}

function handleFileUpload(files) {
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileObject = {
                name: files[i].name,
                content: e.target.result,
            };
            uploadedFiles.push(fileObject);

            const fileElement = document.createElement("div");
            fileElement.classList.add("file-object");
            fileElement.innerHTML = `
                            <div class="file-header">
                                <span class="file-name">${escapeHtml(files[i].name)}</span>
                                <button class="edit-file-button">Edit</button>
                                <button class="add-to-chat-button">+</button>
                            </div>
                            <div class="file-edit-area" style="display: none;">
                                <textarea class="file-edit-textarea"></textarea>
                                <button class="save-file-button">Save</button>
                            </div>
                        `;

            fileList.appendChild(fileElement);

            if (i === files.length - 1) {
                uploadedFilesContainer.style.display = "block";
                addMessage(
                    `${files.length} file(s) uploaded successfully.`,
                    false,
                );
                addFilesToContext();
            }
        };
        reader.readAsText(files[i]);
    }
}

function addFilesToContext() {
    if (uploadedFiles.length > 0) {
        let filesContext = "Uploaded Files:\n";
        uploadedFiles.forEach((file) => {
            filesContext += `\nFile: ${file.name}\nContent:\n\`\`\`\n${file.content}\n\`\`\`\n`;
        });
        projectContext += filesContext;
    }
}

function initThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");

    // Check for saved theme preference or default to light mode
    if (localStorage.getItem("dark-mode") === "true") {
        document.body.classList.add("dark-mode");
        themeToggle.checked = true;
        if (monacoEditor) {
            monaco.editor.setTheme('vs-dark');
        }
    } else {
        if (monacoEditor) {
            monaco.editor.setTheme('vs-light');
        }
    }

    themeToggle.addEventListener("change", function () {
        if (this.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("dark-mode", "true");
            if (monacoEditor) {
                monaco.editor.setTheme('vs-dark');
            }
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("dark-mode", "false");
            if (monacoEditor) {
                monaco.editor.setTheme('vs-light');
            }
        }
    });
}

function initMonacoEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs' }});

    require(['vs/editor/editor.main'], function() {
        // Check for saved theme preference or default to light mode
        const isDarkMode = localStorage.getItem("dark-mode") === "true";
        const theme = isDarkMode ? 'vs-dark' : 'vs-light';

        monacoEditor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: files[0].content,
            language: files[0].language,
            theme: theme,
            automaticLayout: true,
            minimap: { enabled: false }
        });

        updateFileTree();
        updateFileCheckboxes();

        // Add event listener for the new file button
        document.getElementById('new-file-button').addEventListener('click', createNewFile);

        // Add a resize observer to update the editor layout
        const resizeObserver = new ResizeObserver(() => {
            if (monacoEditor) {
                monacoEditor.layout();
            }
        });

        resizeObserver.observe(document.getElementById('editor-section'));

        // Ensure the editor layout is updated when the window is resized
        window.addEventListener('resize', function() {
            if (monacoEditor) {
                monacoEditor.layout();
            }
        });
    });
}

function downloadHtmlFile(htmlContent) {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add this function near the other preview-related functions
function createPreviewWindow(htmlContent) {
    const previewWindow = window.open("", "_blank", "width=800,height=600,menubar=no,toolbar=no,location=no,status=no");
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
}

function updateFileSelection() {
    const fileTreeSelection = document.getElementById('file-tree-selection');
    fileTreeSelection.innerHTML = '';

    function createSelectionNode(item, path = '') {
        const li = document.createElement('li');
        li.className = item.type;

        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = `${path}/${item.name}`;

        label.appendChild(checkbox);
        const span = document.createElement('span');
        span.textContent = item.name;
        label.appendChild(span);
        li.appendChild(label);

        if (item.type === 'folder') {
            const ul = document.createElement('ul');
            item.children.forEach(child => {
                const childNode = createSelectionNode(child, `${path}/${item.name}`);
                ul.appendChild(childNode);
            });
            li.appendChild(ul);

            span.addEventListener('click', (e) => {
                e.preventDefault();
                ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
            });

            checkbox.addEventListener('change', () => {
                const childCheckboxes = ul.querySelectorAll('input[type="checkbox"]');
                childCheckboxes.forEach(childBox => {
                    childBox.checked = checkbox.checked;
                });
            });
        }

        return li;
    }

    const rootUl = document.createElement('ul');
    files[0].children.forEach(child => {
        rootUl.appendChild(createSelectionNode(child, '/root'));
    });

    fileTreeSelection.appendChild(rootUl);
}

// Update the getSelectedFiles function
function getSelectedFiles() {
    const checkboxes = document.querySelectorAll('#file-tree-selection input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// Existing findFileByPath function
function findFileByPath(path) {
    const pathParts = path.split('/').filter(part => part !== '' && part !== 'root');
    let currentItem = files[0];

    for (const part of pathParts) {
        if (currentItem.type === 'folder') {
            currentItem = currentItem.children.find(child => child.name === part);
            if (!currentItem) return null;
        } else {
            return currentItem;
        }
    }

    return currentItem.type === 'file' ? currentItem : null;
}

sendButton.addEventListener("click", handleSend);
htmlButton.addEventListener("click", handleHtml);
cssButton.addEventListener("click", handleCss);
jsButton.addEventListener("click", handleJs);
readmeButton.addEventListener("click", handleReadme);
questionButton.addEventListener("click", handleQuestion);
implementationButton.addEventListener("click", handleImplementationAdvice);

// Attach event listeners to the input
userInput.addEventListener("input", autoResize);
userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        if (e.shiftKey) {
            // Shift+Enter: add a line break
            e.preventDefault();
            const cursorPosition = this.selectionStart;
            const currentValue = this.value;
            this.value =
                currentValue.slice(0, cursorPosition) +
                "\n" +
                currentValue.slice(cursorPosition);
            this.selectionStart = this.selectionEnd = cursorPosition + 1;
            autoResize.call(this);
        } else {
            // Enter without Shift: send the message
            e.preventDefault();
            handleSend();
        }
    }
});

function resetInputBox() {
    userInput.value = "";
    userInput.style.height = "auto";
    const lineHeight = parseInt(window.getComputedStyle(userInput).lineHeight);
    const minHeight = lineHeight * 2;
    userInput.style.height = minHeight + "px";
    userInput.style.overflowY = "hidden";
}

modeToggle.addEventListener("change", () => {
    const mode = modeToggle.checked ? "Smart" : "Quick";
    addMessage(`Switched to ${mode} mode (${getCurrentModel()})`, false);
});

uploadButton.addEventListener("click", function () {
    document.getElementById("file-upload").click();
});

document
    .getElementById("file-upload")
    .addEventListener("change", function (event) {
        const files = event.target.files;
        if (files.length > 0) {
            handleFileUpload(files);
        }
    });

limitContextCheckbox.addEventListener("change", function () {
    limitContext = this.checked;
    contextDepthInput.disabled = !limitContext;
    console.log(`Context limiting ${limitContext ? "enabled" : "disabled"}`);
});

contextDepthInput.addEventListener("change", function () {
    contextDepth = parseInt(this.value);
    console.log(`Context depth set to ${contextDepth}`);
});

// Add these variables at the top of your script
const sendCodeToggle = document.getElementById('send-code-toggle');
const fileSelection = document.getElementById('file-selection');
const fileCheckboxes = document.getElementById('file-checkboxes');

// Add this function to update the file checkboxes
function updateFileCheckboxes() {
  fileCheckboxes.innerHTML = '';
  files.forEach((file, index) => {
    const checkbox = document.createElement('div');
    checkbox.className = 'file-checkbox';
    checkbox.innerHTML = `
      <input type="checkbox" id="file-${index}" name="file-${index}" ${index === currentFileIndex ? 'checked' : ''}>
      <label for="file-${index}">${file.name}</label>
    `;
    fileCheckboxes.appendChild(checkbox);
  });
}

// Update the createNewFile function
function createNewFile() {
  const fileName = prompt('Enter file name:', 'untitled.js');
  if (fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    let language = 'javascript';
    if (fileExtension === 'html') language = 'html';
    else if (fileExtension === 'css') language = 'css';

    const newFile = { name: fileName, type: 'file', content: '', language: language };

    // For simplicity, we're adding the new file to the root folder
    // You can modify this to allow selecting a specific folder
    files[0].children.push(newFile);

    updateFileTree();
    openFile(`/root/${fileName}`);
  }
}

// Add an event listener for the send code toggle
sendCodeToggle.addEventListener('change', () => {
  fileSelection.style.display = sendCodeToggle.checked ? 'block' : 'none';
  // Adjust the chat container's bottom margin to make room for the file selection
  chatContainer.style.marginBottom = sendCodeToggle.checked ? '200px' : '100px';
  if (sendCodeToggle.checked) {
    updateFileSelection();
  }
});

// Update the handleSend function
async function handleSend() {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    addMessage(userMessage, true);
    const messageToBeSent = userMessage; // Store the message before clearing the input
    resetInputBox(); // Reset the input box after sending
    loadingSpinner.style.display = "flex";

    // Scroll to bottom after user message is added
    scrollToBottom();

    let contextString;
    if (limitContext) {
      const recentContext = conversation.slice(-contextDepth * 2);
      contextString = recentContext
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
    } else {
      contextString = conversation
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");
    }

    let prompt = `${contextString}\n\nHuman: ${messageToBeSent}\n\n`;

    // Add selected file contents to the prompt if the send code toggle is checked
    if (sendCodeToggle.checked) {
      const selectedFiles = getSelectedFiles();
      if (selectedFiles.length > 0) {
        prompt += "Selected Files:\n";
        selectedFiles.forEach(filePath => {
          const file = findFileByPath(filePath);
          if (file) {
            prompt += `File: ${filePath}\nContent:\n\`\`\`${file.language}\n${file.content}\n\`\`\`\n\n`;
          }
        });
      }
    }

    prompt += "Assistant: Please provide your response. If you include any code snippets, always wrap them in triple backticks (```) for proper formatting.";

    try {
      const response = await generateContent(prompt);
      addMessage(response);
    } catch (error) {
      console.error("Error:", error);
      addMessage(
        "An error occurred while generating the response. Please try again."
      );
    } finally {
      loadingSpinner.style.display = "none";
    }
  }
}

// Update the event listeners
sendButton.addEventListener("click", handleSend);

// Modify the keydown event listener for the input
userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      // Shift+Enter: add a line break
      e.preventDefault();
      const cursorPosition = this.selectionStart;
      const currentValue = this.value;
      this.value =
        currentValue.slice(0, cursorPosition) +
        "\n" +
        currentValue.slice(cursorPosition);
      this.selectionStart = this.selectionEnd = cursorPosition + 1;
      autoResize.call(this);
    } else {
      // Enter without Shift: send the message
      e.preventDefault();
      handleSend();
    }
  }
});

// Remove any other handleSend calls in the file that might be causing duplication

let monacoEditor;
let currentFileIndex = 0;
let files = [
    { 
        name: 'root', 
        type: 'folder', 
        children: [
            { name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>', language: 'html' },
            { name: 'styles', type: 'folder', children: [
                { name: 'main.css', type: 'file', content: 'body {\n  font-family: Arial, sans-serif;\n}', language: 'css' }
            ]},
            { name: 'scripts', type: 'folder', children: [
                { name: 'app.js', type: 'file', content: 'console.log("Hello, World!");', language: 'javascript' }
            ]}
        ]
    }
];

updateFileTree();

function initMonacoEditor() {
    require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs' }});

    require(['vs/editor/editor.main'], function() {
        // Check for saved theme preference or default to light mode
        const isDarkMode = localStorage.getItem("dark-mode") === "true";
        const theme = isDarkMode ? 'vs-dark' : 'vs-light';

        monacoEditor = monaco.editor.create(document.getElementById('monaco-editor'), {
            value: files[0].content,
            language: files[0].language,
            theme: theme,
            automaticLayout: true,
            minimap: { enabled: false }
        });

        updateFileTree();
        updateFileCheckboxes();

        // Add event listener for the new file button
        document.getElementById('new-file-button').addEventListener('click', createNewFile);

        // Add a resize observer to update the editor layout
        const resizeObserver = new ResizeObserver(() => {
            if (monacoEditor) {
                monacoEditor.layout();
            }
        });

        resizeObserver.observe(document.getElementById('editor-section'));

        // Ensure the editor layout is updated when the window is resized
        window.addEventListener('resize', function() {
            if (monacoEditor) {
                monacoEditor.layout();
            }
        });
    });
}

function updateFileTree() {
    const fileTree = document.getElementById('file-tree');
    fileTree.innerHTML = '';

    function createTreeNode(item, path = '') {
        if (!item) return; // Ensure the item is defined

        const li = document.createElement('li');
        li.className = item.type;
        li.setAttribute('data-path', `${path}/${item.name}`);

        if (item.type === 'folder') {
            const span = document.createElement('span');
            span.textContent = item.name;
            li.appendChild(span);

            const ul = document.createElement('ul');
            item.children.forEach(child => {
                if (child) {
                    const childNode = createTreeNode(child, `${path}/${item.name}`);
                    if (childNode) ul.appendChild(childNode); // Ensure childNode is defined
                }
            });
            li.appendChild(ul);

            // Set the initial open state
            if (item.isOpen) {
                li.classList.add('open');
            }

            span.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFolder(li);
                // Update the isOpen property when toggling
                item.isOpen = li.classList.contains('open');
            });
        } else {
            const fileExtension = item.name.split('.').pop().toLowerCase();
            li.setAttribute('data-ext', fileExtension);
            li.textContent = item.name;
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                selectFile(li);
                openFile(`${path}/${item.name}`);
            });
        }

        li.draggable = true;
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('dragleave', handleDragLeave);
        li.addEventListener('drop', handleDrop);

        return li;
    }

    const rootUl = document.createElement('ul');
    files[0].children.forEach(child => {
        rootUl.appendChild(createTreeNode(child, '/root'));
    });

    // Add an empty drop target to the root
    const emptyDropTarget = document.createElement('li');
    emptyDropTarget.className = 'empty-drop-target';
    emptyDropTarget.textContent = 'Drop files here';
    emptyDropTarget.setAttribute('data-path', '/root');
    rootUl.appendChild(emptyDropTarget);

    fileTree.appendChild(rootUl);
}

// Modify the toggleFolder function to update the isOpen property
function toggleFolder(folderElement) {
    folderElement.classList.toggle('open');
    const path = folderElement.getAttribute('data-path');
    const folder = findFolderByPath(path);
    if (folder) {
        folder.isOpen = folderElement.classList.contains('open');
    }
}

// Add this helper function to find a folder by its path
function findFolderByPath(path) {
    const pathParts = path.split('/').filter(part => part !== '' && part !== 'root');
    let currentItem = files[0];

    for (const part of pathParts) {
        if (currentItem.type === 'folder') {
            currentItem = currentItem.children.find(child => child.name === part);
            if (!currentItem) return null;
        } else {
            return null;
        }
    }

    return currentItem.type === 'folder' ? currentItem : null;
}

// Modify the openFile function to not call updateFileTree
function openFile(path) {
    console.log("Opening file:", path);
    const pathParts = path.split('/').filter(part => part !== '' && part !== 'root');
    let currentItem = files[0];

    for (const part of pathParts) {
        console.log("Searching for:", part);
        if (currentItem.type === 'folder') {
            currentItem = currentItem.children.find(child => child.name === part);
        } else {
            break;
        }
    }

    if (currentItem && currentItem.type === 'file') {
        console.log("File found:", currentItem);
        setEditorContent(currentItem.content, currentItem.language);
    } else {
        console.log("File not found");
    }
}

function createNewFolder() {
    const folderName = prompt('Enter folder name:', 'New Folder');
    if (folderName) {
        const newFolder = { name: folderName, type: 'folder', children: [] };
        files[0].children.push(newFolder);
        updateFileTree();
    }
}

function getEditorContent() {
    files[currentFileIndex].content = monacoEditor.getValue();
    return files.map(file => `File: ${file.name}\n\n${file.content}`).join('\n\n');
}

function setEditorContent(content, language) {
    console.log("Setting editor content:", content, language);
    if (monacoEditor) {
        monacoEditor.setValue(content);
        monaco.editor.setModelLanguage(monacoEditor.getModel(), language);
    } else {
        console.log("Monaco Editor not initialized");
    }
}

function moveFile(sourcePath, targetPath) {
    const sourcePathParts = sourcePath.split('/').filter(part => part !== '' && part !== 'root');
    const targetPathParts = targetPath.split('/').filter(part => part !== '' && part !== 'root');

    let sourceParent = files[0];
    let sourceItem;
    for (const part of sourcePathParts.slice(0, -1)) {
        sourceParent = sourceParent.children.find(child => child.name === part);
        if (!sourceParent) return; // Source parent not found
    }
    sourceItem = sourceParent.children.find(child => child.name === sourcePathParts[sourcePathParts.length - 1]);
    if (!sourceItem) return; // Source item not found

    let targetParent = files[0];
    for (const part of targetPathParts) {
        const nextParent = targetParent.children.find(child => child.name === part && child.type === 'folder');
        if (!nextParent) break;
        targetParent = nextParent;
    }

    // Check if the source is not being moved into itself or its own subfolder
    if (sourcePath === targetPath || targetPath.startsWith(sourcePath + '/')) {
        console.log("Cannot move a folder into itself or its subfolder");
        return;
    }

    // Remove the item from its current location
    sourceParent.children = sourceParent.children.filter(child => child !== sourceItem);

    // Add the item to its new location
    targetParent.children.push(sourceItem);

    updateFileTree();
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.getAttribute('data-path'));
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (e.target.classList.contains('folder')) {
        e.target.classList.add('drag-over');
    } else if (e.target.id === 'file-tree') {
        // Allow dropping on the root
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    e.target.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.target.classList.remove('drag-over');

    if (e.dataTransfer.types.includes('Files')) {
        // External file drop
        handleFileUpload(e.dataTransfer.files);
    } else {
        // Internal file move
        const sourcePath = e.dataTransfer.getData('text/plain');
        let targetPath;

        if (e.target.classList.contains('folder')) {
            targetPath = e.target.getAttribute('data-path');
        } else if (e.target.closest('.folder')) {
            targetPath = e.target.closest('.folder').getAttribute('data-path');
        } else if (e.target.classList.contains('empty-drop-target') || e.target.id === 'file-tree') {
            targetPath = '/root';
        } else {
            // Invalid drop target, do nothing
            return;
        }

        if (targetPath && targetPath !== sourcePath) {
            moveFile(sourcePath, targetPath);
            updateFileTree();
        }
    }
}

function handleFileUpload(fileList) {
    for (let file of fileList) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            let language = 'plaintext';
            if (fileExtension === 'html') language = 'html';
            else if (fileExtension === 'css') language = 'css';
            else if (fileExtension === 'js') language = 'javascript';

            const newFile = {
                name: file.name,
                type: 'file',
                content: e.target.result,
                language: language
            };

            files[0].children.push(newFile);
            updateFileTree();
            openFile(`/root/${file.name}`);
        };
        reader.readAsText(file);
    }
}

function selectFile(fileElement) {
    console.log("Selecting file:", fileElement);
    const filePath = fileElement.getAttribute('data-path');
    console.log("File path:", filePath);
    openFile(filePath);
}

// Make sure this event listener is present
document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
    });

    // Force layout update after a short delay
    setTimeout(() => {
        if (monacoEditor) {
            monacoEditor.layout();
        }
    }, 500);

    document.getElementById('new-file-button').addEventListener('click', createNewFile);
    document.getElementById('new-folder-button').addEventListener('click', createNewFolder);

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, preventDefaults, false);
        document.getElementById('file-tree').addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        document.getElementById('file-tree').addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        document.getElementById('file-tree').addEventListener(eventName, unhighlight, false);
    });

    // Handle drops
    document.getElementById('file-tree').addEventListener('drop', handleDrop, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    document.getElementById('file-tree').classList.add('highlight');
}

function unhighlight(e) {
    document.getElementById('file-tree').classList.remove('highlight');
}

// Initialize the chat
addMessage(
    "Hello! I'm here to help you with your project. What would you like to do?",
);
function initThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");

    // Check for saved theme preference or default to light mode
    if (localStorage.getItem("dark-mode") === "true") {
        document.body.classList.add("dark-mode");
        themeToggle.checked = true;
        if (monacoEditor) {
            monaco.editor.setTheme('vs-dark');
        }
    } else {
        if (monacoEditor) {
            monaco.editor.setTheme('vs-light');
        }
    }

    themeToggle.addEventListener("change", function () {
        if (this.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("dark-mode", "true");
            if (monacoEditor) {
                monaco.editor.setTheme('vs-dark');
            }
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("dark-mode", "false");
            if (monacoEditor) {
                monaco.editor.setTheme('vs-light');
            }
        }
    });
}

// Initialize theme toggle
initThemeToggle();

// Initialize Monaco Editor
initMonacoEditor();
